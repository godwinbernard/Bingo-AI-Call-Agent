function buildHumanDialerSeedData() {
  const organizationId = 'org_human_dialer_seed';
  const agentId = 'member_human_dialer_agent';
  const contactBaseId = 'contact_human_dialer_';
  const campaignId = 'campaign_human_dialer_q3';

  const agents = [
    {
      id: agentId,
      organization_id: organizationId,
      user_id: 'clerk_user_human_dialer',
      email: 'agent@example.com',
      name: 'Alex Morgan',
      role: 'MANAGER',
      status: 'active',
      created_at: new Date('2026-06-01T12:00:00.000Z'),
    },
  ];

  const calls = [];
  const transcripts = [];
  const scorecards = [];
  const contacts = [];
  const segments = [];

  const scoreBlueprints = [6.1, 6.8, 7.2, 7.5, 7.8, 8.0, 8.2, 8.4, 8.7, 9.1];

  for (let index = 0; index < 10; index += 1) {
    const sequence = index + 1;
    const callId = `human_call_${sequence}`;
    const transcriptId = `transcript_${sequence}`;
    const contactId = `${contactBaseId}${sequence}`;
    const overallScore = scoreBlueprints[index];

    contacts.push({
      id: contactId,
      organization_id: organizationId,
      name: `Contact ${sequence}`,
      phone: `+12025550${String(sequence).padStart(3, '0')}`,
      email: `contact${sequence}@example.com`,
      metadata: { source: 'seed' },
      created_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:00:00.000Z`),
      updated_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:00:00.000Z`),
    });

    calls.push({
      id: callId,
      org_id: organizationId,
      agent_id: agentId,
      contact_id: contactId,
      campaign_id: campaignId,
      twilio_call_sid: `CA_seed_${sequence}`,
      twilio_parent_sid: null,
      direction: 'OUTBOUND',
      recording_url: `https://recordings.example.com/${callId}.mp3`,
      recording_sid: `RE_seed_${sequence}`,
      recording_duration: 180 + sequence * 5,
      status: 'COMPLETED',
      outcome: sequence % 3 === 0 ? 'CALLBACK_REQUESTED' : 'SUCCESS',
      outcome_notes: `Seed outcome ${sequence}`,
      started_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:00:00.000Z`),
      answered_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:00:05.000Z`),
      ended_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:03:00.000Z`),
      duration_seconds: 175 + sequence * 3,
      talk_time_agent: 95 + sequence,
      talk_time_contact: 80 + sequence,
      hold_time: sequence % 2 === 0 ? 12 : 6,
      created_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:03:05.000Z`),
      updated_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:03:05.000Z`),
    });

    transcripts.push({
      id: transcriptId,
      call_id: callId,
      full_text: `Seed transcript ${sequence}. Contact asked about pricing and next steps.`,
      word_count: 140 + sequence * 2,
      talk_ratio_agent: 0.53 + sequence * 0.01,
      talk_ratio_contact: 0.47 - sequence * 0.01,
      filler_word_count: sequence % 4,
      avg_confidence: 0.88 + sequence * 0.005,
      avg_sentiment: 0.1 + sequence * 0.02,
      keywords_detected: sequence % 2 === 0 ? ['pricing', 'trial'] : ['demo', 'follow-up'],
      objections_detected: sequence % 3 === 0 ? ['too_busy'] : ['price'],
      created_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:03:10.000Z`),
    });

    scorecards.push({
      id: `scorecard_${sequence}`,
      call_id: callId,
      agent_id: agentId,
      org_id: organizationId,
      overall_score: overallScore,
      opening_score: 6 + sequence * 0.2,
      objection_handling_score: 6.2 + sequence * 0.2,
      rapport_score: 6.1 + sequence * 0.2,
      script_adherence_score: 5.8 + sequence * 0.2,
      closing_score: 6.3 + sequence * 0.2,
      what_went_well: [
        'Opened with a clear value statement',
        'Kept the conversation moving',
      ],
      what_to_improve: [
        'Ask one more discovery question',
        'Slow down after objections',
      ],
      coaching_tips: [
        'Pause before the next question',
        'Mirror the contact’s last concern before pitching',
        'Close with a specific next step',
      ],
      summary: `Seed scorecard ${sequence}`,
      sentiment_timeline: [
        { t: 0, score: 0.12 },
        { t: 85, score: 0.24 },
        { t: 160, score: 0.41 },
      ],
      talk_speed_avg: 145 + sequence,
      filler_word_count: sequence % 4,
      longest_monologue_sec: 18 + sequence,
      interruptions_count: sequence % 3,
      ai_model_used: 'claude-3-5-sonnet-20241022',
      analysis_duration_ms: 600 + sequence * 25,
      created_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:05:00.000Z`),
    });

    segments.push({
      id: `segment_${sequence}`,
      call_id: callId,
      transcript_id: transcriptId,
      speaker: sequence % 2 === 0 ? 'AGENT' : 'CONTACT',
      text: `Seed segment ${sequence}`,
      start_ms: sequence * 1000,
      end_ms: sequence * 1000 + 2500,
      confidence: 0.91,
      sentiment_score: 0.2,
      words_per_min: 140 + sequence,
      is_objection: sequence % 3 === 0,
      objection_type: sequence % 3 === 0 ? 'too_busy' : null,
      created_at: new Date(`2026-06-${String(sequence).padStart(2, '0')}T13:02:00.000Z`),
    });
  }

  return {
    organization: {
      id: organizationId,
      name: 'Human Dialer Seed Org',
      slug: 'human-dialer-seed-org',
      stripe_customer_id: 'cus_human_dialer_seed',
      subscription_tier: 'GROWTH',
      subscription_status: 'active',
      billing_email: 'billing@example.com',
      usage_reset_date: new Date('2026-06-01T00:00:00.000Z'),
      created_at: new Date('2026-06-01T12:00:00.000Z'),
      updated_at: new Date('2026-06-01T12:00:00.000Z'),
    },
    campaign: {
      id: campaignId,
      organization_id: organizationId,
      name: 'Q3 Human Dialer',
      status: 'active',
      created_at: new Date('2026-06-01T12:00:00.000Z'),
      updated_at: new Date('2026-06-01T12:00:00.000Z'),
    },
    agents,
    contacts,
    calls,
    transcripts,
    scorecards,
    segments,
    agentPerformances: [
      {
        id: 'performance_human_dialer',
        agent_id: agentId,
        org_id: organizationId,
        period: '2026-06',
        calls_made: 10,
        calls_connected: 8,
        calls_successful: 5,
        total_talk_time: 1045,
        avg_overall_score: 7.8,
        avg_opening: 7.4,
        avg_objection: 7.9,
        avg_rapport: 7.6,
        avg_closing: 7.7,
        top_issues: ['discovery questions', 'talk speed'],
        improvement_areas: ['closing technique'],
        score_trend: [6.1, 6.8, 7.2, 7.5, 7.8, 8.0, 8.2, 8.4, 8.7, 9.1],
        created_at: new Date('2026-06-10T12:00:00.000Z'),
        updated_at: new Date('2026-06-10T12:00:00.000Z'),
      },
    ],
  };
}

module.exports = { buildHumanDialerSeedData };
