"use client";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="purple">Testimonials</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Loved by{" "}
            <GradientText from="#7b61ff" to="#00f5d4">Sales Teams</GradientText>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass-card p-7"
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
