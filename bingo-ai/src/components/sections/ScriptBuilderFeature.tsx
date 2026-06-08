"use client";
import { motion } from "framer-motion";
import { GitBranch, Type, Zap } from "lucide-react";
import { ScriptPreview } from "@/components/ui/ScriptPreview";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

const POINTS = [
  { icon: Type, text: "Variable injection: {{first_name}}, {{company}}, and any custom field" },
  { icon: GitBranch, text: "Branching logic for objections, interest signals, and callbacks" },
  { icon: Zap, text: "One-click A/B testing to find your highest-converting script" },
];

export function ScriptBuilderFeature() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — mockup */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1"
        >
          <ScriptPreview />
        </motion.div>

        {/* Right — copy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-2"
        >
          <SectionLabel color="purple">Script Builder</SectionLabel>
          <h2
            className="text-3xl sm:text-4xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Write Scripts That{" "}
            <GradientText from="#7b61ff" to="#ff6b6b">Actually Convert</GradientText>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Our visual script builder lets you craft dynamic conversations with branching logic,
            variable personalization, and objection-handling trees.
          </p>
          <div className="flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(123,97,255,0.1)", border: "1px solid rgba(123,97,255,0.2)" }}
                >
                  <Icon size={14} style={{ color: "#7b61ff" }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
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
