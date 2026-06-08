"use client";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { DashboardMockup } from "@/components/ui/DashboardMockup";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";

const POINTS = [
  { icon: BarChart3, text: "Real-time call monitoring with live status updates" },
  { icon: TrendingUp, text: "Conversion analytics with A/B script testing" },
  { icon: Users, text: "Team management and concurrent call controls" },
];

export function DashboardFeature() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel color="teal">Dashboard</SectionLabel>
          <h2
            className="text-3xl sm:text-4xl font-extrabold font-head mt-5 mb-5"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            See Every Call{" "}
            <GradientText>in Real Time</GradientText>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Monitor active calls, track conversion rates, and optimize your campaigns—all from
            a single, beautiful dashboard built for operations teams.
          </p>
          <div className="flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}
                >
                  <Icon size={14} style={{ color: "#00f5d4" }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
