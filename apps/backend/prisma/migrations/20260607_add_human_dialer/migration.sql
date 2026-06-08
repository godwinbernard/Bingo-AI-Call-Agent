-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "HumanCallStatus" AS ENUM ('INITIATED', 'RINGING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'FAILED', 'NO_ANSWER', 'BUSY', 'CANCELED');

-- CreateEnum
CREATE TYPE "HumanCallOutcome" AS ENUM ('SUCCESS', 'CALLBACK_REQUESTED', 'NOT_INTERESTED', 'VOICEMAIL_LEFT', 'WRONG_NUMBER', 'DO_NOT_CALL', 'NO_ANSWER', 'FAILED');

-- CreateEnum
CREATE TYPE "Speaker" AS ENUM ('AGENT', 'CONTACT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "HintType" AS ENUM ('OBJECTION_RESPONSE', 'RAPPORT_TIP', 'CLOSING_SUGGESTION', 'SPEED_WARNING', 'SCRIPT_REMINDER', 'SENTIMENT_ALERT', 'KEYWORD_DETECTED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_by" TEXT;

-- CreateTable
CREATE TABLE "HumanCall" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "twilio_call_sid" TEXT NOT NULL,
    "twilio_parent_sid" TEXT,
    "direction" "CallDirection" NOT NULL,
    "recording_url" TEXT,
    "recording_sid" TEXT,
    "recording_duration" INTEGER,
    "status" "HumanCallStatus" NOT NULL,
    "outcome" "HumanCallOutcome",
    "outcome_notes" TEXT,
    "started_at" TIMESTAMP(3),
    "answered_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "talk_time_agent" INTEGER,
    "talk_time_contact" INTEGER,
    "hold_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallTranscript" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "full_text" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "talk_ratio_agent" DOUBLE PRECISION NOT NULL,
    "talk_ratio_contact" DOUBLE PRECISION NOT NULL,
    "filler_word_count" INTEGER NOT NULL,
    "avg_confidence" DOUBLE PRECISION NOT NULL,
    "avg_sentiment" DOUBLE PRECISION NOT NULL,
    "keywords_detected" TEXT[],
    "objections_detected" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "transcript_id" TEXT,
    "speaker" "Speaker" NOT NULL,
    "text" TEXT NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sentiment_score" DOUBLE PRECISION NOT NULL,
    "words_per_min" INTEGER,
    "is_objection" BOOLEAN NOT NULL DEFAULT false,
    "objection_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallScorecard" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "opening_score" DOUBLE PRECISION NOT NULL,
    "objection_handling_score" DOUBLE PRECISION NOT NULL,
    "rapport_score" DOUBLE PRECISION NOT NULL,
    "script_adherence_score" DOUBLE PRECISION NOT NULL,
    "closing_score" DOUBLE PRECISION NOT NULL,
    "what_went_well" TEXT[],
    "what_to_improve" TEXT[],
    "coaching_tips" TEXT[],
    "summary" TEXT NOT NULL,
    "sentiment_timeline" JSONB NOT NULL,
    "talk_speed_avg" INTEGER NOT NULL,
    "filler_word_count" INTEGER NOT NULL,
    "longest_monologue_sec" INTEGER NOT NULL,
    "interruptions_count" INTEGER NOT NULL,
    "ai_model_used" TEXT NOT NULL,
    "analysis_duration_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallScorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiHint" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "triggered_at_ms" INTEGER NOT NULL,
    "hint_type" "HintType" NOT NULL,
    "content" TEXT NOT NULL,
    "objection_type" TEXT,
    "was_used" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPerformance" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "calls_made" INTEGER NOT NULL DEFAULT 0,
    "calls_connected" INTEGER NOT NULL DEFAULT 0,
    "calls_successful" INTEGER NOT NULL DEFAULT 0,
    "total_talk_time" INTEGER NOT NULL DEFAULT 0,
    "avg_overall_score" DOUBLE PRECISION,
    "avg_opening" DOUBLE PRECISION,
    "avg_objection" DOUBLE PRECISION,
    "avg_rapport" DOUBLE PRECISION,
    "avg_closing" DOUBLE PRECISION,
    "top_issues" TEXT[],
    "improvement_areas" TEXT[],
    "score_trend" DOUBLE PRECISION[],
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialerSession" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "twilio_device" TEXT,
    "status" "SessionStatus" NOT NULL,
    "calls_made" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "DialerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "stripe_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "last_error" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HumanCall_twilio_call_sid_key" ON "HumanCall"("twilio_call_sid");

-- CreateIndex
CREATE INDEX "HumanCall_org_id_idx" ON "HumanCall"("org_id");

-- CreateIndex
CREATE INDEX "HumanCall_agent_id_idx" ON "HumanCall"("agent_id");

-- CreateIndex
CREATE INDEX "HumanCall_contact_id_idx" ON "HumanCall"("contact_id");

-- CreateIndex
CREATE INDEX "HumanCall_campaign_id_idx" ON "HumanCall"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "CallTranscript_call_id_key" ON "CallTranscript"("call_id");

-- CreateIndex
CREATE INDEX "TranscriptSegment_call_id_idx" ON "TranscriptSegment"("call_id");

-- CreateIndex
CREATE INDEX "TranscriptSegment_transcript_id_idx" ON "TranscriptSegment"("transcript_id");

-- CreateIndex
CREATE UNIQUE INDEX "CallScorecard_call_id_key" ON "CallScorecard"("call_id");

-- CreateIndex
CREATE INDEX "CallScorecard_org_id_idx" ON "CallScorecard"("org_id");

-- CreateIndex
CREATE INDEX "CallScorecard_agent_id_idx" ON "CallScorecard"("agent_id");

-- CreateIndex
CREATE INDEX "AiHint_call_id_idx" ON "AiHint"("call_id");

-- CreateIndex
CREATE INDEX "AgentPerformance_org_id_period_idx" ON "AgentPerformance"("org_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPerformance_agent_id_period_key" ON "AgentPerformance"("agent_id", "period");

-- CreateIndex
CREATE INDEX "DialerSession_org_id_idx" ON "DialerSession"("org_id");

-- CreateIndex
CREATE INDEX "DialerSession_agent_id_idx" ON "DialerSession"("agent_id");

-- CreateIndex
CREATE INDEX "DialerSession_campaign_id_idx" ON "DialerSession"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookEvent_stripe_event_id_key" ON "StripeWebhookEvent"("stripe_event_id");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_organization_id_status_next_retry_at_idx" ON "StripeWebhookEvent"("organization_id", "status", "next_retry_at");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organization_id_user_id_key" ON "OrganizationMember"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "HumanCall" ADD CONSTRAINT "HumanCall_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanCall" ADD CONSTRAINT "HumanCall_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanCall" ADD CONSTRAINT "HumanCall_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanCall" ADD CONSTRAINT "HumanCall_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallTranscript" ADD CONSTRAINT "CallTranscript_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "HumanCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "HumanCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "CallTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallScorecard" ADD CONSTRAINT "CallScorecard_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "HumanCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallScorecard" ADD CONSTRAINT "CallScorecard_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallScorecard" ADD CONSTRAINT "CallScorecard_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiHint" ADD CONSTRAINT "AiHint_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "HumanCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPerformance" ADD CONSTRAINT "AgentPerformance_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPerformance" ADD CONSTRAINT "AgentPerformance_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialerSession" ADD CONSTRAINT "DialerSession_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialerSession" ADD CONSTRAINT "DialerSession_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialerSession" ADD CONSTRAINT "DialerSession_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeWebhookEvent" ADD CONSTRAINT "StripeWebhookEvent_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

