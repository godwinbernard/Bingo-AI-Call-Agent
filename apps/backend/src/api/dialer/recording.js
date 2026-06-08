const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { getSignedUrl } = require('../../services/dialer/recordingService');

const router = express.Router();

router.get('/', requireAuth, requireTenant, async (req, res) => {
  const s3Key = req.query.key;
  if (!s3Key) {
    return res.status(400).json({ error: 'key is required' });
  }

  const storageRoot = process.env.RECORDINGS_DIR || path.join(require('os').tmpdir(), 'bingo-ai-recordings');
  const relativePath = String(s3Key).split('/').map((part) => decodeURIComponent(part));
  const filePath = path.join(storageRoot, ...relativePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Recording not found' });
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  return fs.createReadStream(filePath).pipe(res);
});

router.post('/:sid/sign', requireAuth, requireTenant, async (req, res) => {
  res.json({ url: getSignedUrl(`${req.organization.id}/${req.params.sid}.mp3`) });
});

module.exports = router;
