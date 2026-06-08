"use client";
import { motion, type Variants } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Quote } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const ACCENT_COLORS: Record<string, string> = {
  "#00f5d4": "#4F8EF7",
  "#7b61ff": "#8B5CF6",
  "#ff6b6b": "#10B981",
};

export function TestimonialsSection() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-18">
          <SectionLabel>Customer Stories</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Loved by revenue teams{" "}
            <span className="gradient-text">worldwide</span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {TESTIMONIALS.map((t) => {
            const accentColor = ACCENT_COLORS[t.color] ?? "#4F8EF7";
            return (
              <motion.div
                key={t.name}
                variants={cardVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="glass-card p-7 flex flex-col"
              >
                <Quote size={18} style={{ color: `${accentColor}60` }} className="mb-5" />
                <p
                  className="text-[14px] leading-[1.75] flex-1 mb-7"
                  style={{ color: "rgba(226,232,240,0.6)" }}
                >
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[12px]"
                    style={{
                      background: `${accentColor}14`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold" style={{ color: "#E2E8F0" }}>
                      {t.name}
                    </p>
                    <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.38)" }}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
