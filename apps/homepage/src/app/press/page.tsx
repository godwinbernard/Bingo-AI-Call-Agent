import { PageShell } from "@/components/layout/PageShell";
import { Download, ArrowRight } from "lucide-react";

const COVERAGE = [
  {
    outlet: "TechCrunch",
    date: "May 2026",
    headline: "Bingo AI crosses 2,000 customers as enterprise demand for AI outbound calling accelerates",
    href: "#",
  },
  {
    outlet: "VentureBeat",
    date: "March 2026",
    headline: "Why sales teams are replacing SDRs with AI calling agents — and what it means for the industry",
    href: "#",
  },
  {
    outlet: "The Information",
    date: "February 2026",
    headline: "The AI cold call: startups like Bingo AI are rethinking outbound sales from first principles",
    href: "#",
  },
  {
    outlet: "Forbes",
    date: "January 2026",
    headline: "Bingo AI raises $18M Series A to scale its compliance-first AI calling platform",
    href: "#",
  },
  {
    outlet: "Sales Hacker",
    date: "December 2025",
    headline: "We tested 6 AI calling platforms. Here's what we found.",
    href: "#",
  },
];

const STATS = [
  { value: "47M+", label: "Calls completed on the platform" },
  { value: "2,400+", label: "Companies using Bingo AI" },
  { value: "$18M", label: "Series A funding raised" },
  { value: "2024", label: "Founded" },
];

export const metadata = {
  title: "Press — Bingo AI Call Agent",
  description: "Press kit, media coverage, and press contact information for Bingo AI.",
};

export default function PressPage() {
  return (
    <PageShell
      label="Press"
      title="Press &amp; media"
      subtitle="Press kit, approved assets, recent coverage, and contact information for media inquiries."
    >
      {/* Key facts */}
      <div className="mb-14">
        <h2 className="text-[1.3rem] font-bold font-head mb-6" style={{ color: "#E2E8F0" }}>
          Bingo AI at a glance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="p-5 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-[1.7rem] font-extrabold font-head tabular-nums mb-1" style={{ color: "#4F8EF7" }}>
                {value}
              </div>
              <div className="text-[12px] leading-[1.4]" style={{ color: "rgba(226,232,240,0.38)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 text-[14px] leading-[1.8]" style={{ color: "rgba(226,232,240,0.55)" }}>
          <p>
            <strong style={{ color: "#E2E8F0" }}>What Bingo AI does:</strong> Bingo AI is an AI-powered outbound calling platform that deploys hyper-realistic voice agents to qualify leads, book appointments, and close deals at scale — 24/7, with built-in TCPA compliance.
          </p>
          <p>
            <strong style={{ color: "#E2E8F0" }}>Who uses it:</strong> Revenue teams at mid-market and enterprise companies across real estate, financial services, insurance, staffing, and B2B SaaS. Customers include teams that previously ran 5–50 person outbound SDR organizations.
          </p>
          <p>
            <strong style={{ color: "#E2E8F0" }}>How it works:</strong> Campaigns are built in a visual script editor, launched against a contact list, and monitored in real time. The AI handles the conversation; live agents receive warm transfers for high-intent prospects. All calls are TCPA-compliant and DNC-checked automatically.
          </p>
          <p>
            <strong style={{ color: "#E2E8F0" }}>Headquarters:</strong> Remote-first, incorporated in Delaware. Team members in the US, UK, Germany, Brazil, and India.
          </p>
        </div>
      </div>

      {/* Press kit */}
      <div className="mb-14">
        <h2 className="text-[1.3rem] font-bold font-head mb-5" style={{ color: "#E2E8F0" }}>
          Press kit
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "Logo pack (SVG + PNG)", desc: "Full-color, white, and dark variants. Includes wordmark and icon." },
            { title: "Brand guidelines", desc: "Color system, typography, logo usage rules, and background specs." },
            { title: "Founder headshots", desc: "High-resolution photos of co-founders Alex Grant and Maya Nguyen." },
          ].map(({ title, desc }) => (
            <a
              key={title}
              href="mailto:press@bingo.ai"
              className="group flex flex-col gap-3 p-5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Download size={16} style={{ color: "#4F8EF7" }} />
              <div>
                <h3 className="text-[13.5px] font-semibold font-head mb-1.5 group-hover:text-[#4F8EF7] transition-colors" style={{ color: "#E2E8F0" }}>
                  {title}
                </h3>
                <p className="text-[12.5px] leading-[1.6]" style={{ color: "rgba(226,232,240,0.45)" }}>
                  {desc}
                </p>
              </div>
            </a>
          ))}
        </div>
        <p className="text-[12.5px] mt-4" style={{ color: "rgba(226,232,240,0.35)" }}>
          Request assets by emailing{" "}
          <a href="mailto:press@bingo.ai" style={{ color: "#4F8EF7" }}>press@bingo.ai</a>. We respond within 24 hours.
        </p>
      </div>

      {/* Coverage */}
      <div className="mb-14">
        <h2 className="text-[1.3rem] font-bold font-head mb-6" style={{ color: "#E2E8F0" }}>
          Recent coverage
        </h2>
        <div className="flex flex-col gap-0">
          {COVERAGE.map((item, i) => (
            <a
              key={item.headline}
              href={item.href}
              className="group flex items-start justify-between gap-6 py-5 transition-opacity duration-200 hover:opacity-80"
              style={{ borderBottom: i < COVERAGE.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11.5px] font-bold" style={{ color: "#4F8EF7" }}>{item.outlet}</span>
                  <span className="text-[11px]" style={{ color: "rgba(226,232,240,0.25)" }}>·</span>
                  <span className="text-[12px]" style={{ color: "rgba(226,232,240,0.32)" }}>{item.date}</span>
                </div>
                <p className="text-[14px] font-medium leading-snug group-hover:text-[#4F8EF7] transition-colors" style={{ color: "#E2E8F0" }}>
                  {item.headline}
                </p>
              </div>
              <ArrowRight size={15} style={{ color: "rgba(226,232,240,0.3)", flexShrink: 0, marginTop: 4 }} />
            </a>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="p-7 rounded-2xl" style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.18)" }}>
        <h3 className="text-[15px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
          Press contact
        </h3>
        <p className="text-[13.5px] leading-[1.75] mb-4" style={{ color: "rgba(226,232,240,0.5)" }}>
          For media inquiries, interview requests, and fact-checking, contact our communications team directly. We respond to all press inquiries within one business day.
        </p>
        <a href="mailto:press@bingo.ai" className="btn-primary inline-flex text-[13px]">
          press@bingo.ai
        </a>
      </div>
    </PageShell>
  );
}
