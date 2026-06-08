"use client";
import { motion, type Variants } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { PRICING_TIERS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-18">
          <SectionLabel>Pricing</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p
            className="text-[1rem] max-w-md mx-auto leading-[1.7]"
            style={{ color: "rgba(226,232,240,0.48)" }}
          >
            No per-minute fees. No hidden charges. Flat monthly rate based on call volume.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-3 gap-4 items-start"
        >
          {PRICING_TIERS.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col p-7 rounded-2xl"
              style={
                tier.featured
                  ? {
                      background: "rgba(79,142,247,0.07)",
                      border: "1px solid rgba(79,142,247,0.28)",
                      boxShadow: "0 4px 40px rgba(79,142,247,0.12)",
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

              <h3
                className="text-[15px] font-semibold font-head mb-3"
                style={{ color: "#E2E8F0" }}
              >
                {tier.name}
              </h3>

              <div className="flex items-end gap-1 mb-1">
                <span
                  className="text-[2.4rem] font-extrabold font-head leading-none tabular-nums"
                  style={{ color: tier.featured ? "#4F8EF7" : "#E2E8F0" }}
                >
                  ${tier.price}
                </span>
                <span
                  className="text-[13px] mb-1.5 ml-0.5"
                  style={{ color: "rgba(226,232,240,0.35)" }}
                >
                  / mo
                </span>
              </div>
              <p
                className="text-[12.5px] mb-7"
                style={{ color: "rgba(226,232,240,0.38)" }}
              >
                {tier.calls}
              </p>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[13px]"
                    style={{ color: "rgba(226,232,240,0.62)" }}
                  >
                    <Check
                      size={13}
                      strokeWidth={2.5}
                      style={{
                        color: tier.featured ? "#4F8EF7" : "rgba(226,232,240,0.35)",
                        flexShrink: 0,
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200"
                style={
                  tier.featured
                    ? { background: "#4F8EF7", color: "#fff" }
                    : {
                        background: "transparent",
                        color: "rgba(226,232,240,0.7)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
                onMouseEnter={(e) => {
                  if (tier.featured) {
                    (e.currentTarget as HTMLElement).style.background = "#6BA3F9";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(79,142,247,0.35)";
                  } else {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(226,232,240,0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tier.featured) {
                    (e.currentTarget as HTMLElement).style.background = "#4F8EF7";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  } else {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(226,232,240,0.7)";
                  }
                }}
              >
                {tier.cta}
                {tier.featured && <ArrowRight size={14} />}
              </a>
            </motion.div>
          ))}
        </motion.div>

        <p
          className="text-center text-[12.5px] mt-8"
          style={{ color: "rgba(226,232,240,0.3)" }}
        >
          All plans include a 14-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
}
