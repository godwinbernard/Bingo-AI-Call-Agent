const fs = require('fs');
const { parse } = require('csv-parse');

function normalizeToE164(raw) {
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

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ])
  );
}

function loadDncSet(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return new Set();
  }

  const entries = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => normalizeToE164(line.trim()))
    .filter(Boolean);

  return new Set(entries);
}

function validateRequiredColumns(headers, requiredColumns = []) {
  const normalizedHeaders = new Set(headers.map((header) => header.toLowerCase()));
  const missing = requiredColumns.filter((column) => !normalizedHeaders.has(column.toLowerCase()));
  return missing;
}

async function parseCSV(filePath, options = {}) {
  const {
    requiredColumns = ['phone'],
    dncFilePath,
    strictPhones = false,
  } = options;

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found: ${filePath}`));
    }

    const rawCsv = fs.readFileSync(filePath, 'utf8');
    if (!rawCsv.trim()) {
      return resolve([]);
    }

    const headerLine = rawCsv.split(/\r?\n/)[0] || '';
    const headers = headerLine.split(',').map((header) => header.trim());
    const missingColumns = validateRequiredColumns(headers, requiredColumns);
    if (missingColumns.length > 0) {
      return reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
    }

    const dncSet = loadDncSet(dncFilePath);
    const records = [];
    const errors = [];

    parse(rawCsv, { columns: true, trim: true, skip_empty_lines: true })
      .on('data', (row) => {
        const normalizedRow = normalizeRow(row);
        const rawPhone = row.phone || row.Phone || row.PHONE || row.phone_number;
        if (!rawPhone) {
          errors.push({ row: normalizedRow, reason: 'Missing phone field' });
          return;
        }

        const normalized = normalizeToE164(rawPhone);
        if (!normalized) {
          const error = { row: normalizedRow, reason: `Invalid phone number: ${rawPhone}` };
          errors.push(error);
          if (strictPhones) {
            return reject(new Error(error.reason));
          }
          return;
        }

        if (dncSet.has(normalized)) {
          return;
        }

        records.push({ ...normalizedRow, phone: normalized });
      })
      .on('error', reject)
      .on('end', () => {
        if (errors.length > 0) {
          console.warn(`[CSV] Skipped ${errors.length} invalid rows`);
        }
        console.log(`[CSV] Loaded ${records.length} valid contacts`);
        resolve(records);
      });
  });
}

module.exports = {
  parseCSV,
  normalizeToE164,
  normalizeRow,
  loadDncSet,
  validateRequiredColumns,
};
