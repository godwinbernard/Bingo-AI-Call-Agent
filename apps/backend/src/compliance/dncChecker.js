const fs = require('fs');
const path = require('path');

// In-memory DNC set — replace with database lookup for production
let dncSet = new Set();
let loaded = false;

function normalizePhoneNumber(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;

  const digits = value.replace(/\D/g, '');
  if (value.startsWith('+') && digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  return null;
}

function loadDNCList(filePath) {
  const resolved = filePath || path.join(process.cwd(), 'inputs', 'dnc.txt');
  if (!fs.existsSync(resolved)) {
    console.log('[DNC] No DNC list file found, starting with empty list');
    loaded = true;
    return;
  }

  const lines = fs.readFileSync(resolved, 'utf8').split('\n');
  dncSet = new Set(lines.map((line) => normalizePhoneNumber(line)).filter(Boolean));
  loaded = true;
  console.log(`[DNC] Loaded ${dncSet.size} numbers`);
}

function isOnDNC(phoneNumber) {
  if (!loaded) loadDNCList();
  const normalized = normalizePhoneNumber(phoneNumber) || String(phoneNumber || '').trim();
  return dncSet.has(normalized);
}

function addToDNC(phoneNumber) {
  if (!loaded) loadDNCList();
  const normalized = normalizePhoneNumber(phoneNumber) || String(phoneNumber || '').trim();
  dncSet.add(normalized);
  console.log(`[DNC] Added ${normalized} to DNC list`);
}

// TCPA calling hours: 8am–9pm in the contact's local time zone
// This simplified version checks Eastern Time as a baseline
function isWithinTCPAHours(timezone = 'America/New_York') {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);
  return hour >= 8 && hour < 21;
}

function checkCompliance(phoneNumber, timezone) {
  const onDNC = isOnDNC(phoneNumber);
  const withinHours = isWithinTCPAHours(timezone);

  return {
    allowed: !onDNC && withinHours,
    onDNC,
    withinTCPAHours: withinHours,
    reason: onDNC
      ? 'Number is on DNC list'
      : !withinHours
      ? 'Outside TCPA calling hours (8am-9pm local)'
      : null,
  };
}

module.exports = {
  loadDNCList,
  isOnDNC,
  addToDNC,
  isWithinTCPAHours,
  checkCompliance,
  normalizePhoneNumber,
};
