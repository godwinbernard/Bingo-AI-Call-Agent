import { PageShell } from "@/components/layout/PageShell";

const RELEASES = [
  {
    version: "2.4.0",
    date: "June 3, 2026",
    type: "Feature Release",
    typeColor: "#4F8EF7",
    highlights: [
      "A/B script testing now supports up to 4 variants per campaign (previously 2)",
      "New voice profiles: 8 additional ElevenLabs voices including 3 regional Spanish accents",
      "Live agent escalation now includes a real-time conversation brief panel for agents",
      "Webhook retry logic: failed webhook deliveries now retry up to 5 times with exponential backoff",
    ],
  },
  {
    version: "2.3.1",
    date: "May 19, 2026",
    type: "Bug Fix",
    typeColor: "#10B981",
    highlights: [
      "Fixed an edge case where AMD detection would misclassify some VoIP answering messages as live answers",
      "Resolved dashboard latency spike when viewing campaigns with 10,000+ contacts",
      "Corrected timezone offset handling for Indiana (no DST) phone numbers",
      "Fixed CSV import failing silently when the file contained BOM characters",
    ],
  },
  {
    version: "2.3.0",
    date: "May 5, 2026",
    type: "Feature Release",
    typeColor: "#4F8EF7",
    highlights: [
      "Multilingual support expanded from 32 to 48 languages — including Vietnamese, Tamil, and Swahili",
      "New dashboard widget: sentiment heatmap by time-of-day and day-of-week",
      "Script variable editor now supports conditional logic: show/hide script branches based on contact field values",
      "Salesforce integration now syncs call disposition codes as custom activity fields",
      "Added keyboard shortcuts for common dashboard actions (see Settings → Keyboard Shortcuts)",
    ],
  },
  {
    version: "2.2.0",
    date: "April 14, 2026",
    type: "Feature Release",
    typeColor: "#4F8EF7",
    highlights: [
      "Voice cloning is now available on Growth and Enterprise plans — clone a voice from a 5-minute audio sample",
      "Campaign scheduling: set start date, end date, and daily calling windows per campaign",
      "New API endpoint: GET /v1/campaigns/{id}/transcripts returns paginated full transcripts for all calls",
      "HubSpot integration now creates contact notes with full call summaries automatically",
      "Improved objection detection model — reduced false negatives by 22% in internal benchmarks",
    ],
  },
  {
    version: "2.1.0",
    date: "March 28, 2026",
    type: "Feature Release",
    typeColor: "#4F8EF7",
    highlights: [
      "Live call monitoring panel launched: view active calls, sentiment score, and conversation stage in real time",
      "New retry rules engine: configure retry attempts, intervals, and conditions per campaign",
      "Pipedrive and Zoho CRM native integrations (previously Zapier-only)",
      "Call recordings now include speaker-labeled transcripts",
      "Added GDPR data deletion API endpoint for compliance workflows",
    ],
  },
  {
    version: "2.0.0",
    date: "March 3, 2026",
    type: "Major Release",
    typeColor: "#8B5CF6",
    highlights: [
      "Upgraded conversation engine from GPT-4 to Claude — improved objection handling, context retention, and natural phrasing across all scripts",
      "Complete dashboard redesign with dark mode, real-time charts, and responsive mobile layout",
      "New script builder canvas: drag-and-drop branches, visual intent mapping, inline preview",
      "Sub-500ms latency architecture: streaming STT and parallel TTS pipeline reduces response time by 40%",
      "Enterprise tier launched with unlimited concurrency, white-label, and SLA guarantee",
    ],
  },
  {
    version: "1.9.2",
    date: "February 11, 2026",
    type: "Bug Fix",
    typeColor: "#10B981",
    highlights: [
      "Fixed DNC Registry check timing out for campaigns with over 50,000 contacts",
      "Resolved audio distortion on ElevenLabs voice 'Aria' at high concurrency",
      "Fixed Zapier webhook payload missing campaign_id field",
    ],
  },
  {
    version: "1.9.0",
    date: "January 27, 2026",
    type: "Feature Release",
    typeColor: "#4F8EF7",
    highlights: [
      "Answering Machine Detection (AMD) launched — only live-answer calls count toward your plan allocation",
      "Voicemail drop: record a custom voicemail message that plays automatically when AMD detects a machine",
      "CSV import now supports 30+ custom fields for script personalization",
      "New compliance report: exportable PDF summary of DNC checks, consent events, and calling-hours compliance per campaign",
    ],
  },
];

export const metadata = {
  title: "Changelog — Bingo AI Call Agent",
  description: "What's new in Bingo AI: every feature release, improvement, and bug fix.",
};

export default function ChangelogPage() {
  return (
    <PageShell
      label="Changelog"
      title="What's new"
      subtitle="Every feature release, improvement, and bug fix — in chronological order. Subscribe to release notes at hello@bingo.ai."
    >
      <div className="flex flex-col gap-14">
        {RELEASES.map((r) => (
          <div key={r.version} className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            {/* Date & version */}
            <div className="sm:w-40 flex-shrink-0">
              <p className="text-[12.5px] font-mono mb-1" style={{ color: "rgba(226,232,240,0.35)" }}>
                {r.date}
              </p>
              <p className="text-[14px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
                v{r.version}
              </p>
              <span
                className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  background: `${r.typeColor}14`,
                  border: `1px solid ${r.typeColor}30`,
                  color: r.typeColor,
                }}
              >
                {r.type}
              </span>
            </div>

            {/* Items */}
            <div className="flex-1">
              <ul className="flex flex-col gap-3">
                {r.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-[1.7]" style={{ color: "rgba(226,232,240,0.58)" }}>
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.typeColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
      <p className="text-[13px] mt-8 text-center" style={{ color: "rgba(226,232,240,0.35)" }}>
        Viewing the last 8 releases.{" "}
        <a href="mailto:hello@bingo.ai" style={{ color: "#4F8EF7" }}>
          Subscribe to release notes
        </a>{" "}
        to get new versions by email.
      </p>
    </PageShell>
  );
}
