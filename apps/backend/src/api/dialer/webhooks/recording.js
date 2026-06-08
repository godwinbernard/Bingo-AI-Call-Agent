const express = require('express');
const { getPrisma } = require('../../../data/prisma');
const { downloadRecording, deleteRecording } = require('../../../services/dialer/recordingService');
const { finalizeTranscript } = require('../../../services/transcript/transcriptService');

const router = express.Router();

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const recordingSid = req.body.RecordingSid || req.body.recordingSid;
  const callSid = req.body.CallSid || req.body.callSid;

  if (!recordingSid || !callSid) {
    return res.json({ ok: true });
  }

  const prisma = getPrisma();
  const call = await prisma.humanCall.findUnique({ where: { twilio_call_sid: callSid } });
  if (!call) {
    return res.json({ ok: true });
  }

  const uploaded = await downloadRecording(recordingSid, {
    orgId: call.org_id,
    callId: call.id,
  });

  await prisma.humanCall.update({
    where: { id: call.id },
    data: {
      recording_sid: recordingSid,
      recording_url: uploaded.s3Url,
      recording_duration: req.body.RecordingDuration ? Number(req.body.RecordingDuration) : null,
    },
  });

  await finalizeTranscript(call.id);
  await deleteRecording(recordingSid);

  res.json({ ok: true });
});

module.exports = router;
