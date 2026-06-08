const { getActiveCalls, incrementActiveCalls, decrementActiveCalls } = require('../state/redisManager');

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_CALLS || '5', 10);
const RETRY_ATTEMPTS = parseInt(process.env.CALL_RETRY_ATTEMPTS || '2', 10);
const RETRY_DELAY_MS = parseInt(process.env.CALL_RETRY_DELAY_MS || '300000', 10);

class CallQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryMap = new Map(); // phone -> attempt count
  }

  enqueue(contact, campaignConfig) {
    this.queue.push({ contact, campaignConfig, enqueuedAt: Date.now() });
    if (!this.processing) this.processNext();
  }

  enqueueAll(contacts, campaignConfig) {
    for (const contact of contacts) {
      this.queue.push({ contact, campaignConfig, enqueuedAt: Date.now() });
    }
    if (!this.processing) this.processNext();
  }

  async processNext() {
    this.processing = true;

    while (this.queue.length > 0) {
      const active = await getActiveCalls();

      if (active >= MAX_CONCURRENT) {
        await sleep(2000);
        continue;
      }

      const item = this.queue.shift();
      if (!item) break;

      // Fire and forget — track active count via Redis
      this.dialContact(item).catch((err) => {
        console.error(`[Queue] Error dialing ${item.contact.phone}:`, err.message);
      });

      // Small gap between initiations to avoid burst
      await sleep(500);
    }

    this.processing = false;
  }

  async dialContact({ contact, campaignConfig }) {
    const { dialerService } = require('./dialerService');

    await incrementActiveCalls();
    try {
      await dialerService.initiateCall(contact, campaignConfig);
    } catch (err) {
      console.error(`[Queue] Call failed for ${contact.phone}:`, err.message);
      await this.scheduleRetry(contact, campaignConfig, err);
    } finally {
      await decrementActiveCalls();
    }
  }

  async scheduleRetry(contact, campaignConfig, error) {
    const attempts = this.retryMap.get(contact.phone) || 0;
    if (attempts < RETRY_ATTEMPTS) {
      this.retryMap.set(contact.phone, attempts + 1);
      console.log(`[Queue] Scheduling retry ${attempts + 1}/${RETRY_ATTEMPTS} for ${contact.phone} in ${RETRY_DELAY_MS / 1000}s`);
      setTimeout(() => {
        this.enqueue(contact, campaignConfig);
      }, RETRY_DELAY_MS);
    } else {
      console.log(`[Queue] Exhausted retries for ${contact.phone}`);
      this.retryMap.delete(contact.phone);
    }
  }

  getStatus() {
    return {
      queued: this.queue.length,
      processing: this.processing,
    };
  }

  clear() {
    this.queue = [];
    this.retryMap.clear();
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const callQueue = new CallQueue();
module.exports = { callQueue, CallQueue };
