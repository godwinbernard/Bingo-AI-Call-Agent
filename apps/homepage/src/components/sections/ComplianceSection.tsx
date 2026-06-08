"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Globe, Phone, CreditCard, Bot } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const BADGES = [
  { Icon: Lock, label: "SOC 2 Type II" },
  { Icon: ShieldCheck, label: "HIPAA Ready" },
  { Icon: Globe, label: "GDPR Compliant" },
  { Icon: Phone, label: "TCPA Compliant" },
  { Icon: CreditCard, label: "PCI DSS" },
  { Icon: Bot, label: "EU AI Act" },
];

export function ComplianceSection() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <SectionLabel>Security &amp; Compliance</SectionLabel>
        <h2
          className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
          style={{ color: "#E2E8F0" }}
        >
          Enterprise-grade{" "}
          <span className="gradient-text">trust &amp; compliance</span>
        </h2>
        <p
          className="text-[1rem] max-w-[520px] mx-auto mb-14 leading-[1.75]"
          style={{ color: "rgba(226,232,240,0.48)" }}
        >
          Every call is made with compliance built in. Automatic DNC checks, TCPA enforcement,
          consent recording, and full audit trails for every interaction.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {BADGES.map(({ Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-default"
              style={{
                background: "rgba(79,142,247,0.06)",
                border: "1px solid rgba(79,142,247,0.18)",
              }}
            >
              <Icon size={14} style={{ color: "#4F8EF7" }} strokeWidth={2} />
              <span
                className="text-[13px] font-semibold"
                style={{ color: "rgba(226,232,240,0.78)" }}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
