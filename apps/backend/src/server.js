require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const { socketServer } = require('./socket/socketServer');
const { attachTwilioMediaStreamServer } = require('./socket/twilioMediaStream');

const { parseCSV } = require('./data/csvParser');
const { callQueue } = require('./caller/callQueue');
const { getCallSession, updateCallSession, appendConversationTurn, deleteCallSession } = require('./state/redisManager');
const { logCallStart, updateCallStatus, getCampaignStats, ensureSchema } = require('./data/callLogger');
const { generateResponse } = require('./conversation/claudeBrain');
const { buildGatherWithSay, buildPollyElement } = require('./voice/textToSpeech');
const { classifyAnswer, buildVoicemailTwiML } = require('./caller/voicemailDetector');
const { addToDNC } = require('./compliance/dncChecker');
const { processTwilioSpeechResult } = require('./voice/speechToText');
const { runDryCampaign } = require('./testing/dryRunService');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

const originalListen = app.listen.bind(app);
app.listen = function listenWithLocalhost(port, host, backlog, callback) {
  if (typeof host === 'function') {
    return originalListen(port, '127.0.0.1', host);
  }
  if (typeof backlog === 'function') {
    return originalListen(port, host || '127.0.0.1', backlog);
  }
  if (callback) {
    return originalListen(port, host || '127.0.0.1', backlog, callback);
  }
  return originalListen(port, host || '127.0.0.1', backlog);
};

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const runningCampaignIds = new Set();

app.use('/api/billing/checkout', require('./api/billing/checkout'));
app.use('/api/billing/portal', require('./api/billing/portal'));
app.use('/api/billing/webhook', require('./api/billing/webhook'));
app.use('/api/billing/usage', require('./api/billing/usage'));
app.use('/api/billing/invoices', require('./api/billing/invoices'));
app.use('/api/admin', require('./api/admin'));
app.use('/api/team/invite', require('./api/team/invite'));
app.use('/api/team/invitations', require('./api/team/invitations'));
app.use('/api/team/members', require('./api/team/members'));
app.use('/api/team/roles', require('./api/team/roles'));
app.use('/api/api-keys', require('./api/apiKeys'));
app.use('/api/dialer/token', require('./api/dialer/token'));
app.use('/api/dialer/session', require('./api/dialer/session'));
app.use('/api/dialer/call', require('./api/dialer/call'));
app.use('/api/dialer/call', require('./api/dialer/callOutcome'));
app.use('/api/dialer/scorecard', require('./api/dialer/scorecard'));
app.use('/api/dialer/recording', require('./api/dialer/recording'));
app.use('/api/dialer/webhooks/voice', require('./api/dialer/webhooks/voice'));
app.use('/api/dialer/webhooks/status', require('./api/dialer/webhooks/status'));
app.use('/api/dialer/webhooks/recording', require('./api/dialer/webhooks/recording'));

async function startCampaign(req, res) {
  try {
    const {
      csv_path = 'inputs/numbers.csv',
      script_path = 'inputs/script.json',
      campaign_id,
    } = req.body;

    const absoluteCsv = path.isAbsolute(csv_path) ? csv_path : path.join(process.cwd(), csv_path);
    const absoluteScript = path.isAbsolute(script_path) ? script_path : path.join(process.cwd(), script_path);

    const contacts = await parseCSV(absoluteCsv);
    const script = require(absoluteScript);
    const campaignId = campaign_id || `campaign_${Date.now()}`;

    if (runningCampaignIds.has(campaignId)) {
      return res.status(409).json({ error: 'Campaign already running', campaign_id: campaignId });
    }

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No valid contacts found in CSV' });
    }

    runningCampaignIds.add(campaignId);
    callQueue.enqueueAll(contacts, { script, campaignId });

    console.log(`[Server] Campaign ${campaignId} started with ${contacts.length} contacts`);
    res.json({
      success: true,
      campaign_id: campaignId,
      contacts_queued: contacts.length,
      queue_status: callQueue.getStatus(),
    });
  } catch (err) {
    console.error('[Server] Campaign start error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function startCampaignStrict(req, res) {
  try {
    const { csv_path, script_path, campaign_id } = req.body;
    if (!csv_path) {
      return res.status(400).json({ error: 'csv_path is required' });
    }
    if (!script_path) {
      return res.status(400).json({ error: 'script_path is required' });
    }

    const absoluteCsv = path.isAbsolute(csv_path) ? csv_path : path.join(process.cwd(), csv_path);
    const absoluteScript = path.isAbsolute(script_path) ? script_path : path.join(process.cwd(), script_path);
    const contacts = await parseCSV(absoluteCsv);
    const script = require(absoluteScript);
    const campaignId = campaign_id || `campaign_${Date.now()}`;

    if (runningCampaignIds.has(campaignId)) {
      return res.status(409).json({ error: 'Campaign already running', campaign_id: campaignId });
    }

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No valid contacts found in CSV' });
    }

    runningCampaignIds.add(campaignId);
    callQueue.enqueueAll(contacts, { script, campaignId });

    return res.json({
      success: true,
      campaign_id: campaignId,
      contacts_queued: contacts.length,
      queue_status: callQueue.getStatus(),
    });
  } catch (err) {
    console.error('[Server] Campaign start error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// ─── Campaign Management ───────────────────────────────────────────────

// POST /campaign/start — launch a campaign from CSV + script
app.post('/campaign/start', startCampaign);
app.post('/start-campaign', startCampaignStrict);

// GET /campaign/status — current queue and active call count
app.get('/campaign/status', async (req, res) => {
  const { getActiveCalls } = require('./state/redisManager');
  const active = await getActiveCalls();
  res.json({ active_calls: active, ...callQueue.getStatus() });
});

// GET /campaign/stats/:id — PostgreSQL campaign summary
app.get('/campaign/stats/:id', async (req, res) => {
  try {
    const stats = await getCampaignStats(req.params.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/campaign/:id/status', async (req, res) => {
  try {
    const stats = await getCampaignStats(req.params.id);
    if (Number(stats.total || 0) === 0) {
      return res.status(404).json({ error: 'Unknown campaign_id' });
    }
    res.json({
      campaign_id: req.params.id,
      total: Number(stats.total || 0),
      completed: Number(stats.completed || 0),
      failed: Number(stats.failed || 0),
      voicemails: Number(stats.voicemails || 0),
      avg_duration: stats.avg_duration,
      ...callQueue.getStatus(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaign/stop — drain the queue
app.post('/campaign/stop', (req, res) => {
  runningCampaignIds.clear();
  callQueue.clear();
  res.json({ success: true, message: 'Queue cleared. Active calls will complete.' });
});

app.post('/stop-campaign/:id', async (req, res) => {
  try {
    const stats = await getCampaignStats(req.params.id);
    if (Number(stats.total || 0) === 0) {
      return res.status(404).json({ error: 'Unknown campaign_id' });
    }
    runningCampaignIds.delete(req.params.id);
    callQueue.clear();
    res.json({ success: true, campaign_id: req.params.id, message: 'Queue cleared. Active calls will complete.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/campaign/dry-run', async (req, res) => {
  try {
    const {
      csv_path,
      script_path,
      dnc_path = path.join(process.cwd(), 'inputs', 'dnc.txt'),
      campaign_id,
    } = req.body;
    const dryRunCampaignId = campaign_id || `dry_run_${Date.now()}`;

    if (!csv_path) {
      return res.status(400).json({ error: 'csv_path is required' });
    }
    if (!script_path) {
      return res.status(400).json({ error: 'script_path is required' });
    }

    const absoluteCsv = path.isAbsolute(csv_path) ? csv_path : path.join(process.cwd(), csv_path);
    const absoluteScript = path.isAbsolute(script_path) ? script_path : path.join(process.cwd(), script_path);
    const absoluteDnc = path.isAbsolute(dnc_path) ? dnc_path : path.join(process.cwd(), dnc_path);

    const result = await runDryCampaign({
      csvPath: absoluteCsv,
      scriptPath: absoluteScript,
      dncPath: absoluteDnc,
      campaignId: dryRunCampaignId,
    });

    res.json({
      success: true,
      campaign_id: dryRunCampaignId,
      ...result,
    });
  } catch (err) {
    console.error('[Server] Dry run error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Twilio Webhooks ───────────────────────────────────────────────────

// POST /webhook/answer — called when the outbound call connects
app.post('/webhook/answer', async (req, res) => {
  const callSid = req.body.CallSid;
  const answeredBy = req.body.AnsweredBy;

  res.set('Content-Type', 'text/xml');

  try {
    const session = await getCallSession(callSid);
    if (!session) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
    }

    // If AMD already flagged this as a machine
    if (answeredBy && classifyAnswer(answeredBy) === 'voicemail') {
      const twiml = buildVoicemailTwiML(session.voicemailText);
      await updateCallStatus(callSid, { status: 'completed', answering_machine: true, outcome: 'voicemail' });
      return res.send(twiml);
    }

    // Human answered — speak opening and listen
    const gatherUrl = `${BASE_URL}/webhook/gather?callSid=${callSid}`;
    const twiml = buildGatherWithSay(session.openingMessage, gatherUrl);

    await updateCallSession(callSid, { status: 'in_progress' });
    await updateCallStatus(callSid, { status: 'in_progress' });
    await appendConversationTurn(callSid, 'assistant', session.openingMessage);

    res.send(twiml);
  } catch (err) {
    console.error('[Webhook/answer] Error:', err.message);
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
  }
});

// POST /webhook/gather — receives transcribed speech from Twilio Gather
app.post('/webhook/gather', async (req, res) => {
  const callSid = req.query.callSid || req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  const confidence = req.body.Confidence || '0';
  const timedOut = req.query.timeout === 'true';

  res.set('Content-Type', 'text/xml');

  try {
    const session = await getCallSession(callSid);
    if (!session) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
    }

    const gatherUrl = `${BASE_URL}/webhook/gather?callSid=${callSid}`;

    // Handle silence/timeout
    if (timedOut || !speechResult.trim()) {
      const silenceResponse = "I'm sorry, I didn't quite catch that. Could you say that again?";
      return res.send(buildGatherWithSay(silenceResponse, gatherUrl));
    }

    const stt = processTwilioSpeechResult(speechResult, confidence);
    console.log(`[Gather] ${callSid} | "${stt.text}" (confidence: ${stt.confidence.toFixed(2)})`);

    // Add user turn to session
    await appendConversationTurn(callSid, 'user', stt.text);
    const updatedSession = await getCallSession(callSid);
    const newTurnCount = (updatedSession.turnCount || 0) + 1;
    await updateCallSession(callSid, { turnCount: newTurnCount });

    // Generate Claude response
    const result = await generateResponse(
      { ...updatedSession, turnCount: newTurnCount },
      stt.text
    );

    await appendConversationTurn(callSid, 'assistant', result.text);

    // Handle DNC removal request
    if (result.shouldEnd && result.outcome === 'dnc_requested') {
      addToDNC(session.contact.phone);
    }

    if (result.shouldEnd) {
      const sayEl = buildPollyElement(result.text);
      await updateCallStatus(callSid, {
        status: 'completed',
        outcome: result.outcome || 'completed',
        transcript: updatedSession.messages,
      });
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${sayEl}<Hangup/></Response>`);
    }

    res.send(buildGatherWithSay(result.text, gatherUrl));
  } catch (err) {
    console.error('[Webhook/gather] Error:', err.message);
    const fallback = "I apologize for the interruption. Thank you for your time, goodbye!";
    const sayEl = buildPollyElement(fallback);
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${sayEl}<Hangup/></Response>`);
  }
});

// POST /webhook/amd — async AMD result from Twilio
app.post('/webhook/amd', async (req, res) => {
  const callSid = req.body.CallSid;
  const answeredBy = req.body.AnsweredBy;

  console.log(`[AMD] ${callSid} → ${answeredBy}`);
  const type = classifyAnswer(answeredBy);

  if (type === 'voicemail') {
    try {
      const session = await getCallSession(callSid);
      if (session) {
        // Redirect the call to leave voicemail TwiML
        const client = require('./caller/dialerService').getClient();
        await client.calls(callSid).update({
          url: `${BASE_URL}/webhook/voicemail?callSid=${callSid}`,
          method: 'POST',
        });
      }
    } catch (err) {
      console.error('[AMD] Redirect error:', err.message);
    }
  }

  res.sendStatus(204);
});

// POST /webhook/voicemail — serve voicemail TwiML
app.post('/webhook/voicemail', async (req, res) => {
  const callSid = req.query.callSid || req.body.CallSid;
  res.set('Content-Type', 'text/xml');

  try {
    const session = await getCallSession(callSid);
    if (!session) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
    }

    const twiml = buildVoicemailTwiML(session.voicemailText);
    await updateCallStatus(callSid, { status: 'completed', answering_machine: true, outcome: 'voicemail' });
    res.send(twiml);
  } catch (err) {
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`);
  }
});

// POST /webhook/status — call lifecycle events from Twilio
app.post('/webhook/status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  console.log(`[Status] ${CallSid} → ${CallStatus}${CallDuration ? ` (${CallDuration}s)` : ''}`);

  try {
    if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'no-answer' || CallStatus === 'busy') {
      const session = await getCallSession(CallSid);
      await updateCallStatus(CallSid, {
        status: CallStatus,
        duration_seconds: parseInt(CallDuration || '0', 10),
        transcript: session?.messages || [],
      });
      await deleteCallSession(CallSid);
    }
  } catch (err) {
    console.error('[Status] Error:', err.message);
  }

  res.sendStatus(204);
});

// ─── Health Check ──────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Boot ──────────────────────────────────────────────────────────────

async function start() {
  try {
    await ensureSchema();
    console.log('[DB] Schema verified');
  } catch (err) {
    console.warn('[DB] Schema setup failed (PostgreSQL may not be running):', err.message);
  }

  // Create HTTP server so socket.io and WS can share the same port
  const httpServer = http.createServer(app);

  // Initialize socket.io
  socketServer.initialize(httpServer);

  // Attach Twilio Media Stream WebSocket server
  attachTwilioMediaStreamServer(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n Voice AI Agent running on port ${PORT}`);
    console.log(` Base URL: ${BASE_URL}`);
    console.log(` Socket.io: ws://${BASE_URL}`);
    console.log(` Media stream: ws://${BASE_URL}/api/dialer/stream\n`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
module.exports.start = start;
