"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GradientText } from "@/components/ui/GradientText";

export function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card px-8 py-16"
          style={{
            background: "linear-gradient(135deg, rgba(0,245,212,0.04), rgba(123,97,255,0.04))",
            border: "1px solid rgba(0,245,212,0.15)",
          }}
        >
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Your First{" "}
            <GradientText>500 Calls</GradientText>
            <br />
            Are On Us
          </h2>
          <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Join 2,400+ companies using Bingo AI to scale outbound calling without scaling headcount.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn-primary text-base">
              Start Free Trial
              <ArrowRight size={16} />
            </a>
            <a href="#contact" className="btn-ghost text-base">
              Talk to Sales
            </a>
          </div>
          <p className="text-sm mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
            No credit card required. 14-day free trial. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
