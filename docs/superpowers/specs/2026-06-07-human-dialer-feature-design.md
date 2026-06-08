# Human Dialer Feature Design

## Goal
Add a standalone web dialer workspace to Bingo AI that supports manual outbound calling with real-time AI coaching during the call and a post-call AI scorecard after the call ends.

The feature must feel like a serious enterprise calling console, not a consumer softphone. It should preserve the current product’s tone and visual system while adding a focused live-call experience.

## Product Scope

### In Scope
- Standalone `/dialer` workspace
- Manual outbound dialing
- Live transcript that updates word by word
- AI coaching panel during active calls
- Objection detection in real time
- Script-grounded suggested responses
- Live sentiment score from 0 to 100
- Keyword alerts for competitor mentions, pricing, and compliance terms
- Talk/listen ratio indicator
- Post-call AI scorecard with coaching and call analysis
- Recording playback and transcript access after call end

### Out of Scope
- Inbound call handling
- Auto-dialing or predictive dialer behavior
- Conference calling
- Team queue management
- SMS follow-up automation
- CRM sync changes beyond read-only context for coaching

## Product Shape

The dialer is a separate workspace rather than a campaign detail panel. It has one core job: let a human rep place a call, get live coaching while speaking, and review the result afterward.

The UI is organized into three persistent zones:
- Dialer controls
- Live transcript and AI coaching
- Post-call review

The live experience changes state during the call, but the layout remains stable so the agent does not lose orientation.

## User Flow

### 1. Pre-Call
- Agent opens `/dialer`
- Selects or confirms contact, company, and campaign context
- Reviews the target script and call objective
- Presses `Call`

### 2. Live Call
- Call connects through Twilio
- Transcript begins streaming word by word
- AI detects objections, competitor mentions, pricing mentions, and compliance triggers
- AI suggests the next response based on the active script and live context
- Sentiment and talk/listen ratio update continuously

### 3. Post-Call
- When the call ends, the live panel switches to a scorecard
- The system summarizes what went well, what to improve, and coaching tips
- The user can play the recording or open the full transcript

## Frontend Design

### Dialer Controls Panel
Purpose:
- Hold the core telephony actions and contact context.

Content:
- Contact name
- Company name
- Campaign name
- Dialpad
- Call button
- Mute button
- Hold button
- Duration timer
- Quality indicator

Behavior:
- Call controls remain visible throughout the session
- Controls are disabled or relabeled when the call state changes
- The panel should be compact and easy to use with one hand on desktop

### Live Transcript Panel
Purpose:
- Show the active conversation as the source of truth.

Content:
- Word-by-word transcript updates
- Speaker labels for rep and contact
- Typing/partial state while speech is in progress
- Timestamp markers optional, but not required in the first version

Behavior:
- Transcript should scroll naturally to the latest turn
- Transcript entries should be immutable once finalized
- Partial words can be updated in place until the STT engine finalizes them

### AI Assistant Panel
Purpose:
- Provide live coaching without overwhelming the rep.

Priority order:
1. Suggested response
2. Objection detected
3. Keyword alerts
4. Sentiment score
5. Talk/listen ratio

Content:
- Suggested response grounded in the active script
- Objection label and short recovery line
- Keyword alerts for pricing, competitor, and compliance terms
- Sentiment score from 0 to 100
- Talk/listen ratio indicator

Behavior:
- The most actionable item should stay at the top
- Updates should be concise and never block the user from talking
- Alerts should be visually prominent only when needed

### Post-Call Scorecard Panel
Purpose:
- Turn the finished call into actionable coaching.

Content:
- Contact name
- Duration
- Outcome
- Overall score out of 10
- Performance label, such as `Good Performance`
- Category breakdown:
  - Opening
  - Objection Handling
  - Rapport
  - Script Adherence
  - Closing
- What went well
- What to improve
- Coaching tips for next call
- Trend compared to last 10 calls
- `Play Recording`
- `Full Transcript`

Behavior:
- Appears automatically once the call ends and analysis is ready
- Can show a short processing state before the final scorecard is available
- Should emphasize practical improvement, not just scoring

## Call States

The dialer should support the following finite states:
- `idle`
- `ready`
- `dialing`
- `connecting`
- `live`
- `coaching`
- `ended`
- `review_ready`
- `error`

State implications:
- `idle` and `ready` show the dialer controls and pre-call context
- `dialing` and `connecting` disable most controls and show progress
- `live` enables transcript, AI coaching, and runtime alerts
- `coaching` is used when the AI is still generating final feedback after hangup
- `review_ready` shows the final scorecard
- `error` should surface a retry path

## AI Behavior

### Real-Time Transcript
- Transcription is streamed in near real time
- Output should be word-by-word whenever the STT provider allows it
- If partial word streaming is not available, partial phrase updates are acceptable, but the system should preserve a typing effect

### Objection Detection
- Detect common sales objections immediately
- Examples:
  - too busy
  - not interested
  - send an email
  - already using a competitor
  - price concern
  - call me later
- When detected, show:
  - objection label
  - short explanation or context
  - one suggested reply

### Script-Grounded Suggestion
- Suggestions must be based on the active script and current conversation state
- Suggestions should be short enough to say naturally
- The system should prefer one strong suggestion over multiple competing options

### Sentiment
- Maintain a simple 0 to 100 score
- Also map the score to a readable label:
  - 0-39: negative
  - 40-69: neutral
  - 70-100: positive
- The score should update frequently but not on every micro-event if that would create UI noise

### Keyword Alerts
- Trigger lightweight alerts for:
  - competitor names
  - pricing mentions
  - compliance terms
  - purchase intent
  - callback requests
- Alerts should be logged and visible in the AI panel
- Alerts should not steal focus unless compliance or a high-value keyword is detected

### Talk/Listen Ratio
- Track how much time the rep talks versus the contact
- Render as a compact ratio and a simple directional indicator
- This is advisory only and should never block the call

## Backend Architecture

### Services
- `Twilio Voice` for calling and audio transport
- `Deepgram Streaming STT` for live transcription
- `Claude` for objection detection, coaching, and scorecard generation
- `Redis` for live call session state and ephemeral coaching context
- `PostgreSQL` for durable storage of calls, transcripts, ratings, and tips

### Data Flow
1. User presses `Call`
2. Backend creates a call session and stores it in Redis
3. Twilio connects the agent to the contact
4. Audio stream is forwarded to STT
5. Transcript tokens are appended to the live session
6. Coaching engine evaluates transcript context and script context
7. UI receives live updates through WebSocket or equivalent streaming channel
8. On hangup, the backend generates the final scorecard and stores it in Postgres

## Data Model

The dialer feature should add or extend these durable entities:

- `Call`
  - status
  - contact reference
  - campaign reference
  - duration
  - outcome
  - recording URL
  - sentiment summary
  - talk/listen ratio
  - overall score

- `CallTranscript`
  - call ID
  - speaker
  - content
  - partial/final flag
  - timestamp

- `CallAlert`
  - call ID
  - alert type
  - matched keyword or objection
  - confidence
  - message

- `CallScorecard`
  - call ID
  - overall score
  - category scores
  - strengths
  - improvements
  - coaching tips

These can be represented as new tables or as structured JSON fields attached to `Call` depending on the current schema patterns, but the final implementation should keep transcript and scorecard data queryable.

## API Surface

The dialer needs read/write endpoints for:
- creating a call session
- ending a call session
- receiving live transcript updates
- receiving live AI coaching updates
- fetching post-call review data
- fetching recording metadata

Suggested endpoints:
- `POST /api/dialer/session`
- `POST /api/dialer/end`
- `GET /api/dialer/session/:id`
- `GET /api/dialer/calls/:id/review`
- `GET /api/dialer/calls/:id/transcript`

Live updates should be delivered over a streaming mechanism, not polling, for the actual call experience.

## UX Constraints

- Keep the dialer visible and stable during live calls
- Do not bury the primary response suggestion
- Avoid dense charts in the live panel
- Keep alerts compact and actionable
- Do not allow the AI to interrupt the rep mid-sentence with excessive noise
- Ensure the scorecard is readable in one screen without scrolling for the most important information

## Error Handling

The dialer must handle:
- call initiation failure
- STT stream loss
- AI suggestion timeout
- webhook failure
- recording unavailable
- session reconnect

Rules:
- Live call should continue if coaching fails temporarily
- Transcript failure should degrade gracefully and keep the call active
- Scorecard generation can lag behind hangup, but the UI must explain that analysis is still processing

## Permissions and Compliance

- Only authenticated org members can use the dialer
- Dialer usage should respect organization-level call limits and permissions
- The call experience must preserve consent/compliance logging already present in the product
- If the product already enforces DNC and calling-hours controls, the dialer must reuse those checks rather than duplicating logic

## Success Criteria

The feature is successful if:
- a rep can place a manual call from the browser
- the live transcript updates during the call
- the AI suggests responses in real time
- objection detection appears quickly enough to be useful
- the post-call scorecard appears with usable coaching guidance
- the layout remains clear and enterprise-grade throughout the call lifecycle

## Non-Goals

- Replacing the existing campaign workflow
- Building a full contact-center routing system
- Shipping advanced workforce management
- Adding automated outbound pacing
- Rewriting the underlying telephony stack

