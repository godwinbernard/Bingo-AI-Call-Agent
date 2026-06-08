jest.mock('../../src/data/csvParser', () => ({
  parseCSV: jest.fn(),
}));

jest.mock('../../src/caller/callQueue', () => ({
  callQueue: {
    enqueueAll: jest.fn(),
    getStatus: jest.fn(() => ({ queued: 0, processing: false })),
    clear: jest.fn(),
  },
}));

jest.mock('../../src/data/callLogger', () => ({
  getCampaignStats: jest.fn(),
}));

const path = require('path');

const { parseCSV } = require('../../src/data/csvParser');
const { callQueue } = require('../../src/caller/callQueue');
const { getCampaignStats } = require('../../src/data/callLogger');
const app = require('../../src/server');

function createResponse(resolve) {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    text: '',
    set(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.text = JSON.stringify(payload);
      resolve({ status: this.statusCode, body: payload, text: this.text });
      return this;
    },
    send(payload) {
      this.body = payload;
      this.text = typeof payload === 'string' ? payload : JSON.stringify(payload);
      resolve({ status: this.statusCode, body: payload, text: this.text });
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      resolve({ status: code, body: undefined, text: '' });
      return this;
    },
  };
}

function findRouteLayer(appInstance, method, requestPath) {
  const lowerMethod = method.toLowerCase();
  return appInstance._router.stack.find((layer) => {
    if (!layer.route || !layer.route.methods[lowerMethod]) {
      return false;
    }

    const match = layer.regexp.exec(requestPath);
    if (!match) {
      return false;
    }

    layer.params = {};
    for (let index = 0; index < layer.keys.length; index += 1) {
      layer.params[layer.keys[index].name] = match[index + 1];
    }

    return true;
  });
}

async function invoke(appInstance, method, requestPath, body = {}) {
  return new Promise((resolve, reject) => {
    const layer = findRouteLayer(appInstance, method, requestPath);
    if (!layer) {
      resolve({ status: 404, body: { error: 'Not Found' }, text: 'Not Found' });
      return;
    }

    const req = {
      method,
      url: requestPath,
      path: requestPath,
      body,
      query: {},
      params: layer.params || {},
      headers: {},
    };

    const res = createResponse(resolve);
    Promise.resolve(layer.route.stack[0].handle(req, res)).catch(reject);
  });
}

function request(appInstance) {
  return {
    get: (requestPath) => invoke(appInstance, 'GET', requestPath),
    post: (requestPath) => ({
      send: (body) => invoke(appInstance, 'POST', requestPath, body),
    }),
  };
}

describe('campaign API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /start-campaign returns 200 with campaign_id', async () => {
    parseCSV.mockResolvedValue([{ name: 'Test User One', phone: '+15005550001', context: 'demo', campaign_id: 'test_camp' }]);

    const response = await request(app)
      .post('/start-campaign')
      .send({
        csv_path: path.join(__dirname, '../fixtures/test_numbers.csv'),
        script_path: path.join(__dirname, '../fixtures/test_script.json'),
        campaign_id: 'campaign-api-1',
      });

    expect(response.status).toBe(200);
    expect(response.body.campaign_id).toBe('campaign-api-1');
    expect(callQueue.enqueueAll).toHaveBeenCalledTimes(1);
  });

  test('POST /start-campaign returns 400 if csv_path missing', async () => {
    const response = await request(app)
      .post('/start-campaign')
      .send({ script_path: path.join(__dirname, '../fixtures/test_script.json') });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('csv_path');
  });

  test('POST /start-campaign returns 400 if script_path missing', async () => {
    const response = await request(app)
      .post('/start-campaign')
      .send({ csv_path: path.join(__dirname, '../fixtures/test_numbers.csv') });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('script_path');
  });

  test('POST /start-campaign returns 400 if CSV has no valid numbers', async () => {
    parseCSV.mockResolvedValue([]);

    const response = await request(app)
      .post('/start-campaign')
      .send({
        csv_path: path.join(__dirname, '../fixtures/test_numbers.csv'),
        script_path: path.join(__dirname, '../fixtures/test_script.json'),
        campaign_id: 'campaign-api-empty',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('No valid contacts');
  });

  test('POST /start-campaign returns 409 if campaign already running', async () => {
    parseCSV.mockResolvedValue([{ name: 'Test User One', phone: '+15005550001' }]);

    const body = {
      csv_path: path.join(__dirname, '../fixtures/test_numbers.csv'),
      script_path: path.join(__dirname, '../fixtures/test_script.json'),
      campaign_id: 'campaign-api-conflict',
    };

    const first = await request(app).post('/start-campaign').send(body);
    const second = await request(app).post('/start-campaign').send(body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(409);
    expect(second.body.error).toContain('already running');
  });

  test('GET /campaign/:id/status returns total, dialed, pending counts', async () => {
    getCampaignStats.mockResolvedValue({
      total: 5,
      completed: 2,
      failed: 1,
      voicemails: 1,
      avg_duration: 12.3,
    });

    const response = await request(app).get('/campaign/campaign-api-status/status');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(5);
    expect(response.body.completed).toBe(2);
    expect(response.body.failed).toBe(1);
  });

  test('GET /campaign/:id/status returns 404 for unknown campaign_id', async () => {
    getCampaignStats.mockResolvedValue({
      total: 0,
      completed: 0,
      failed: 0,
      voicemails: 0,
      avg_duration: null,
    });

    const response = await request(app).get('/campaign/unknown-campaign/status');
    expect(response.status).toBe(404);
  });

  test('POST /stop-campaign/:id returns 200 and stops queue', async () => {
    getCampaignStats.mockResolvedValue({
      total: 1,
      completed: 1,
      failed: 0,
      voicemails: 0,
      avg_duration: 5,
    });

    const response = await request(app).post('/stop-campaign/campaign-api-stop').send({});
    expect(response.status).toBe(200);
    expect(callQueue.clear).toHaveBeenCalledTimes(1);
  });

  test('POST /stop-campaign/:id returns 404 for unknown campaign_id', async () => {
    getCampaignStats.mockResolvedValue({
      total: 0,
      completed: 0,
      failed: 0,
      voicemails: 0,
      avg_duration: null,
    });

    const response = await request(app).post('/stop-campaign/unknown-campaign').send({});
    expect(response.status).toBe(404);
  });
});
