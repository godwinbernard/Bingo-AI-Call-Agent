"use client";
import { motion } from "framer-motion";
import { GitBranch, Type, Zap } from "lucide-react";
import { ScriptPreview } from "@/components/ui/ScriptPreview";
import { SectionLabel } from "@/components/ui/SectionLabel";

const POINTS = [
  { icon: Type, text: "Variable injection: {{first_name}}, {{company}}, and any custom field" },
  { icon: GitBranch, text: "Branching logic for objections, interest signals, and callbacks" },
  { icon: Zap, text: "One-click A/B testing to find your highest-converting script" },
];

export function ScriptBuilderFeature() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — mockup */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-2 lg:order-1"
        >
          <ScriptPreview />
        </motion.div>

        {/* Right — copy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-1 lg:order-2"
        >
          <SectionLabel>Script Builder</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.4rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Write scripts that{" "}
            <span className="gradient-text">actually convert</span>
          </h2>
          <p
            className="text-[1rem] leading-[1.75] mb-9"
            style={{ color: "rgba(226,232,240,0.5)" }}
          >
            Craft dynamic conversations with branching logic, variable personalization,
            and objection-handling trees — no engineering required.
          </p>
          <div className="flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <Icon size={14} style={{ color: "#8B5CF6" }} strokeWidth={1.75} />
                </div>
                <p
                  className="text-[13.5px] leading-[1.7]"
                  style={{ color: "rgba(226,232,240,0.58)" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
