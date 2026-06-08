"use client";
import { motion, type Variants } from "framer-motion";
import { Mic2, Brain, Zap, BarChart3, Plug2, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const FEATURES = [
  {
    Icon: Mic2,
    title: "Ultra-Realistic Voice",
    description:
      "ElevenLabs-powered voices indistinguishable from humans. Natural pauses, dynamic tone, and emotional inflection across 48+ languages.",
    accent: "#4F8EF7",
  },
  {
    Icon: Brain,
    title: "Adaptive AI Brain",
    description:
      "Claude-powered engine handles objections, follows your script, and escalates intelligently. Learns from every call.",
    accent: "#8B5CF6",
  },
  {
    Icon: Zap,
    title: "Sub-500ms Response",
    description:
      "Streaming STT + parallel TTS pipeline delivers responses faster than any human rep. No awkward dead air.",
    accent: "#F59E0B",
  },
  {
    Icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Live monitoring, conversion funnels, A/B script testing, and exportable reports — all in one unified dashboard.",
    accent: "#4F8EF7",
  },
  {
    Icon: Plug2,
    title: "Native CRM Sync",
    description:
      "Push outcomes to HubSpot, Salesforce, Pipedrive, and 40+ apps via Zapier. Logged automatically after every call.",
    accent: "#8B5CF6",
  },
  {
    Icon: ShieldCheck,
    title: "Built-in Compliance",
    description:
      "Automatic DNC checking, TCPA calling-hours enforcement, consent recording, and full audit trails out of the box.",
    accent: "#10B981",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-18">
          <SectionLabel>Platform</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Everything you need to{" "}
            <span className="gradient-text">scale outreach</span>
          </h2>
          <p
            className="text-[1rem] sm:text-[1.06rem] max-w-[520px] mx-auto leading-[1.75]"
            style={{ color: "rgba(226,232,240,0.48)" }}
          >
            One platform. Unlimited calls. Replace your entire outbound calling team with AI that
            never sleeps, never hesitates, and always follows the script.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-7 cursor-default group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                style={{
                  background: `${f.accent}12`,
                  border: `1px solid ${f.accent}28`,
                }}
              >
                <f.Icon size={19} style={{ color: f.accent }} strokeWidth={1.75} />
              </div>
              <h3
                className="text-[15.5px] font-semibold font-head mb-2.5 leading-snug"
                style={{ color: "#E2E8F0" }}
              >
                {f.title}
              </h3>
              <p
                className="text-[13.5px] leading-[1.7]"
                style={{ color: "rgba(226,232,240,0.47)" }}
              >
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
