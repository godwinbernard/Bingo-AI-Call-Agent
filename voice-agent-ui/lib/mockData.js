export const MOCK_CAMPAIGNS = [
  {
    id: 'camp_001',
    name: 'Q4 Sales Outreach',
    status: 'active',
    created_at: '2026-06-01T09:00:00Z',
    total_contacts: 500,
    calls_made: 247,
    calls_success: 89,
    calls_voicemail: 62,
    calls_no_answer: 71,
    calls_rejected: 25,
    concurrent_calls: 5,
    script_name: 'Sales Outreach v2',
    script_id: 'script_001',
    campaign_id: 'camp_001',
  },
  {
    id: 'camp_002',
    name: 'June Follow-Up Campaign',
    status: 'completed',
    created_at: '2026-05-20T10:00:00Z',
    total_contacts: 300,
    calls_made: 300,
    calls_success: 142,
    calls_voicemail: 88,
    calls_no_answer: 52,
    calls_rejected: 18,
    concurrent_calls: 3,
    script_name: 'Follow-Up Script',
    script_id: 'script_002',
    campaign_id: 'camp_002',
  },
  {
    id: 'camp_003',
    name: 'New Product Launch',
    status: 'paused',
    created_at: '2026-06-05T14:00:00Z',
    total_contacts: 750,
    calls_made: 120,
    calls_success: 31,
    calls_voicemail: 44,
    calls_no_answer: 33,
    calls_rejected: 12,
    concurrent_calls: 5,
    script_name: 'Product Launch v1',
    script_id: 'script_003',
    campaign_id: 'camp_003',
  },
];

const NAMES = [
  ['John', 'Smith'], ['Sarah', 'Johnson'], ['Michael', 'Brown'], ['Emily', 'Davis'],
  ['Robert', 'Wilson'], ['Jennifer', 'Moore'], ['David', 'Taylor'], ['Lisa', 'Anderson'],
  ['James', 'Thomas'], ['Mary', 'Jackson'], ['Charles', 'White'], ['Patricia', 'Harris'],
  ['Daniel', 'Martin'], ['Barbara', 'Thompson'], ['Mark', 'Garcia'], ['Susan', 'Martinez'],
  ['Paul', 'Robinson'], ['Dorothy', 'Clark'], ['Steven', 'Rodriguez'], ['Karen', 'Lewis'],
];

const OUTCOMES = ['success', 'voicemail', 'no-answer', 'rejected', 'busy'];
const OUTCOME_WEIGHTS = [0.35, 0.28, 0.22, 0.10, 0.05];
const MOCK_NOW = new Date('2026-06-07T12:00:00Z').getTime();
const MOCK_SEED = 42;

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = Math.imul(value ^ (value >>> 15), value | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedOutcome(rng) {
  const r = rng();
  let cum = 0;
  for (let i = 0; i < OUTCOMES.length; i++) {
    cum += OUTCOME_WEIGHTS[i];
    if (r < cum) return OUTCOMES[i];
  }
  return 'success';
}

function randomPhone(rng) {
  const area = Math.floor(rng() * 800) + 200;
  const prefix = Math.floor(rng() * 900) + 100;
  const line = Math.floor(rng() * 9000) + 1000;
  return `+1${area}${prefix}${line}`;
}

function randomDuration(outcome, rng) {
  if (outcome === 'no-answer' || outcome === 'busy') return Math.floor(rng() * 30);
  if (outcome === 'voicemail') return Math.floor(rng() * 60) + 30;
  return Math.floor(rng() * 300) + 60;
}

export const MOCK_CALLS = Array.from({ length: 50 }, (_, i) => {
  const rng = createRng(MOCK_SEED + i * 97);
  const [first, last] = NAMES[i % NAMES.length];
  const outcome = weightedOutcome(rng);
  const campaignIdx = i % 3;
  const campaign = MOCK_CAMPAIGNS[campaignIdx];
  const hoursAgo = Math.floor(rng() * 48);
  const startedAt = new Date(MOCK_NOW - hoursAgo * 3600000 - rng() * 3600000).toISOString();

  return {
    id: `call_${String(i + 1).padStart(3, '0')}`,
    call_sid: `CA${Math.floor(rng() * 1e12).toString(36).padStart(12, '0')}`,
    first_name: first,
    last_name: last,
    phone: randomPhone(rng),
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    outcome,
    status: 'completed',
    duration_seconds: randomDuration(outcome, rng),
    started_at: startedAt,
    answering_machine: outcome === 'voicemail',
    transcript: outcome === 'success' || outcome === 'voicemail' ? generateTranscript(first, outcome) : [],
  };
});

function generateTranscript(firstName, outcome) {
  const base = [
    { role: 'assistant', content: `Hello, may I speak with ${firstName}?`, timestamp: '0:00' },
    { role: 'user', content: 'Yes, this is them. Who is this?', timestamp: '0:04' },
    { role: 'assistant', content: `Hi ${firstName}, this is Alex calling from InnovateTech Solutions. I'm reaching out about our new automated solutions that could help your business save up to 30% on operational costs.`, timestamp: '0:06' },
    { role: 'user', content: 'Oh, okay. What kind of solutions are you talking about?', timestamp: '0:18' },
    { role: 'assistant', content: "Great question! We specialize in workflow automation that reduces manual tasks. Would you have 15 minutes for a quick demo this week?", timestamp: '0:22' },
  ];

  if (outcome === 'success') {
    return [
      ...base,
      { role: 'user', content: 'Sure, I could do Thursday afternoon.', timestamp: '0:35' },
      { role: 'assistant', content: `Perfect! I'll have our team reach out to schedule Thursday afternoon. Thank you so much for your time, ${firstName}. Have a wonderful day!`, timestamp: '0:38' },
    ];
  }
  return [
    ...base,
    { role: 'user', content: "I'm actually pretty busy right now.", timestamp: '0:35' },
    { role: 'assistant', content: 'Of course, I completely understand. Would it be alright if I left you a voicemail with more details? Have a great day!', timestamp: '0:38' },
  ];
}

export const MOCK_SCRIPTS = [
  {
    id: 'script_001',
    name: 'Sales Outreach v2',
    goal: 'Schedule a product demo',
    created_at: '2026-05-15T10:00:00Z',
    agent_name: 'Alex',
    opening: 'Hello, may I speak with {{first_name}}?',
    introduction: 'Hi {{first_name}}, this is Alex from InnovateTech Solutions.',
    main_pitch: 'We help businesses save up to 30% on operational costs through automation.',
    call_to_action: 'Would you be available for a 15-minute demo this week?',
    voicemail_script: 'Hi {{first_name}}, this is Alex from InnovateTech. Please call us back at 1-800-555-1234.',
    objection_responses: {
      not_interested: "I completely understand. Could I send you some information by email?",
      too_busy: "Of course! Would a callback tomorrow or later this week work better?",
    },
  },
  {
    id: 'script_002',
    name: 'Follow-Up Script',
    goal: 'Re-engage past leads',
    created_at: '2026-05-10T10:00:00Z',
    agent_name: 'Sam',
    opening: 'Hi, is this {{first_name}}?',
    introduction: "Hi {{first_name}}, it's Sam from InnovateTech. We spoke a while back.",
    main_pitch: 'We have some exciting new updates I think you\'d be interested in.',
    call_to_action: 'Can I share a quick update with you?',
    voicemail_script: 'Hi {{first_name}}, it\'s Sam again. Just wanted to follow up. Call us at 1-800-555-1234.',
    objection_responses: {
      not_interested: "No problem at all. I\'ll note that down.",
    },
  },
  {
    id: 'script_003',
    name: 'Product Launch v1',
    goal: 'Announce new product and generate interest',
    created_at: '2026-06-04T10:00:00Z',
    agent_name: 'Alex',
    opening: 'Hello, may I speak with {{first_name}}?',
    introduction: 'Hi {{first_name}}, this is Alex calling about our brand new product launch.',
    main_pitch: 'We just launched something that I think will change how you manage your workflow.',
    call_to_action: 'Can I send you some exclusive early access information?',
    voicemail_script: 'Hi {{first_name}}, big news from InnovateTech — we just launched something exciting. Call 1-800-555-1234.',
    objection_responses: {},
  },
];

export const MOCK_CONTACTS = Array.from({ length: 20 }, (_, i) => {
  const [first, last] = NAMES[i % NAMES.length];
  const callsForContact = MOCK_CALLS.filter((_, ci) => ci % 20 === i);
  const lastCall = callsForContact[0];
  return {
    id: `contact_${i + 1}`,
    first_name: first,
    last_name: last,
    phone: randomPhone(createRng(MOCK_SEED + 1000 + i)),
    company: ['Acme Corp', 'Tech Inc', 'Big Co', 'StartUp LLC', 'Corp Ltd'][i % 5],
    last_called: lastCall?.started_at || null,
    last_outcome: lastCall?.outcome || null,
    campaign_name: lastCall?.campaign_name || null,
    call_count: callsForContact.length,
  };
});

export const MOCK_DNC = [
  { phone: '+12025551234', added_at: '2026-06-01T10:00:00Z', reason: 'Customer request' },
  { phone: '+13105559876', added_at: '2026-05-28T14:00:00Z', reason: 'Customer request' },
  { phone: '+14155554567', added_at: '2026-05-25T09:00:00Z', reason: 'Regulatory' },
  { phone: '+17185553210', added_at: '2026-06-03T11:00:00Z', reason: 'Customer request' },
  { phone: '+18025558765', added_at: '2026-06-05T16:00:00Z', reason: 'Customer request' },
];

export const MOCK_HOURLY_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  total: (() => {
    const rng = createRng(MOCK_SEED + h * 13);
    return h >= 8 && h <= 20 ? Math.floor(rng() * 40) + (h >= 10 && h <= 16 ? 20 : 5) : Math.floor(rng() * 5);
  })(),
  success: (() => {
    const rng = createRng(MOCK_SEED + h * 29);
    return h >= 8 && h <= 20 ? Math.floor(rng() * 20) + (h >= 10 && h <= 16 ? 8 : 2) : Math.floor(rng() * 2);
  })(),
}));

export const MOCK_LIVE_CALLS = [
  { callSid: 'CA001', contact: 'John Smith', phone: '+12025551234', campaign: 'Q4 Sales Outreach', duration: 87, status: 'Talking' },
  { callSid: 'CA002', contact: 'Sarah Johnson', phone: '+13105559876', campaign: 'New Product Launch', duration: 42, status: 'Listening' },
  { callSid: 'CA003', contact: 'Michael Brown', phone: '+14155554567', campaign: 'Q4 Sales Outreach', duration: 156, status: 'Processing' },
];

export const MOCK_STATS = {
  total_calls: 1284,
  success_rate: 67.3,
  active_calls: 3,
  avg_duration: 154,
  calls_today: 47,
  success_rate_delta: 2.1,
};
