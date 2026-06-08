const express = require('express');
const { updateCallStatus } = require('../../../services/dialer/callLogService');

const router = express.Router();

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const callSid = req.body.CallSid || req.body.callSid;
  const status = req.body.CallStatus || req.body.status;
  if (callSid && status) {
    await updateCallStatus(callSid, String(status).toUpperCase(), {
      durationSeconds: req.body.CallDuration ? Number(req.body.CallDuration) : undefined,
    });
  }

  res.json({ ok: true });
});

module.exports = router;
