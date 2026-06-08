import { PageShell } from "@/components/layout/PageShell";
import { Clock, Wrench, CheckCircle2 } from "lucide-react";

const STATUS = {
  shipped: { label: "Shipped", color: "#10B981", Icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "#4F8EF7", Icon: Wrench },
  planned: { label: "Planned", color: "rgba(226,232,240,0.4)", Icon: Clock },
};

const ITEMS: {
  status: keyof typeof STATUS;
  quarter: string;
  title: string;
  description: string;
  category: string;
}[] = [
  {
    status: "shipped",
    quarter: "Q1 2026",
    category: "Voice Engine",
    title: "48-language support",
    description: "Expanded multilingual calling to 48 languages with dedicated voice models for Spanish, Portuguese, French, German, Mandarin, Hindi, Arabic, and Vietnamese.",
  },
  {
    status: "shipped",
    quarter: "Q1 2026",
    category: "Conversation Engine",
    title: "Claude-powered conversation engine",
    description: "Migrated from GPT-4 to Claude for better objection handling, longer context windows, and more natural call phrasing.",
  },
  {
    status: "shipped",
    quarter: "Q1 2026",
    category: "Infrastructure",
    title: "Sub-500ms response latency",
    description: "Rebuilt the STT + TTS pipeline with streaming and parallel processing. Average end-to-end response time is now under 380ms.",
  },
  {
    status: "shipped",
    quarter: "Q2 2026",
    category: "Voice Engine",
    title: "Voice cloning (Growth + Enterprise)",
    description: "Clone a custom voice from a 5-minute audio sample. Available on Growth and Enterprise plans.",
  },
  {
    status: "shipped",
    quarter: "Q2 2026",
    category: "Analytics",
    title: "Real-time live call monitoring",
    description: "Watch active calls in real time with live sentiment scores, conversation stage tracking, and agent notes.",
  },
  {
    status: "in-progress",
    quarter: "Q3 2026",
    category: "Conversation Engine",
    title: "Multi-turn memory across callbacks",
    description: "The AI will remember previous conversations with the same contact. On a callback, it picks up where the last call left off — no re-introduction required.",
  },
  {
    status: "in-progress",
    quarter: "Q3 2026",
    category: "Integrations",
    title: "Gong & Chorus integration",
    description: "Sync call recordings and AI summaries to Gong or Chorus for conversation intelligence workflows. Map Bingo call outcomes to deal stages automatically.",
  },
  {
    status: "in-progress",
    quarter: "Q3 2026",
    category: "Campaign Tools",
    title: "AI script optimizer",
    description: "Analyze conversion data across script variants and automatically suggest phrasing changes. One-click acceptance applies changes to the live script.",
  },
  {
    status: "planned",
    quarter: "Q4 2026",
    category: "Voice Engine",
    title: "Emotion-aware tone modulation",
    description: "The voice engine will dynamically adjust pacing, warmth, and energy level based on prospect sentiment signals detected mid-call.",
  },
  {
    status: "planned",
    quarter: "Q4 2026",
    category: "Infrastructure",
    title: "EU data residency option",
    description: "All call data, recordings, and contact records stored and processed within the EU for customers with GDPR data residency requirements.",
  },
  {
    status: "planned",
    quarter: "Q4 2026",
    category: "Campaign Tools",
    title: "Predictive contact scoring",
    description: "ML model trained on your call outcomes predicts which contacts are most likely to convert. Campaigns can be ordered by score to maximize early conversions.",
  },
  {
    status: "planned",
    quarter: "Q1 2027",
    category: "Platform",
    title: "Multi-channel sequences",
    description: "Coordinate voice calls with automated SMS and email follow-ups in a single campaign sequence. Shared outcomes tracking across all channels.",
  },
  {
    status: "planned",
    quarter: "Q1 2027",
    category: "Conversation Engine",
    title: "Inbound AI receptionist",
    description: "Handle inbound calls with the same AI engine. Route to departments, answer FAQs, qualify callers, and schedule callbacks automatically.",
  },
];

export const metadata = {
  title: "Roadmap — Bingo AI Call Agent",
  description: "See what Bingo AI is building next: shipped features, work in progress, and planned releases.",
};

export default function RoadmapPage() {
  const shipped = ITEMS.filter((i) => i.status === "shipped");
  const inProgress = ITEMS.filter((i) => i.status === "in-progress");
  const planned = ITEMS.filter((i) => i.status === "planned");

  const Section = ({
    items,
    statusKey,
  }: {
    items: typeof ITEMS;
    statusKey: keyof typeof STATUS;
  }) => {
    const { label, color, Icon } = STATUS[statusKey];
    return (
      <div className="mb-14">
        <div className="flex items-center gap-2.5 mb-7">
          <Icon size={16} style={{ color }} strokeWidth={2} />
          <h2 className="text-[16px] font-semibold font-head" style={{ color }}>
            {label}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                opacity: statusKey === "planned" ? 0.75 : 1,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(226,232,240,0.35)" }}
                >
                  {item.category}
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: color }}
                >
                  {item.quarter}
                </span>
              </div>
              <h3 className="text-[14.5px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
                {item.title}
              </h3>
              <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(226,232,240,0.48)" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageShell
      label="Roadmap"
      title="What we're building"
      subtitle="Our public product roadmap. Have a feature request? Email product@bingo.ai — customer requests directly influence prioritization."
    >
      <Section items={inProgress} statusKey="in-progress" />
      <Section items={planned} statusKey="planned" />
      <Section items={shipped} statusKey="shipped" />

      <div
        className="mt-4 p-7 rounded-2xl"
        style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)" }}
      >
        <h3 className="text-[15px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
          Request a feature
        </h3>
        <p className="text-[13.5px] leading-[1.7]" style={{ color: "rgba(226,232,240,0.5)" }}>
          We review every feature request. Email{" "}
          <a href="mailto:product@bingo.ai" style={{ color: "#4F8EF7" }}>product@bingo.ai</a>{" "}
          with a description of your use case and the problem it solves. High-vote items move to the top of the queue.
        </p>
      </div>
    </PageShell>
  );
}
