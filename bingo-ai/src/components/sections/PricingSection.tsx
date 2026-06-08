"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PRICING_TIERS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="teal">Pricing</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Simple,{" "}
            <GradientText>Transparent Pricing</GradientText>
          </h2>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            No per-minute fees. No hidden charges. Just a flat monthly rate based on call volume.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass-card p-7 flex flex-col"
              style={
                tier.featured
                  ? {
                      background: "rgba(0,245,212,0.04)",
                      border: "1px solid rgba(0,245,212,0.25)",
                      transform: "scale(1.02)",
                    }
                  : {}
              }
            >
              {tier.featured && (
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full self-start"
                  style={{
                    background: "rgba(0,245,212,0.12)",
                    border: "1px solid rgba(0,245,212,0.25)",
                    color: "#00f5d4",
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-bold font-head mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>
                {tier.name}
              </h3>
              <div className="flex items-end gap-1 mb-1">
                <span
                  className="text-4xl font-extrabold font-head"
                  style={{ color: tier.featured ? "#00f5d4" : "rgba(255,255,255,0.9)" }}
                >
                  ${tier.price}
                </span>
                <span className="text-sm pb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  /mo
                </span>
              </div>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                {tier.calls}
              </p>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <Check size={14} style={{ color: tier.featured ? "#00f5d4" : "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={tier.featured ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
