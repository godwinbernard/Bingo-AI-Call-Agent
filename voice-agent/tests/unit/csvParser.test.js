const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseCSV, normalizeToE164, validateRequiredColumns } = require('../../src/data/csvParser');

function createTempFile(contents, suffix = '.csv') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-agent-csv-'));
  const filePath = path.join(dir, `input${suffix}`);
  fs.writeFileSync(filePath, contents);
  return { dir, filePath };
}

describe('csvParser', () => {
  test('parses valid CSV correctly', async () => {
    const { dir, filePath } = createTempFile([
      'name,phone,context,campaign_id',
      'Test One,+15005550001,demo,alpha',
      'Test Two,+15005550002,callback,alpha',
    ].join('\n'));

    await expect(parseCSV(filePath, { requiredColumns: ['name', 'phone', 'context', 'campaign_id'] }))
      .resolves.toEqual([
        { name: 'Test One', phone: '+15005550001', context: 'demo', campaign_id: 'alpha' },
        { name: 'Test Two', phone: '+15005550002', context: 'callback', campaign_id: 'alpha' },
      ]);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('rejects invalid phone number format when strict', async () => {
    const { dir, filePath } = createTempFile([
      'name,phone,context,campaign_id',
      'Bad Number,+1XXXXXXXXXX,invalid,alpha',
    ].join('\n'));

    await expect(
      parseCSV(filePath, { requiredColumns: ['name', 'phone', 'context', 'campaign_id'], strictPhones: true })
    ).rejects.toThrow('Invalid phone number');

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('filters DNC numbers before returning', async () => {
    const fixturePath = path.join(__dirname, '../fixtures/test_numbers.csv');
    const dncPath = path.join(__dirname, '../fixtures/test_dnc.txt');

    const records = await parseCSV(fixturePath, { dncFilePath: dncPath, requiredColumns: ['phone'] });
    expect(records).toHaveLength(3);
    expect(records.some((record) => record.phone === '+15005550003')).toBe(false);
  });

  test('handles empty CSV gracefully', async () => {
    const { dir, filePath } = createTempFile('');
    await expect(parseCSV(filePath)).resolves.toEqual([]);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('handles missing required columns', async () => {
    const { dir, filePath } = createTempFile([
      'name,context,campaign_id',
      'No Phone,missing,alpha',
    ].join('\n'));

    await expect(
      parseCSV(filePath, { requiredColumns: ['name', 'phone', 'context', 'campaign_id'] })
    ).rejects.toThrow('Missing required columns');

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('trims whitespace from all fields', async () => {
    const { dir, filePath } = createTempFile([
      'name,phone,context,campaign_id',
      '  Spaced User  ,  +15005550001  ,  demo call  ,  alpha  ',
    ].join('\n'));

    await expect(parseCSV(filePath)).resolves.toEqual([
      { name: 'Spaced User', phone: '+15005550001', context: 'demo call', campaign_id: 'alpha' },
    ]);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('handles 1000 row CSV without crashing', async () => {
    const rows = ['name,phone,context,campaign_id'];
    for (let index = 0; index < 1000; index += 1) {
      rows.push(`User ${index},+1500555${String(1000 + index).slice(-4)},context ${index},camp`);
    }

    const { dir, filePath } = createTempFile(rows.join('\n'));
    const records = await parseCSV(filePath);

    expect(records).toHaveLength(1000);
    expect(normalizeToE164('+15005550001')).toBe('+15005550001');
    expect(validateRequiredColumns(['name', 'phone'], ['name', 'phone'])).toEqual([]);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});
