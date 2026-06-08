require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { buildHumanDialerSeedData } = require('../src/dialer/humanDialerSeedData');

const prisma = new PrismaClient();

async function main() {
  const seed = buildHumanDialerSeedData();

  await prisma.$transaction(async (tx) => {
    await tx.organization.upsert({
      where: { id: seed.organization.id },
      update: {
        name: seed.organization.name,
        slug: seed.organization.slug,
        stripe_customer_id: seed.organization.stripe_customer_id,
        subscription_tier: seed.organization.subscription_tier,
        subscription_status: seed.organization.subscription_status,
        billing_email: seed.organization.billing_email,
        usage_reset_date: seed.organization.usage_reset_date,
      },
      create: seed.organization,
    });

    await tx.campaign.upsert({
      where: { id: seed.campaign.id },
      update: {
        name: seed.campaign.name,
        status: seed.campaign.status,
      },
      create: seed.campaign,
    });

    for (const agent of seed.agents) {
      await tx.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: agent.organization_id,
            user_id: agent.user_id,
          },
        },
        update: {
          email: agent.email,
          name: agent.name,
          role: agent.role,
          status: agent.status,
        },
        create: agent,
      });
    }

    for (const contact of seed.contacts) {
      await tx.contact.upsert({
        where: { id: contact.id },
        update: {
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          metadata: contact.metadata,
        },
        create: contact,
      });
    }

    for (const call of seed.calls) {
      await tx.humanCall.upsert({
        where: { twilio_call_sid: call.twilio_call_sid },
        update: {
          status: call.status,
          outcome: call.outcome,
          outcome_notes: call.outcome_notes,
          recording_url: call.recording_url,
          recording_sid: call.recording_sid,
          recording_duration: call.recording_duration,
          started_at: call.started_at,
          answered_at: call.answered_at,
          ended_at: call.ended_at,
          duration_seconds: call.duration_seconds,
          talk_time_agent: call.talk_time_agent,
          talk_time_contact: call.talk_time_contact,
          hold_time: call.hold_time,
        },
        create: call,
      });
    }

    for (const transcript of seed.transcripts) {
      await tx.callTranscript.upsert({
        where: { call_id: transcript.call_id },
        update: {
          full_text: transcript.full_text,
          word_count: transcript.word_count,
          talk_ratio_agent: transcript.talk_ratio_agent,
          talk_ratio_contact: transcript.talk_ratio_contact,
          filler_word_count: transcript.filler_word_count,
          avg_confidence: transcript.avg_confidence,
          avg_sentiment: transcript.avg_sentiment,
          keywords_detected: transcript.keywords_detected,
          objections_detected: transcript.objections_detected,
        },
        create: transcript,
      });
    }

    for (const segment of seed.segments) {
      await tx.transcriptSegment.upsert({
        where: { id: segment.id },
        update: {
          speaker: segment.speaker,
          text: segment.text,
          start_ms: segment.start_ms,
          end_ms: segment.end_ms,
          confidence: segment.confidence,
          sentiment_score: segment.sentiment_score,
          words_per_min: segment.words_per_min,
          is_objection: segment.is_objection,
          objection_type: segment.objection_type,
        },
        create: segment,
      });
    }

    for (const scorecard of seed.scorecards) {
      await tx.callScorecard.upsert({
        where: { call_id: scorecard.call_id },
        update: {
          overall_score: scorecard.overall_score,
          opening_score: scorecard.opening_score,
          objection_handling_score: scorecard.objection_handling_score,
          rapport_score: scorecard.rapport_score,
          script_adherence_score: scorecard.script_adherence_score,
          closing_score: scorecard.closing_score,
          what_went_well: scorecard.what_went_well,
          what_to_improve: scorecard.what_to_improve,
          coaching_tips: scorecard.coaching_tips,
          summary: scorecard.summary,
          sentiment_timeline: scorecard.sentiment_timeline,
          talk_speed_avg: scorecard.talk_speed_avg,
          filler_word_count: scorecard.filler_word_count,
          longest_monologue_sec: scorecard.longest_monologue_sec,
          interruptions_count: scorecard.interruptions_count,
          ai_model_used: scorecard.ai_model_used,
          analysis_duration_ms: scorecard.analysis_duration_ms,
        },
        create: scorecard,
      });
    }

    for (const performance of seed.agentPerformances) {
      await tx.agentPerformance.upsert({
        where: {
          agent_id_period: {
            agent_id: performance.agent_id,
            period: performance.period,
          },
        },
        update: {
          calls_made: performance.calls_made,
          calls_connected: performance.calls_connected,
          calls_successful: performance.calls_successful,
          total_talk_time: performance.total_talk_time,
          avg_overall_score: performance.avg_overall_score,
          avg_opening: performance.avg_opening,
          avg_objection: performance.avg_objection,
          avg_rapport: performance.avg_rapport,
          avg_closing: performance.avg_closing,
          top_issues: performance.top_issues,
          improvement_areas: performance.improvement_areas,
          score_trend: performance.score_trend,
        },
        create: performance,
      });
    }
  });

  console.log('Human dialer seed data created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
