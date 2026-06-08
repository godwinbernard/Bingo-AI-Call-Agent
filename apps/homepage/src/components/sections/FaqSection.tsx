"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 px-5 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>FAQ</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Common{" "}
            <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={
                open === i
                  ? {
                      background: "rgba(79,142,247,0.05)",
                      border: "1px solid rgba(79,142,247,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                aria-expanded={open === i}
              >
                <span
                  className="text-[14px] font-semibold leading-snug transition-colors duration-200"
                  style={{ color: open === i ? "#4F8EF7" : "#E2E8F0" }}
                >
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 0 : 0 }}
                  className="flex-shrink-0"
                >
                  {open === i ? (
                    <Minus size={15} style={{ color: "#4F8EF7" }} />
                  ) : (
                    <Plus size={15} style={{ color: "rgba(226,232,240,0.35)" }} />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      className="px-6 pb-6 text-[13.5px] leading-[1.75]"
                      style={{ color: "rgba(226,232,240,0.52)" }}
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
