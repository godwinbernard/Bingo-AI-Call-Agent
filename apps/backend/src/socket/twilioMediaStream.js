const { WebSocketServer } = require('ws');
const { DeepgramStreamService } = require('../services/transcript/deepgramStreamService');
const { socketServer } = require('./socketServer');

// Active deepgram connections keyed by callSid
const activeStreams = new Map();

function attachTwilioMediaStreamServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/api/dialer/stream' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `ws://localhost`);
    const callSid = url.searchParams.get('callSid');

    if (!callSid) {
      ws.close(1008, 'callSid required');
      return;
    }

    console.log(`[MediaStream] connected callSid=${callSid}`);

    // Resolve internal callId from the callSid stored in DB (fallback: use callSid directly)
    const callId = callSid;
    const deepgram = new DeepgramStreamService(callId, socketServer.getIo());

    deepgram.connect().then(() => {
      activeStreams.set(callSid, deepgram);
      socketServer.emitCallStatusChange(callId, 'streaming');
    }).catch((err) => {
      console.error(`[MediaStream] Deepgram connect error: ${err.message}`);
      ws.close(1011, 'Deepgram connection failed');
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        if (msg.event === 'connected') {
          console.log(`[MediaStream] Twilio stream connected`);
          return;
        }

        if (msg.event === 'start') {
          console.log(`[MediaStream] Stream started: stream=${msg.streamSid}`);
          return;
        }

        if (msg.event === 'media') {
          // Twilio sends base64-encoded mulaw audio
          const audioBuffer = Buffer.from(msg.media.payload, 'base64');
          deepgram.sendAudio(audioBuffer);
          return;
        }

        if (msg.event === 'stop') {
          console.log(`[MediaStream] Stream stopped callSid=${callSid}`);
          handleStreamEnd(callSid, callId, deepgram);
          ws.close();
        }
      } catch (err) {
        // Binary frame — send directly
        if (Buffer.isBuffer(data)) {
          deepgram.sendAudio(data);
        }
      }
    });

    ws.on('close', () => {
      console.log(`[MediaStream] ws closed callSid=${callSid}`);
      handleStreamEnd(callSid, callId, deepgram);
    });

    ws.on('error', (err) => {
      console.error(`[MediaStream] ws error callSid=${callSid}: ${err.message}`);
    });
  });

  console.log('[MediaStream] WebSocket server attached at /api/dialer/stream');
  return wss;
}

async function handleStreamEnd(callSid, callId, deepgram) {
  if (!activeStreams.has(callSid)) return;
  activeStreams.delete(callSid);

  await deepgram.disconnect();
  socketServer.emitCallStatusChange(callId, 'stream_ended');

  // Trigger scorecard generation asynchronously
  setImmediate(async () => {
    try {
      const { generateScorecard } = require('../services/ai/scorecardGenerator');
      await generateScorecard(callId);
    } catch (err) {
      console.error(`[MediaStream] Scorecard generation failed: ${err.message}`);
    }
  });
}

module.exports = { attachTwilioMediaStreamServer };
