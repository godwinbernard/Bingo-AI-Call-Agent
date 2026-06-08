const fs = require('fs');
const os = require('os');
const path = require('path');

function createTempFile(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-agent-dnc-'));
  const filePath = path.join(dir, 'dnc.txt');
  fs.writeFileSync(filePath, contents);
  return { dir, filePath };
}

describe('dncChecker', () => {
  function loadChecker() {
    return require('../../src/compliance/dncChecker');
  }

  afterEach(() => {
    jest.resetModules();
  });

  test('loads DNC list from file correctly', () => {
    const { filePath, dir } = createTempFile('+15005550003\n');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('+15005550003')).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('returns true for number on DNC list', () => {
    const { filePath, dir } = createTempFile('+15005550003\n');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('(150) 055-50003')).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('returns false for clean number', () => {
    const { filePath, dir } = createTempFile('+15005550003\n');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('+15005550004')).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('handles empty DNC file', () => {
    const { filePath, dir } = createTempFile('');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('+15005550003')).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('handles malformed numbers in DNC file', () => {
    const { filePath, dir } = createTempFile('bad-number\n+15005550003\n');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('+15005550003')).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('is case insensitive to formatting', () => {
    const { filePath, dir } = createTempFile('+1 (500) 555-0003\n');
    const { loadDNCList, isOnDNC } = loadChecker();

    loadDNCList(filePath);
    expect(isOnDNC('+15005550003')).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});
