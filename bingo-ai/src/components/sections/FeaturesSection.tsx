"use client";
import { motion } from "framer-motion";
import { FEATURES } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

const COLOR_MAP = {
  teal: { bg: "rgba(0,245,212,0.06)", border: "rgba(0,245,212,0.15)", text: "#00f5d4" },
  purple: { bg: "rgba(123,97,255,0.06)", border: "rgba(123,97,255,0.15)", text: "#7b61ff" },
  red: { bg: "rgba(255,107,107,0.06)", border: "rgba(255,107,107,0.15)", text: "#ff6b6b" },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="teal">Features</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Everything You Need to{" "}
            <GradientText>Scale Outreach</GradientText>
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            One platform. Unlimited calls. Zero overhead. Replace your entire outbound calling team.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const c = COLOR_MAP[f.color];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-lg font-bold font-head mb-3"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
