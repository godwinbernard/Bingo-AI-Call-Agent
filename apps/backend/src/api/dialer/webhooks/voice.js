const express = require('express');
const { generateTwiML } = require('../../../services/dialer/twilioVoiceService');

const router = express.Router();

router.post('/', (req, res) => {
  const twiml = generateTwiML({
    agentCallSid: req.query.agentId || req.body?.agentId || req.body?.CallSid || 'unknown',
    recordingEnabled: String(req.query.recordingEnabled || req.body?.recordingEnabled || 'true') !== 'false',
  });

  res.type('text/xml').send(twiml);
});

router.get('/', (req, res) => {
  const twiml = generateTwiML({
    agentCallSid: req.query.agentId || 'unknown',
    recordingEnabled: String(req.query.recordingEnabled || 'true') !== 'false',
  });
  res.type('text/xml').send(twiml);
});

module.exports = router;
