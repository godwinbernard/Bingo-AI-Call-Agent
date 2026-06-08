"use client";
import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="purple">How It Works</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Launch Your First Campaign{" "}
            <GradientText from="#7b61ff" to="#00f5d4">in Minutes</GradientText>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 h-full w-px hidden lg:block"
            style={{
              background: "linear-gradient(to bottom, rgba(0,245,212,0.4), rgba(123,97,255,0.4), rgba(255,107,107,0.1))",
            }}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-extrabold font-mono"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#00f5d4",
                  }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-base font-bold font-head mb-3"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
