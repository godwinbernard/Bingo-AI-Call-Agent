import { PageShell } from "@/components/layout/PageShell";

const TEAM = [
  {
    initials: "AG",
    name: "Alex Grant",
    role: "Co-Founder & CEO",
    bio: "Previously Head of Revenue at a Series B SaaS company. Built and managed outbound SDR teams for 6 years before starting Bingo AI to solve the problem from a different angle.",
    color: "#4F8EF7",
  },
  {
    initials: "MN",
    name: "Maya Nguyen",
    role: "Co-Founder & CTO",
    bio: "ML engineer with 8 years of experience in speech synthesis and NLP. Led voice model development at two AI infrastructure companies before Bingo. Author of two papers on low-latency TTS.",
    color: "#8B5CF6",
  },
  {
    initials: "JR",
    name: "Jordan Reid",
    role: "Head of Product",
    bio: "Built outbound tooling at three sales-tech startups. Obsesses over the gap between what CRMs promise and what sales teams actually need on the phone.",
    color: "#10B981",
  },
  {
    initials: "PO",
    name: "Priya Okonkwo",
    role: "Head of Compliance & Legal",
    bio: "Telecom regulatory attorney with 10 years of TCPA, FCC, and FTC compliance experience. Previously advised Fortune 500 companies on outbound calling programs.",
    color: "#F59E0B",
  },
];

const VALUES = [
  {
    title: "Calls should feel like conversations",
    body: "We believe AI calling only works when the experience on the other end of the line feels natural and respectful. We obsess over latency, voice quality, and conversation flow because a robotic call doesn't just fail — it poisons the brand.",
  },
  {
    title: "Compliance is a feature, not a checkbox",
    body: "TCPA litigation costs U.S. businesses over $3 billion per year. We built compliance into the platform's core — not as an afterthought — because protecting our customers protects the people they're calling.",
  },
  {
    title: "Transparency over hype",
    body: "We publish our roadmap publicly, document our limitations honestly, and don't claim our AI passes any Turing test. We're building a tool that makes sales teams dramatically more productive. That's enough.",
  },
  {
    title: "Speed with care",
    body: "Moving fast matters. But not at the cost of voice quality, data security, or customer trust. We ship quickly and we get things right.",
  },
];

export const metadata = {
  title: "About — Bingo AI Call Agent",
  description: "The story behind Bingo AI: why we built it, who's building it, and what we believe.",
};

export default function AboutPage() {
  return (
    <PageShell
      label="Company"
      title="We're building the future of outbound"
      subtitle="Bingo AI was founded in 2024 by two people who spent years managing outbound sales teams and got tired of the same problem: talented humans spending most of their day on calls that never get answered."
    >
      {/* Origin story */}
      <div className="mb-16">
        <h2 className="text-[1.3rem] font-bold font-head mb-5" style={{ color: "#E2E8F0" }}>
          The problem we're solving
        </h2>
        <div className="space-y-4 text-[14px] leading-[1.8]" style={{ color: "rgba(226,232,240,0.55)" }}>
          <p>
            The average outbound SDR makes 50–80 dials per day. Of those, roughly 20–25 reach a live person. The rest are voicemails, hang-ups, and wrong numbers. That means a significant portion of every sales rep's day is spent on calls that never happen.
          </p>
          <p>
            At the same time, AI voice synthesis and large language models had finally reached a quality level where the gap between AI and human was closing fast. We saw the opportunity: what if you could handle those 80 dials with AI, and route only the interested, live conversations to your human team?
          </p>
          <p>
            That's Bingo AI. We built the platform we wish had existed when we were running those teams. Not a gimmick, not a chatbot — a production-grade calling system that handles the volume, stays compliant, and hands off to humans the moment it matters.
          </p>
        </div>
      </div>

      {/* By the numbers */}
      <div className="mb-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: "2024", label: "Founded" },
          { value: "2,400+", label: "Customers" },
          { value: "47M+", label: "Calls completed" },
          { value: "28", label: "Team members" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="p-5 rounded-xl text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-[1.8rem] font-extrabold font-head tabular-nums mb-1" style={{ color: "#4F8EF7" }}>
              {value}
            </div>
            <div className="text-[12px]" style={{ color: "rgba(226,232,240,0.38)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-[1.3rem] font-bold font-head mb-7" style={{ color: "#E2E8F0" }}>
          What we believe
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map(({ title, body }) => (
            <div
              key={title}
              className="p-6 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h3 className="text-[14.5px] font-semibold font-head mb-2.5" style={{ color: "#E2E8F0" }}>
                {title}
              </h3>
              <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-[1.3rem] font-bold font-head mb-7" style={{ color: "#E2E8F0" }}>
          Leadership
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex items-start gap-4 p-6 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-[13px] flex-shrink-0"
                style={{ background: `${member.color}14`, color: member.color, border: `1px solid ${member.color}28` }}
              >
                {member.initials}
              </div>
              <div>
                <p className="text-[14.5px] font-semibold font-head mb-0.5" style={{ color: "#E2E8F0" }}>
                  {member.name}
                </p>
                <p className="text-[12px] font-medium mb-3" style={{ color: member.color }}>
                  {member.role}
                </p>
                <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(226,232,240,0.48)" }}>
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 p-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
          <strong style={{ color: "#E2E8F0" }}>Get in touch.</strong> Press inquiries:{" "}
          <a href="mailto:press@bingo.ai" style={{ color: "#4F8EF7" }}>press@bingo.ai</a>.
          Investor relations:{" "}
          <a href="mailto:investors@bingo.ai" style={{ color: "#4F8EF7" }}>investors@bingo.ai</a>.
          General:{" "}
          <a href="mailto:hello@bingo.ai" style={{ color: "#4F8EF7" }}>hello@bingo.ai</a>.
        </p>
      </div>
    </PageShell>
  );
}
