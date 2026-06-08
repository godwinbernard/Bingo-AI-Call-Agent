"use client";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { WaveformBars } from "@/components/ui/WaveformBars";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GradientText } from "@/components/ui/GradientText";

const STATS = [
  { value: 47, suffix: "M+", label: "Calls Made" },
  { value: 73, suffix: "%", label: "Answer Rate" },
  { value: 380, suffix: "ms", prefix: "<", label: "Latency" },
  { value: 48, suffix: "+", label: "Languages" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{
            background: "rgba(0,245,212,0.08)",
            border: "1px solid rgba(0,245,212,0.2)",
            color: "#00f5d4",
          }}
        >
          <span className="status-dot" />
          AI Call Agent — Now in Production
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-head leading-[1.05] mb-6"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          Make{" "}
          <GradientText>10,000 Calls</GradientText>
          <br />
          While You Sleep
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Bingo AI deploys hyper-realistic AI call agents that qualify leads, book appointments,
          and close deals — at scale, 24/7, with full TCPA compliance.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <a href="#pricing" className="btn-primary text-base">
            Start Free Trial
            <ArrowRight size={16} />
          </a>
          <button className="btn-ghost flex items-center gap-2 text-base">
            <Play size={14} fill="currentColor" />
            Watch Demo
          </button>
        </motion.div>

        {/* Waveform */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center mb-16"
        >
          <WaveformBars />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl sm:text-3xl font-extrabold font-head mb-1"
                style={{ color: "#00f5d4" }}
              >
                <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
