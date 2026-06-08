import { PageShell } from "@/components/layout/PageShell";
import { Check, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    price: 99,
    billing: "per month",
    calls: "500 live-answer calls / mo",
    description: "For teams running their first AI calling campaigns and validating the channel.",
    features: [
      "1 concurrent call",
      "Basic script builder",
      "CSV contact import",
      "Answering machine detection",
      "Call recordings (30-day retention)",
      "Email support (48h response)",
      "Standard voice library (10 voices)",
      "TCPA compliance enforcement",
      "DNC Registry checking",
    ],
    cta: "Start Free Trial",
    href: "#",
    featured: false,
  },
  {
    name: "Growth",
    price: 299,
    billing: "per month",
    calls: "2,000 live-answer calls / mo",
    description: "For revenue teams scaling a proven outbound motion and running ongoing campaigns.",
    features: [
      "5 concurrent calls",
      "Advanced script builder with A/B testing",
      "CRM integrations (HubSpot, Salesforce, Pipedrive)",
      "Custom voice cloning (1 voice)",
      "Live call monitoring dashboard",
      "Full analytics + conversion reporting",
      "Priority support (4h response)",
      "Zapier / Make integration",
      "Call recordings (90-day retention)",
      "Multi-language support (48 languages)",
      "Retry logic & smart scheduling",
      "Live agent escalation (warm transfer)",
    ],
    cta: "Start Free Trial",
    href: "#",
    featured: true,
  },
  {
    name: "Enterprise",
    price: 999,
    billing: "per month",
    calls: "Unlimited calls",
    description: "For organizations running high-volume campaigns with custom compliance requirements.",
    features: [
      "Unlimited concurrency",
      "Custom AI training on your call data",
      "Unlimited voice cloning",
      "Dedicated account manager",
      "99.9% uptime SLA",
      "Custom CRM & API integrations",
      "White-label option",
      "SOC 2 report on request",
      "Custom DNC management",
      "Call recordings (unlimited retention)",
      "Slack / Teams support channel",
      "Onboarding & script strategy sessions",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@bingo.ai",
    featured: false,
  },
];

const FAQS = [
  {
    q: "What counts as a 'call'?",
    a: "A call is counted only when a live human answers. Voicemails, answering machines, busy signals, and unanswered rings do not count toward your monthly allocation. Our AMD (Answering Machine Detection) classifies each pickup before the AI conversation begins.",
  },
  {
    q: "Do unused calls roll over?",
    a: "No. Monthly call allocations reset at the start of each billing cycle and do not roll over. If you consistently use fewer than your allocation, consider the Starter plan. If you need more, you can add call packs or upgrade mid-cycle.",
  },
  {
    q: "What happens if I exceed my monthly limit?",
    a: "Campaigns pause automatically when you hit your limit. You'll receive an email notification at 80% and 100% usage. You can purchase additional call packs in the dashboard or upgrade your plan — both take effect immediately.",
  },
  {
    q: "Can I change plans mid-month?",
    a: "Yes. Upgrades are prorated and take effect immediately. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fee on any plan. All plans start with a 14-day free trial including 100 complimentary calls. No credit card required to begin your trial.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual billing is available at a 20% discount on all plans. Contact sales@bingo.ai to set up an annual contract.",
  },
];

export const metadata = {
  title: "Pricing — Bingo AI Call Agent",
  description: "Simple, transparent pricing for AI-powered outbound calling. Starter at $99/mo, Growth at $299/mo, Enterprise at $999/mo.",
};

export default function PricingPage() {
  return (
    <PageShell
      label="Pricing"
      title="Simple, transparent pricing"
      subtitle="No per-minute fees. No hidden charges. Flat monthly rate based on live-answer call volume. Every plan includes a 14-day free trial."
    >
      {/* Tiers */}
      <div className="grid sm:grid-cols-3 gap-5 mb-20">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col p-7 rounded-2xl"
            style={
              tier.featured
                ? {
                    background: "rgba(79,142,247,0.07)",
                    border: "1px solid rgba(79,142,247,0.28)",
                    boxShadow: "0 4px 40px rgba(79,142,247,0.1)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
            }
          >
            {tier.featured && (
              <div
                className="self-start text-[10.5px] font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(79,142,247,0.14)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  color: "#4F8EF7",
                }}
              >
                Most Popular
              </div>
            )}
            <h2 className="text-[15px] font-semibold font-head mb-1" style={{ color: "#E2E8F0" }}>
              {tier.name}
            </h2>
            <div className="flex items-end gap-1 mb-1">
              <span
                className="text-[2.4rem] font-extrabold font-head leading-none tabular-nums"
                style={{ color: tier.featured ? "#4F8EF7" : "#E2E8F0" }}
              >
                ${tier.price}
              </span>
              <span className="text-[13px] mb-1.5 ml-0.5" style={{ color: "rgba(226,232,240,0.35)" }}>
                / mo
              </span>
            </div>
            <p className="text-[12.5px] mb-3" style={{ color: "rgba(226,232,240,0.38)" }}>
              {tier.calls}
            </p>
            <p className="text-[13px] leading-[1.6] mb-7" style={{ color: "rgba(226,232,240,0.45)" }}>
              {tier.description}
            </p>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "rgba(226,232,240,0.62)" }}>
                  <Check size={13} strokeWidth={2.5} style={{ color: tier.featured ? "#4F8EF7" : "rgba(226,232,240,0.35)", flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200"
              style={
                tier.featured
                  ? { background: "#4F8EF7", color: "#fff" }
                  : { background: "transparent", color: "rgba(226,232,240,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {tier.cta}
              {tier.featured && <ArrowRight size={14} />}
            </a>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-[1.4rem] font-bold font-head mb-8" style={{ color: "#E2E8F0" }}>
        Pricing FAQ
      </h2>
      <div className="flex flex-col gap-7">
        {FAQS.map(({ q, a }) => (
          <div key={q}>
            <h3 className="text-[14.5px] font-semibold font-head mb-2" style={{ color: "#E2E8F0" }}>
              {q}
            </h3>
            <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.52)" }}>
              {a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 p-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13.5px] leading-[1.75]" style={{ color: "rgba(226,232,240,0.5)" }}>
          <strong style={{ color: "#E2E8F0" }}>Need a custom quote?</strong> Enterprise plans with custom call volumes, dedicated infrastructure, and white-label options are available. Email{" "}
          <a href="mailto:sales@bingo.ai" style={{ color: "#4F8EF7" }}>sales@bingo.ai</a>{" "}
          or book a 30-minute call with our team.
        </p>
      </div>
    </PageShell>
  );
}
