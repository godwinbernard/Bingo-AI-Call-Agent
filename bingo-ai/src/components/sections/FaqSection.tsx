"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="teal">FAQ</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Common{" "}
            <GradientText>Questions</GradientText>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden"
              style={open === i ? { border: "1px solid rgba(0,245,212,0.2)" } : {}}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: open === i ? "#00f5d4" : "rgba(255,255,255,0.85)" }}
                >
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      className="px-6 pb-5 text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
