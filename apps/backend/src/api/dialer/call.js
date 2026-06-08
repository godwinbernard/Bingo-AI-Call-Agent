const express = require('express');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { createCallLog } = require('../../services/dialer/callLogService');
const { initiateCall, holdCall, resumeCall, muteCall, transferCall, endCall } = require('../../services/dialer/twilioVoiceService');
const { getPrisma } = require('../../data/prisma');

const router = express.Router();

router.post('/', requireAuth, requireTenant, async (req, res) => {
  const { contactId, campaignId, recordingEnabled = true } = req.body || {};
  if (!contactId) {
    return res.status(400).json({ error: 'contactId is required' });
  }

  const prisma = getPrisma();
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      organization_id: req.organization.id,
    },
  });

  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const callSid = await initiateCall({
    to: contact.phone,
    from: process.env.TWILIO_CALLER_ID,
    agentId: req.member.id,
    contactId,
    campaignId,
    orgId: req.organization.id,
    recordingEnabled,
  });

  const call = await createCallLog({
    orgId: req.organization.id,
    agentId: req.member.id,
    contactId,
    campaignId,
    twilioCallSid: callSid,
    direction: 'OUTBOUND',
  });

  res.status(201).json({ callSid, callId: call.id });
});

router.get('/:id', requireAuth, requireTenant, async (req, res) => {
  const prisma = getPrisma();
  const call = await prisma.humanCall.findFirst({
    where: { id: req.params.id, org_id: req.organization.id },
    include: { transcript: { include: { segments: true } }, scorecard: true, segments: true, hints: true },
  });

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  res.json({ call });
});

router.patch('/:id', requireAuth, requireTenant, async (req, res) => {
  const { action, to, muted } = req.body || {};
  const prisma = getPrisma();
  const call = await prisma.humanCall.findFirst({
    where: { id: req.params.id, org_id: req.organization.id },
  });

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  let result = null;
  if (action === 'hold') result = await holdCall(call.twilio_call_sid);
  else if (action === 'resume') result = await resumeCall(call.twilio_call_sid);
  else if (action === 'mute') result = await muteCall(call.twilio_call_sid, Boolean(muted));
  else if (action === 'transfer') result = await transferCall(call.twilio_call_sid, to);
  else return res.status(400).json({ error: 'Unsupported action' });

  res.json({ success: true, result });
});

router.delete('/:id', requireAuth, requireTenant, async (req, res) => {
  const prisma = getPrisma();
  const call = await prisma.humanCall.findFirst({
    where: { id: req.params.id, org_id: req.organization.id },
  });

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  const result = await endCall(call.twilio_call_sid);
  res.json({ success: true, result });
});

module.exports = router;
