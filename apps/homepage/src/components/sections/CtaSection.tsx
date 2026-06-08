"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden px-8 sm:px-14 py-16 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(79,142,247,0.07) 0%, rgba(139,92,246,0.07) 100%)",
            border: "1px solid rgba(79,142,247,0.2)",
            boxShadow: "0 4px 60px rgba(79,142,247,0.1)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,142,247,0.12), transparent)",
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-[1.9rem] sm:text-[2.6rem] font-extrabold font-head mb-5 tracking-tight leading-[1.12]"
              style={{ color: "#E2E8F0" }}
            >
              Your first{" "}
              <span className="gradient-text">500 calls</span>
              {" "}are on us
            </h2>
            <p
              className="text-[1rem] mb-10 max-w-md mx-auto leading-[1.75]"
              style={{ color: "rgba(226,232,240,0.52)" }}
            >
              Join 2,400+ revenue teams using Bingo AI to scale outbound calling without
              scaling headcount.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <a href="#pricing" className="btn-primary text-[14.5px]">
                Start Free Trial
                <ArrowRight size={15} />
              </a>
              <a href="#contact" className="btn-ghost text-[14.5px]">
                Talk to Sales
              </a>
            </div>
            <p
              className="text-[12px] mt-7"
              style={{ color: "rgba(226,232,240,0.3)" }}
            >
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
