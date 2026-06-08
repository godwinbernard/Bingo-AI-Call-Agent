# Bingo AI Call Agent

An end-to-end AI-powered outbound calling platform consisting of three apps.

## Monorepo Structure

```
Bingo-AI-Call-Agent/
├── apps/
│   ├── backend/      Node.js + Express voice AI engine
│   ├── dashboard/    Next.js 14 operator dashboard (dark-mode UI)
│   └── homepage/     Next.js 14 TypeScript marketing site
├── archive/          Original single-file HTML prototype
├── .gitignore
└── README.md
```

## Apps

### apps/backend — Voice AI Engine

Node.js + Express backend that powers all outbound calling.

**Stack:** Node.js, Express, Twilio, Deepgram (STT), ElevenLabs (TTS), Claude Haiku (AI brain), Redis, PostgreSQL

**Key features:**
- Outbound dialing with AMD (Answering Machine Detection)
- Real-time speech-to-text via Deepgram streaming
- AI conversation engine via Claude Haiku (15-turn limit, 150 max tokens)
- ElevenLabs TTS with Twilio Polly fallback
- TCPA compliance — enforces 8am–9pm local calling hours
- National DNC list checking with E.164 normalization
- CSV contact import with validation and deduplication
- Redis session state (1hr TTL), PostgreSQL call logging
- Max 5 concurrent calls with retry queue

```bash
cd apps/backend
cp .env.example .env   # fill in your API keys
npm install
npm start              # production
npm run dev            # nodemon watch mode
npm test               # full test suite
```

**Required env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY`, `ANTHROPIC_API_KEY`, `REDIS_URL`, `DATABASE_URL`

---

### apps/dashboard — Operator Dashboard

Next.js 14 dark-mode dashboard for managing campaigns, monitoring live calls, and reviewing analytics.

**Stack:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts, shadcn/ui, React Hook Form + Zod, Socket.io client

**Pages:** Dashboard · Campaigns · Campaign Detail · New Campaign · Call History · Scripts · Script Builder · Contacts · Settings

**Key features:**
- Live calls panel with waveform animations
- Area/Pie/Bar charts with custom tooltips
- Call detail drawer with full transcript
- Multi-step campaign wizard with CSV drag-and-drop
- Script builder with phone preview
- Glassmorphism design system (dark, indigo accent `#6366F1`)
- Mobile-responsive with collapsible sidebar

```bash
cd apps/dashboard
cp .env.example .env.local   # fill in your keys
npm install
npm run dev                  # http://localhost:3001
npm run build
```

---

### apps/homepage — Marketing Homepage

Next.js 14 TypeScript marketing site converted from a single-file HTML prototype.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, Framer Motion, next/font (Syne + DM Sans + JetBrains Mono), Lucide React

**Sections:** Hero · Logo bar · Features (6) · How It Works · Dashboard Feature · Script Builder Feature · Compliance · Pricing · Testimonials · FAQ · Contact · CTA

**Key features:**
- Animated hero stats with `useAnimatedCounter`
- 15-bar waveform animation
- Live dashboard mockup with cycling active-call count
- Interactive script preview with branch pills
- FAQ accordion with AnimatePresence
- HelpBot floating chat with keyword response engine
- Grid-noise CSS background (radial gradients + 60px grid lines)
- Full SEO metadata + Open Graph + Twitter card

```bash
cd apps/homepage
npm install
npm run dev     # http://localhost:3000
npm run build   # 0 errors, fully static output
```

---

## License

MIT
