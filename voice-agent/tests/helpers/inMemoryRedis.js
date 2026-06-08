class InMemoryRedis {
  constructor() {
    this.store = new Map();
  }

  on() {}

  async set(key, value) {
    this.store.set(key, String(value));
    return 'OK';
  }

  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async del(key) {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key) {
    const current = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, String(current));
    return current;
  }

  async decr(key) {
    const current = parseInt(this.store.get(key) || '0', 10) - 1;
    this.store.set(key, String(current));
    return current;
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    return 'OK';
  }
}

module.exports = { InMemoryRedis };
