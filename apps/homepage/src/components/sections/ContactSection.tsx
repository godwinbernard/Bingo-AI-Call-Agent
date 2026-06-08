"use client";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Calendar } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const CHANNELS = [
  {
    Icon: Mail,
    title: "Email Us",
    description: "hello@bingo.ai",
    sub: "We reply within 2 hours",
    accent: "#4F8EF7",
  },
  {
    Icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our team",
    sub: "Mon–Fri 9am–6pm EST",
    accent: "#8B5CF6",
  },
  {
    Icon: Calendar,
    title: "Book a Demo",
    description: "30-minute walkthrough",
    sub: "Pick a time that works for you",
    accent: "#10B981",
  },
];

export function ContactSection() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Contact</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.6rem] md:text-[3rem] font-extrabold font-head mt-5 mb-4 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            Get in{" "}
            <span className="gradient-text">touch</span>
          </h2>
          <p className="text-[1rem] max-w-sm mx-auto" style={{ color: "rgba(226,232,240,0.48)" }}>
            Our team is here to help. Choose how you'd like to reach us.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {CHANNELS.map((ch, i) => (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-7 text-center cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: `${ch.accent}10`,
                  border: `1px solid ${ch.accent}28`,
                }}
              >
                <ch.Icon size={18} style={{ color: ch.accent }} strokeWidth={1.75} />
              </div>
              <h3
                className="text-[14.5px] font-semibold font-head mb-2"
                style={{ color: "#E2E8F0" }}
              >
                {ch.title}
              </h3>
              <p className="text-[13px] font-medium mb-1" style={{ color: ch.accent }}>
                {ch.description}
              </p>
              <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.38)" }}>
                {ch.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
