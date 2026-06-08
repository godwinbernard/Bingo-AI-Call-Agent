# Voice AI Agent

Automated outbound calling system using Twilio, Deepgram, ElevenLabs, Claude (claude-haiku-4-5), Redis, and PostgreSQL.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start required services
- Redis: `redis-server`
- PostgreSQL: ensure your DATABASE_URL is reachable
- ngrok (for local dev): `ngrok http 3000` → set BASE_URL in .env

### 4. Start the server
```bash
npm start
```

## Usage

### Start a campaign
```bash
curl -X POST http://localhost:3000/campaign/start \
  -H "Content-Type: application/json" \
  -d '{
    "csv_path": "inputs/numbers.csv",
    "script_path": "inputs/script.json",
    "campaign_id": "my_campaign_001"
  }'
```

### Check status
```bash
curl http://localhost:3000/campaign/status
```

### Get campaign stats
```bash
curl http://localhost:3000/campaign/stats/my_campaign_001
```

### Stop the queue
```bash
curl -X POST http://localhost:3000/campaign/stop
```

## Manual Setup Required

1. **Twilio** — Buy a phone number with Voice capability. Enable AMD (Answering Machine Detection) on your account.
2. **Deepgram** — Create an account and get an API key from console.deepgram.com.
3. **ElevenLabs** — Create an account, get API key, and copy a Voice ID from the voice library.
4. **Anthropic** — Create an API key at console.anthropic.com.
5. **Redis** — Install locally (`brew install redis`) or use Redis Cloud.
6. **PostgreSQL** — Schema is auto-created on first run.
7. **ngrok** (local dev) — `ngrok http 3000` and set `BASE_URL` to the https URL.
8. **Twilio Webhook** — The server registers its own webhook URLs dynamically via the `url` parameter in `calls.create()`.

## Project Structure

```
voice-agent/
├── src/
│   ├── caller/
│   │   ├── dialerService.js     # Twilio call initiation + TCPA compliance
│   │   ├── voicemailDetector.js # AMD result classification
│   │   └── callQueue.js         # Rate-limited queue (max 5 concurrent)
│   ├── conversation/
│   │   ├── claudeBrain.js       # Claude haiku-4-5 conversation engine
│   │   ├── scriptEngine.js      # JSON script + variable injection
│   │   └── objectionHandler.js  # Removal/AI disclosure detection
│   ├── voice/
│   │   ├── speechToText.js      # Deepgram + Twilio STT
│   │   └── textToSpeech.js      # ElevenLabs + Polly fallback
│   ├── data/
│   │   ├── csvParser.js         # CSV parsing with E.164 validation
│   │   └── callLogger.js        # PostgreSQL call logging
│   ├── state/
│   │   └── redisManager.js      # Redis session state (1hr TTL)
│   ├── compliance/
│   │   └── dncChecker.js        # DNC list + TCPA hours check
│   └── server.js                # Express server + all webhooks
├── inputs/
│   ├── numbers.csv              # Contact list template
│   └── script.json              # Campaign script template
└── .env.example
```

## Compliance Notice

This system is intended for use only with prior express written consent from called parties.
You are responsible for TCPA compliance, DNC Registry scrubbing, and all applicable laws.
Consult legal counsel before commercial deployment.
