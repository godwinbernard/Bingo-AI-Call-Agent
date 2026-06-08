"use client";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Calendar } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email Us",
    description: "hello@bingo.ai",
    sub: "We reply within 2 hours",
    color: "#00f5d4",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our team",
    sub: "Mon–Fri 9am–6pm EST",
    color: "#7b61ff",
  },
  {
    icon: Calendar,
    title: "Book a Demo",
    description: "30-minute walkthrough",
    sub: "Pick a time that works for you",
    color: "#ff6b6b",
  },
];

export function ContactSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel color="purple">Contact</SectionLabel>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Get in{" "}
            <GradientText from="#7b61ff" to="#00f5d4">Touch</GradientText>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            Have questions? Our team is here to help.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {CHANNELS.map((ch, i) => (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="glass-card p-7 text-center cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${ch.color}15`, border: `1px solid ${ch.color}30` }}
              >
                <ch.icon size={20} style={{ color: ch.color }} />
              </div>
              <h3 className="font-bold mb-2 font-head" style={{ color: "rgba(255,255,255,0.9)" }}>
                {ch.title}
              </h3>
              <p className="text-sm font-medium mb-1" style={{ color: ch.color }}>
                {ch.description}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {ch.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
