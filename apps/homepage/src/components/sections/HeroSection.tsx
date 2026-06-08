"use client";
import { motion } from "framer-motion";
import { ArrowRight, Play, PhoneCall } from "lucide-react";
import { WaveformBars } from "@/components/ui/WaveformBars";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const STATS = [
  { value: 47, suffix: "M+", label: "Calls Completed" },
  { value: 73, suffix: "%", label: "Live Answer Rate" },
  { value: 380, suffix: "ms", prefix: "<", label: "Response Latency" },
  { value: 48, suffix: "+", label: "Languages" },
];

const fadeUpInitial = { opacity: 0, y: 22 };
const fadeUpAnimate = { opacity: 1, y: 0 };

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-5 sm:px-8 overflow-hidden">
      {/* Background glow orbs */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(79,142,247,0.09) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto text-center">
        {/* Status badge */}
        <motion.div
          initial={fadeUpInitial}
          animate={fadeUpAnimate}
          transition={{ duration: 0.55, delay: 0, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 text-[13px] font-medium"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#10B981",
          }}
        >
          <span className="status-dot" />
          Live — 12,400 calls running right now
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={fadeUpInitial}
          animate={fadeUpAnimate}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="text-[2.6rem] sm:text-[3.6rem] md:text-[4.8rem] font-extrabold font-head leading-[1.06] tracking-tight mb-7"
          style={{ color: "#E2E8F0" }}
        >
          The AI That Calls{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Your Leads for You</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={fadeUpInitial}
          animate={fadeUpAnimate}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          className="text-[1.05rem] sm:text-[1.15rem] max-w-2xl mx-auto mb-11 leading-[1.75]"
          style={{ color: "rgba(226,232,240,0.52)" }}
        >
          Bingo AI deploys hyper-realistic voice agents that qualify leads, book appointments,
          and close deals at scale — 24/7, fully TCPA compliant.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={fadeUpInitial}
          animate={fadeUpAnimate}
          transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3.5 justify-center mb-20"
        >
          <a href="#pricing" className="btn-primary text-[14.5px]">
            Start Free Trial
            <ArrowRight size={15} />
          </a>
          <button className="btn-ghost flex items-center gap-2 text-[14.5px]">
            <Play size={13} fill="currentColor" />
            Watch a Demo Call
          </button>
        </motion.div>

        {/* Waveform */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.85 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="flex justify-center mb-16"
        >
          <div
            className="inline-flex items-center gap-5 px-8 py-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <PhoneCall size={15} style={{ color: "#4F8EF7" }} />
              <span className="text-[12px] font-medium" style={{ color: "rgba(226,232,240,0.5)" }}>
                Live call
              </span>
            </div>
            <WaveformBars />
            <span className="text-[12px] font-mono" style={{ color: "rgba(226,232,240,0.35)" }}>
              2:14
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              className="py-7 px-5 text-center"
              style={{ background: "rgba(8,12,20,0.85)" }}
            >
              <div
                className="text-[1.75rem] sm:text-[2rem] font-extrabold font-head mb-1 tabular-nums"
                style={{ color: "#4F8EF7" }}
              >
                <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="text-[12px] font-medium" style={{ color: "rgba(226,232,240,0.38)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
