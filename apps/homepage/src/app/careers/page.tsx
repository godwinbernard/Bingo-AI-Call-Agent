"use client";
import { PageShell } from "@/components/layout/PageShell";
import { ArrowRight, MapPin, Clock } from "lucide-react";

const ROLES = [
  {
    title: "Senior Backend Engineer — Voice Infrastructure",
    team: "Engineering",
    location: "Remote (US or EU)",
    type: "Full-time",
    description:
      "Own the real-time voice pipeline: Deepgram streaming STT, ElevenLabs TTS, Twilio integration, and the latency optimization work that keeps us under 500ms. You'll work in Node.js and TypeScript with a strong focus on reliability at scale.",
    color: "#4F8EF7",
  },
  {
    title: "ML Engineer — Conversation Quality",
    team: "AI/ML",
    location: "Remote (US or EU)",
    type: "Full-time",
    description:
      "Improve how well the AI handles edge cases in live calls: interruptions, accents, domain-specific jargon, and novel objections. You'll work with fine-tuning pipelines, evaluation datasets, and production call data.",
    color: "#8B5CF6",
  },
  {
    title: "Frontend Engineer — Dashboard",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Build the operator dashboard used by sales teams running thousands of concurrent AI calls. React, Next.js, TypeScript, and Framer Motion. You care as much about the feel of an interface as you do about its correctness.",
    color: "#4F8EF7",
  },
  {
    title: "Customer Success Manager",
    team: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Own the success of 30–50 mid-market and enterprise accounts. Help customers build high-converting scripts, run compliant campaigns, and realize measurable ROI. Strong understanding of outbound sales is required.",
    color: "#10B981",
  },
  {
    title: "Head of Compliance",
    team: "Legal & Compliance",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Lead our compliance program across TCPA, GDPR, SOC 2, and emerging AI regulations. You'll own policy documentation, customer-facing compliance guidance, regulatory monitoring, and audit readiness.",
    color: "#F59E0B",
  },
  {
    title: "Growth Marketing Manager",
    team: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Own paid acquisition, content distribution, and conversion optimization for bingo.ai. You'll work closely with sales to align on ICP, messaging, and pipeline targets. B2B SaaS background required.",
    color: "#8B5CF6",
  },
];

const BENEFITS = [
  { emoji: "💰", title: "Competitive salary + equity", desc: "Meaningful ownership from day one." },
  { emoji: "🌍", title: "Fully remote", desc: "Work from anywhere. Async-first culture with flexible hours." },
  { emoji: "🏥", title: "Full health coverage", desc: "Medical, dental, and vision for you and dependents (US)." },
  { emoji: "📚", title: "$2,000 learning budget", desc: "Books, courses, conferences — spend it on what grows you." },
  { emoji: "🖥️", title: "Home office stipend", desc: "$1,500 to set up a workspace you actually want to be in." },
  { emoji: "🏖️", title: "Unlimited PTO", desc: "Minimum 15 days encouraged. We mean it." },
];

export default function CareersPage() {
  return (
    <PageShell
      label="Careers"
      title="Build the future of outbound"
      subtitle="We're a small, high-output team. Everyone ships. We're looking for people who are good at their craft and care about what the thing does in the world."
    >
      {/* Culture */}
      <div className="mb-14">
        <h2 className="text-[1.3rem] font-bold font-head mb-5" style={{ color: "#E2E8F0" }}>
          How we work
        </h2>
        <div className="space-y-4 text-[14px] leading-[1.8]" style={{ color: "rgba(226,232,240,0.55)" }}>
          <p>
            We're 28 people across 9 countries. Most of us have never been in the same room. We ship meaningful things, communicate clearly in writing, and trust each other to own outcomes.
          </p>
          <p>
            We don't have a lot of process. We have good judgment and high standards. We move fast, but we don't break things that matter — compliance, voice quality, and customer trust are non-negotiable.
          </p>
          <p>
            If you want to own a domain completely, build things that talk to real humans at scale, and work with a team that sweats the details, this is a good place to be.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-14">
        <h2 className="text-[1.3rem] font-bold font-head mb-6" style={{ color: "#E2E8F0" }}>
          Benefits
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {BENEFITS.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-[1.4rem] mb-3">{emoji}</div>
              <h3 className="text-[13.5px] font-semibold font-head mb-1" style={{ color: "#E2E8F0" }}>
                {title}
              </h3>
              <p className="text-[12.5px] leading-[1.6]" style={{ color: "rgba(226,232,240,0.45)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div>
        <h2 className="text-[1.3rem] font-bold font-head mb-7" style={{ color: "#E2E8F0" }}>
          Open roles
        </h2>
        <div className="flex flex-col gap-4">
          {ROLES.map((role) => (
            <a
              key={role.title}
              href={`mailto:careers@bingo.ai?subject=${encodeURIComponent(role.title)}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,142,247,0.25)";
                (e.currentTarget as HTMLElement).style.background = "rgba(79,142,247,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10.5px] font-semibold uppercase tracking-wider"
                    style={{ color: role.color }}
                  >
                    {role.team}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
                  {role.title}
                </h3>
                <p className="text-[13px] leading-[1.65] mb-3" style={{ color: "rgba(226,232,240,0.48)" }}>
                  {role.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(226,232,240,0.32)" }}>
                    <MapPin size={11} /> {role.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(226,232,240,0.32)" }}>
                    <Clock size={11} /> {role.type}
                  </span>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 text-[13px] font-medium flex-shrink-0 group-hover:gap-2 transition-all duration-200"
                style={{ color: "#4F8EF7" }}
              >
                Apply <ArrowRight size={13} />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-12 p-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
          <strong style={{ color: "#E2E8F0" }}>Don't see a fit?</strong> We occasionally hire for roles not listed here. If you think you can make Bingo better, send a note to{" "}
          <a href="mailto:careers@bingo.ai" style={{ color: "#4F8EF7" }}>careers@bingo.ai</a>{" "}
          with what you'd work on and why.
        </p>
      </div>
    </PageShell>
  );
}
