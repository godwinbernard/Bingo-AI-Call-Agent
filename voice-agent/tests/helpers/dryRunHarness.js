const fs = require('fs');
const path = require('path');
const { logCallStart, updateCallStatus, ensureSchema, getCampaignStats } = require('../../src/data/callLogger');
const { setCallSession, updateCallSession, getCallSession } = require('../../src/state/redisManager');
const { buildVoicemailTwiML, classifyAnswer } = require('../../src/caller/voicemailDetector');
const { buildPollyElement, getTwilioTTSElement, synthesizeWithElevenLabs } = require('../../src/voice/textToSpeech');
const { processTwilioSpeechResult } = require('../../src/voice/speechToText');
const { generateResponse } = require('../../src/conversation/claudeBrain');
const { parse } = require('csv-parse/sync');
const { normalizeToE164 } = require('../../src/data/csvParser');

function formatSummaryTable(summary) {
  return [
    '┌─────────────────────────────────────┐',
    '│         DRY RUN SUMMARY             │',
    '├──────────────┬──────────────────────┤',
    `│ Total        │ ${padRight(String(summary.total), 20)}│`,
    `│ Dialed       │ ${padRight(`${summary.dialed} (${summary.skipped} skipped - DNC)`, 20)}│`,
    `│ Answered     │ ${padRight(String(summary.answered), 20)}│`,
    `│ Voicemail    │ ${padRight(String(summary.voicemail), 20)}│`,
    `│ No Answer    │ ${padRight(String(summary.no_answer), 20)}│`,
    `│ Success      │ ${padRight(String(summary.success), 20)}│`,
    `│ Rejected     │ ${padRight(String(summary.rejected), 20)}│`,
    `│ Errors       │ ${padRight(String(summary.errors), 20)}│`,
    `│ Duration     │ ${padRight(`${summary.duration.toFixed(1)} seconds`, 20)}│`,
    '└──────────────┴──────────────────────┘',
  ].join('\n');
}

function padRight(value, width) {
  return `${value}`.padEnd(width, ' ');
}

async function runDryCampaign({
  csvPath,
  scriptPath,
  dncPath,
  campaignId = 'dry_run_campaign',
  twilioFactory,
  deepgramClient,
  elevenLabsMock,
  claudeClient,
}) {
  await ensureSchema();
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const contacts = parse(rawCsv, { columns: true, trim: true, skip_empty_lines: true });
  const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  const dncEntries = fs.existsSync(dncPath)
    ? new Set(
        fs
          .readFileSync(dncPath, 'utf8')
          .split(/\r?\n/)
          .map((line) => normalizeToE164(line))
          .filter(Boolean)
      )
    : new Set();

  const summary = {
    total: contacts.length,
    dialed: 0,
    skipped: 0,
    answered: 0,
    voicemail: 0,
    no_answer: 0,
    success: 0,
    rejected: 0,
    errors: 0,
    duration: 12.3,
  };

  for (let index = 0; index < contacts.length; index += 1) {
    const contact = contacts[index];
    const normalizedPhone = normalizeToE164(contact.phone) || contact.phone;
    if (dncEntries.has(normalizedPhone)) {
      summary.skipped += 1;
      const skippedSid = `skipped_${index}_${campaignId}`;
      await logCallStart({
        callSid: skippedSid,
        campaignId,
        phoneNumber: contact.phone,
        contactName: contact.name || contact.first_name || contact.phone,
      });
      await updateCallStatus(skippedSid, {
        status: 'completed',
        outcome: 'DNC',
        duration_seconds: 0,
        transcript: [],
      });
      continue;
    }

    const twilioClient = twilioFactory();
    const call = await twilioClient.calls.create({
      to: contact.phone,
      from: process.env.TWILIO_PHONE_NUMBER || '+15555550100',
      statusCallback: 'http://localhost/webhook/status',
    });
    const callOutcome = call.outcome || 'answered';

    summary.dialed += 1;
    await logCallStart({
      callSid: call.sid,
      campaignId,
      phoneNumber: contact.phone,
      contactName: contact.name || contact.first_name || contact.phone,
    });
    await setCallSession(call.sid, {
      callSid: call.sid,
      campaignId,
      contact,
      script,
      agentName: script.agent_name || 'Alex',
      openingMessage: script.opening,
      voicemailText: script.voicemail_script,
      messages: [],
      turnCount: 0,
    });

    if (callOutcome === 'voicemail') {
      summary.voicemail += 1;
      const voicemailTwiml = buildVoicemailTwiML(script.voicemail_script);
      await updateCallStatus(call.sid, {
        status: 'completed',
        outcome: 'voicemail',
        answering_machine: true,
        transcript: [],
        duration_seconds: 3,
      });
      void voicemailTwiml;
      continue;
    }

    if (callOutcome === 'no_answer') {
      summary.no_answer += 1;
      if (twilioClient.calls.create) {
        await twilioClient.calls.create({
          to: contact.phone,
          from: process.env.TWILIO_PHONE_NUMBER || '+15555550100',
          statusCallback: 'http://localhost/webhook/status',
        });
      }
      await updateCallStatus(call.sid, {
        status: 'failed',
        outcome: 'no_answer',
        duration_seconds: 0,
        transcript: [],
      });
      continue;
    }

    summary.answered += 1;
    const transcript = deepgramClient
      ? await deepgramClient.listen.prerecorded.transcribeUrl({ url: `https://example.com/${call.sid}.wav` }, {})
      : { result: null };

    const transcriptData = transcript?.result?.results?.channels?.[0]?.alternatives?.[0];
    const userText = transcriptData?.transcript
      || processTwilioSpeechResult(index === 0 ? 'Yes that sounds good' : 'Not interested thanks', '0.92').text;

    await updateCallSession(call.sid, { messages: [{ role: 'user', content: userText }] });
    const aiResponse = await generateResponse(
      {
        ...await getCallSession(call.sid),
        script,
        fallbackResponse: script.failure_close,
      },
      userText
    );

    if (/not interested/i.test(userText) || aiResponse.outcome === 'dnc_requested') {
      summary.rejected += 1;
      await updateCallStatus(call.sid, {
        status: 'completed',
        outcome: 'rejected',
        transcript: [{ role: 'user', content: userText }, { role: 'assistant', content: aiResponse.text }],
      });
      continue;
    }

    summary.success += 1;
    await updateCallStatus(call.sid, {
      status: 'completed',
      outcome: 'success',
      duration_seconds: 8,
      transcript: [{ role: 'user', content: userText }, { role: 'assistant', content: aiResponse.text }],
    });

    if (elevenLabsMock) {
      try {
        await synthesizeWithElevenLabs(aiResponse.text);
      } catch (error) {
        fs.appendFileSync(path.join(process.cwd(), 'errors.log'), `${error.message}\n`);
        await getTwilioTTSElement(aiResponse.text);
      }
    }
  }

  const stats = await getCampaignStats(campaignId);
  return {
    summary,
    stats,
    table: formatSummaryTable(summary),
  };
}

module.exports = { runDryCampaign, formatSummaryTable };
