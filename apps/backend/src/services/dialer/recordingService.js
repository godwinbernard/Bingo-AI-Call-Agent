const fs = require('fs');
const path = require('path');
const os = require('os');
const twilio = require('twilio');
const crypto = require('crypto');

let client = null;

function getClient() {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

function getStorageDir() {
  return process.env.RECORDINGS_DIR || path.join(os.tmpdir(), 'bingo-ai-recordings');
}

function ensureStorageDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hasAwsCredentials() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_RECORDINGS_BUCKET
  );
}

function hashSha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmacSha256(key, value, encoding = undefined) {
  return crypto.createHmac('sha256', key).update(value).digest(encoding);
}

function getAwsSigningKey(secretKey, dateStamp, region, service = 's3') {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}

function buildS3Key(orgId, callId, recordingSid) {
  return `${orgId || 'unknown'}/${callId || recordingSid}.mp3`;
}

function buildS3Url(bucket, region, key) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
}

async function uploadBufferToS3(buffer, key, contentType = 'audio/mpeg') {
  const bucket = process.env.AWS_S3_RECORDINGS_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  const payloadHash = hashSha256(buffer);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join('\n');
  const signingKey = getAwsSigningKey(secretKey, dateStamp, region, 's3');
  const signature = hmacSha256(signingKey, stringToSign, 'hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(buildS3Url(bucket, region, key), {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}`);
  }

  return {
    s3Key: key,
    s3Url: buildS3Url(bucket, region, key),
  };
}

function buildPresignedGetUrl(bucket, region, key, expiresSeconds = 3600) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const algorithm = 'AWS4-HMAC-SHA256';
  const canonicalUri = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  const credential = encodeURIComponent(`${accessKey}/${credentialScope}`);
  const queryParts = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${credential}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresSeconds}`,
    `X-Amz-SignedHeaders=host`,
  ];
  const canonicalQueryString = queryParts.sort().join('&');
  const canonicalHeaders = `host:${bucket}.s3.${region}.amazonaws.com\n`;
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join('\n');
  const signingKey = getAwsSigningKey(secretKey, dateStamp, region, 's3');
  const signature = hmacSha256(signingKey, stringToSign, 'hex');
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

async function getRecording(recordingSid) {
  const recording = await getClient().recordings(recordingSid).fetch();
  return {
    url: recording.uri ? `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}` : recording.mediaUrl || null,
    duration: Number(recording.duration || 0),
    recording,
  };
}

async function waitForRecording(callSid) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 120000) {
    const recordings = await getClient().recordings.list({ callSid, limit: 1 });
    if (recordings && recordings.length > 0) {
      return getRecording(recordings[0].sid);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Timed out waiting for recording for call ${callSid}`);
}

async function downloadRecording(recordingSid, { orgId, callId } = {}) {
  const { url } = await getRecording(recordingSid);
  if (!url) {
    throw new Error(`Recording ${recordingSid} has no downloadable URL`);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download recording ${recordingSid}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const key = buildS3Key(orgId, callId, recordingSid);

  if (hasAwsCredentials()) {
    return uploadBufferToS3(buffer, key, 'audio/mpeg');
  }

  const storageDir = path.join(getStorageDir(), orgId || 'unknown');
  ensureStorageDir(storageDir);
  const filePath = path.join(storageDir, `${callId || recordingSid}.mp3`);
  fs.writeFileSync(filePath, buffer);

  return {
    s3Key: key,
    s3Url: `file://${filePath}`,
    filePath,
  };
}

async function deleteRecording(recordingSid) {
  return getClient().recordings(recordingSid).remove();
}

function getSignedUrl(s3Key) {
  if (hasAwsCredentials()) {
    return buildPresignedGetUrl(
      process.env.AWS_S3_RECORDINGS_BUCKET,
      process.env.AWS_REGION,
      s3Key,
      3600
    );
  }

  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  return `${process.env.BASE_URL || 'http://localhost:3000'}/api/dialer/recording?key=${encodeURIComponent(s3Key)}&expires=${encodeURIComponent(expiresAt)}`;
}

module.exports = {
  getRecording,
  waitForRecording,
  downloadRecording,
  deleteRecording,
  getSignedUrl,
  getClient,
};
