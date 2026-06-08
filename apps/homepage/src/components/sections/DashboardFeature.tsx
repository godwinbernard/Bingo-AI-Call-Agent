"use client";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { DashboardMockup } from "@/components/ui/DashboardMockup";
import { SectionLabel } from "@/components/ui/SectionLabel";

const POINTS = [
  { icon: BarChart3, text: "Real-time call monitoring with live status updates" },
  { icon: TrendingUp, text: "Conversion analytics with A/B script testing" },
  { icon: Users, text: "Team management and concurrent call controls" },
];

export function DashboardFeature() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <SectionLabel>Dashboard</SectionLabel>
          <h2
            className="text-[1.9rem] sm:text-[2.4rem] font-extrabold font-head mt-5 mb-5 tracking-tight leading-[1.12]"
            style={{ color: "#E2E8F0" }}
          >
            See every call{" "}
            <span className="gradient-text">in real time</span>
          </h2>
          <p
            className="text-[1rem] leading-[1.75] mb-9"
            style={{ color: "rgba(226,232,240,0.5)" }}
          >
            Monitor active calls, track conversion rates, and optimize your campaigns — all from
            a unified dashboard built for operations teams.
          </p>
          <div className="flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.2)",
                  }}
                >
                  <Icon size={14} style={{ color: "#4F8EF7" }} strokeWidth={1.75} />
                </div>
                <p
                  className="text-[13.5px] leading-[1.7]"
                  style={{ color: "rgba(226,232,240,0.58)" }}
                >
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
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
