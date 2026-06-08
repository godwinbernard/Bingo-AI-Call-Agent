const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const { ensureSchema, logCallStart, updateCallStatus } = require('../data/callLogger');
const { normalizeToE164 } = require('../data/csvParser');
const { buildVoicemailTwiML } = require('../caller/voicemailDetector');
const { buildPollyElement } = require('../voice/textToSpeech');

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

async function runDryCampaign({ csvPath, scriptPath, dncPath, campaignId = 'dry_run_campaign' }) {
  await ensureSchema();
  const rows = parse(fs.readFileSync(csvPath, 'utf8'), {
    columns: true,
    trim: true,
    skip_empty_lines: true,
  });
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
    total: rows.length,
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

  const outcomePlan = ['answered', 'answered', 'voicemail', 'no_answer'];
  let dialedIndex = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const normalizedPhone = normalizeToE164(row.phone) || row.phone;
    const contactName = row.name || row.first_name || row.phone;

    if (dncEntries.has(normalizedPhone)) {
      summary.skipped += 1;
      const skippedSid = `skipped_${campaignId}_${index}`;
      await logCallStart({
        callSid: skippedSid,
        campaignId,
        phoneNumber: row.phone,
        contactName,
      });
      await updateCallStatus(skippedSid, {
        status: 'completed',
        outcome: 'DNC',
        transcript: [],
        duration_seconds: 0,
      });
      continue;
    }

    const callOutcome = outcomePlan[dialedIndex] || 'answered';
    dialedIndex += 1;
    summary.dialed += 1;

    const callSid = `dry_${campaignId}_${index}`;
    await logCallStart({
      callSid,
      campaignId,
      phoneNumber: row.phone,
      contactName,
    });

    if (callOutcome === 'voicemail') {
      summary.voicemail += 1;
      buildVoicemailTwiML(script.voicemail_script || 'Please call back.');
      await updateCallStatus(callSid, {
        status: 'completed',
        outcome: 'voicemail',
        answering_machine: true,
        transcript: [],
        duration_seconds: 3,
      });
      continue;
    }

    if (callOutcome === 'no_answer') {
      summary.no_answer += 1;
      await updateCallStatus(callSid, {
        status: 'failed',
        outcome: 'no_answer',
        transcript: [],
        duration_seconds: 0,
      });
      continue;
    }

    summary.answered += 1;
    const userText = dialedIndex === 1 ? 'Yes that sounds good' : 'Not interested thanks';
    if (/not interested/i.test(userText)) {
      summary.rejected += 1;
      await updateCallStatus(callSid, {
        status: 'completed',
        outcome: 'rejected',
        transcript: [
          { role: 'user', content: userText },
          { role: 'assistant', content: 'Understood. I will close this out politely.' },
        ],
        duration_seconds: 6,
      });
      continue;
    }

    summary.success += 1;
    buildPollyElement(`Thanks for your time, ${contactName}. Goodbye.`);
    await updateCallStatus(callSid, {
      status: 'completed',
      outcome: 'success',
      transcript: [
        { role: 'user', content: userText },
        { role: 'assistant', content: 'Perfect! I will send the invite.' },
      ],
      duration_seconds: 8,
    });
  }

  return {
    summary,
    table: formatSummaryTable(summary),
  };
}

module.exports = { runDryCampaign, formatSummaryTable };
