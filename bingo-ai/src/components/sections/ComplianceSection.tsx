"use client";
import { motion } from "framer-motion";
import { COMPLIANCE_BADGES } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

export function ComplianceSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <SectionLabel color="red">Compliance</SectionLabel>
        <h2
          className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          Enterprise-Grade{" "}
          <GradientText from="#ff6b6b" to="#7b61ff">Security & Compliance</GradientText>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
          Every call is made with compliance built in. Automatic DNC checks, TCPA hour enforcement,
          consent recording, and full audit trails for every interaction.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {COMPLIANCE_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl"
              style={{
                background: "rgba(255,107,107,0.05)",
                border: "1px solid rgba(255,107,107,0.2)",
              }}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                {badge.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
