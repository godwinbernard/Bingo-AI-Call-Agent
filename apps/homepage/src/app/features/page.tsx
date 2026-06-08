import { PageShell } from "@/components/layout/PageShell";
import { Mic2, Brain, Zap, BarChart3, Plug2, ShieldCheck, PhoneCall, Globe2, SlidersHorizontal, FileText, Repeat2, Headphones } from "lucide-react";

const FEATURES = [
  {
    Icon: Mic2,
    name: "Ultra-Realistic Voice",
    category: "Voice Engine",
    description:
      "Bingo AI uses ElevenLabs' latest voice synthesis to produce voices that are virtually indistinguishable from human agents. Choose from 50+ voice profiles across different genders, accents, and age groups — or clone a custom voice from a 5-minute sample. Natural pause cadence, emotional tone shifts, and dynamic pacing are all handled automatically.",
    accent: "#4F8EF7",
  },
  {
    Icon: Brain,
    name: "Adaptive AI Brain",
    category: "Conversation Engine",
    description:
      "Powered by Claude, Bingo's conversation engine handles every phase of a call: the opener, the pitch, objection responses, pricing questions, and close attempts. It reads intent signals in real time and decides when to push forward, when to empathize, and when to escalate to a human agent. It also improves with every call through campaign-level learning.",
    accent: "#8B5CF6",
  },
  {
    Icon: Zap,
    name: "Sub-500ms Response Latency",
    category: "Infrastructure",
    description:
      "Our streaming speech-to-text pipeline via Deepgram runs in parallel with TTS generation, so the AI is already composing its reply while the prospect is still finishing their sentence. Average end-to-end latency is under 380ms — faster than most human salespeople think. No awkward dead air, no clunky pauses.",
    accent: "#F59E0B",
  },
  {
    Icon: BarChart3,
    name: "Real-Time Analytics Dashboard",
    category: "Analytics",
    description:
      "Monitor every active call in real time. See live status, duration, sentiment score, and outcome prediction for each call in your campaign. Post-call analytics include conversion rate breakdowns by script variant, time of day, industry, and agent voice. Exportable reports and CSV downloads are available on all plans.",
    accent: "#4F8EF7",
  },
  {
    Icon: Plug2,
    name: "CRM & Tool Integrations",
    category: "Integrations",
    description:
      "Native two-way sync with HubSpot, Salesforce, Pipedrive, and Zoho CRM. Call outcomes, transcripts, and disposition codes are logged automatically after every call — no manual data entry. Connect to 5,000+ additional apps via Zapier or Make. A full REST API and webhook system is available for custom integrations.",
    accent: "#8B5CF6",
  },
  {
    Icon: ShieldCheck,
    name: "Built-in Compliance Engine",
    category: "Compliance",
    description:
      "Every campaign runs through our automated compliance layer before a single call is placed. DNC Registry checking, TCPA calling-hours enforcement by recipient timezone (8am–9pm local), required consent disclosures, and mandatory call recording are all handled out of the box. Full audit trails are maintained for every interaction and available for export.",
    accent: "#10B981",
  },
  {
    Icon: PhoneCall,
    name: "Answering Machine Detection",
    category: "Infrastructure",
    description:
      "Our AMD (Answering Machine Detection) engine classifies each call pickup within 1.5 seconds as a live human answer or a voicemail/machine. Live answers proceed to the AI conversation. Machines receive a custom pre-recorded voicemail drop. Only live-answer calls count against your monthly call allocation.",
    accent: "#4F8EF7",
  },
  {
    Icon: Globe2,
    name: "Multilingual Support",
    category: "Voice Engine",
    description:
      "Run campaigns in 48+ languages with native-sounding pronunciation, grammar, and culturally appropriate phrasing. Language is detected automatically from the contact record or set at the campaign level. English, Spanish, Portuguese, French, German, Mandarin, Hindi, and Arabic have dedicated voice model fine-tuning.",
    accent: "#8B5CF6",
  },
  {
    Icon: SlidersHorizontal,
    name: "Visual Script Builder",
    category: "Campaign Tools",
    description:
      "Build dynamic call scripts without writing a line of code. Define your opening, pitch, objection-handling branches, and closing CTA using a drag-and-drop canvas. Inject contact variables ({{first_name}}, {{company}}, {{industry}}) for personalization at scale. Import existing scripts from plain text or JSON. Branch on intent signals, topic detection, or sentiment score.",
    accent: "#F59E0B",
  },
  {
    Icon: FileText,
    name: "A/B Script Testing",
    category: "Campaign Tools",
    description:
      "Create multiple script variants within the same campaign and let Bingo split traffic automatically. Real-time conversion tracking surfaces the winner. Pause or terminate underperforming variants without stopping the campaign. Statistical significance is calculated automatically and surfaced in the analytics dashboard.",
    accent: "#4F8EF7",
  },
  {
    Icon: Repeat2,
    name: "Retry Logic & Scheduling",
    category: "Campaign Tools",
    description:
      "Define custom retry rules for unanswered calls, busy signals, and callbacks. Set maximum retry attempts, minimum time between attempts, and preferred retry windows by day of week. The campaign engine queues retries automatically and respects all TCPA calling-hour restrictions for each contact's local timezone.",
    accent: "#8B5CF6",
  },
  {
    Icon: Headphones,
    name: "Live Agent Escalation",
    category: "Conversation Engine",
    description:
      "When a prospect signals strong intent or requests a human, Bingo can warm-transfer the call to a live agent in under 3 seconds. The agent receives a real-time brief — prospect name, summary of the AI conversation so far, and flagged intent signals — before the transfer completes. Escalation triggers are fully configurable per script.",
    accent: "#10B981",
  },
];

export const metadata = {
  title: "Features — Bingo AI Call Agent",
  description: "Everything Bingo AI does to help you scale outbound calling: voice engine, AI brain, compliance, analytics, and more.",
};

export default function FeaturesPage() {
  return (
    <PageShell
      label="Platform"
      title="Everything you need to scale outbound"
      subtitle="A complete AI calling platform — from voice synthesis and conversation engine to compliance enforcement, CRM sync, and real-time analytics."
    >
      <div className="grid sm:grid-cols-2 gap-8">
        {FEATURES.map(({ Icon, name, category, description, accent }) => (
          <div key={name} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}
              >
                <Icon size={18} style={{ color: accent }} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(226,232,240,0.3)" }}>
                  {category}
                </div>
                <h2 className="text-[16px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
                  {name}
                </h2>
                <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.52)" }}>
                  {description}
                </p>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
        ))}
      </div>

      <div
        className="mt-14 p-8 rounded-2xl text-center"
        style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.18)" }}
      >
        <h3 className="text-[18px] font-bold font-head mb-3" style={{ color: "#E2E8F0" }}>
          Ready to see it in action?
        </h3>
        <p className="text-[14px] mb-6" style={{ color: "rgba(226,232,240,0.5)" }}>
          Start a free 14-day trial — no credit card required. Your first 100 calls are on us.
        </p>
        <a
          href="/pricing"
          className="btn-primary inline-flex"
        >
          View Pricing &amp; Start Free Trial
        </a>
      </div>
    </PageShell>
  );
}
