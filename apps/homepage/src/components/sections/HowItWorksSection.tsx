"use client";
import { motion } from "framer-motion";
import { Upload, PenLine, Rocket, TrendingUp } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const STEPS = [
  {
    number: "01",
    Icon: Upload,
    title: "Upload Your Contacts",
    description:
      "Import a CSV with names, numbers, and custom variables. We validate, dedupe, and format automatically.",
  },
  {
    number: "02",
    Icon: PenLine,
    title: "Build Your Script",
    description:
      "Use the visual script builder to define your opening, pitch, objection handling, and CTA branches.",
  },
  {
    number: "03",
    Icon: Rocket,
    title: "Launch Campaign",
    description:
      "Set calling hours, concurrency, and retry logic. Hit launch and watch calls go out in real time.",
  },
  {
    number: "04",
    Icon: TrendingUp,
    title: "Review & Optimize",
    description:
      "Full transcripts, sentiment scores, and conversion analytics. Refine your script and scale what works.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-18">
          <SectionLabel>How It Works</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Launch your first campaign{" "}
            <span className="gradient-text">in under 10 minutes</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connector line desktop */}
          <div
            className="absolute top-7 left-[12.5%] right-[12.5%] h-px hidden lg:block"
            style={{
              background: "linear-gradient(90deg, rgba(79,142,247,0.3), rgba(139,92,246,0.3))",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center text-center relative z-10"
            >
              {/* Step icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "rgba(79,142,247,0.08)",
                  border: "1px solid rgba(79,142,247,0.2)",
                  boxShadow: "0 4px 20px rgba(79,142,247,0.1)",
                }}
              >
                <step.Icon size={20} style={{ color: "#4F8EF7" }} strokeWidth={1.75} />
              </div>
              <div
                className="text-[10px] font-bold font-mono mb-3 tracking-[0.12em]"
                style={{ color: "rgba(79,142,247,0.7)" }}
              >
                STEP {step.number}
              </div>
              <h3
                className="text-[14.5px] font-semibold font-head mb-2.5 leading-snug"
                style={{ color: "#E2E8F0" }}
              >
                {step.title}
              </h3>
              <p
                className="text-[13px] leading-[1.7]"
                style={{ color: "rgba(226,232,240,0.45)" }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
