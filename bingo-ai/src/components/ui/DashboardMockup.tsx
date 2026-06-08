"use client";
import { useEffect, useState } from "react";

const CALLS = [
  { name: "Sarah Johnson", status: "Converted", duration: "4:23", time: "2m ago", color: "#00f5d4" },
  { name: "Michael Chen", status: "Callback", duration: "2:10", time: "5m ago", color: "#7b61ff" },
  { name: "Emma Davis", status: "Converted", duration: "6:05", time: "8m ago", color: "#00f5d4" },
  { name: "James Wilson", status: "No Answer", duration: "0:30", time: "11m ago", color: "#ff6b6b" },
  { name: "Olivia Martinez", status: "Voicemail", duration: "1:15", time: "14m ago", color: "rgba(255,255,255,0.4)" },
];

export function DashboardMockup() {
  const [activeCount, setActiveCount] = useState(247);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveCount((n) => Math.floor(Math.random() * 100) + 250);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          bingo.ai/dashboard
        </span>
      </div>

      <div className="p-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Active Now", value: activeCount, color: "#00f5d4" },
            { label: "Converted", value: "38%", color: "#7b61ff" },
            { label: "Avg Duration", value: "3:42", color: "#ff6b6b" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="text-lg font-bold font-head" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call list */}
        <div className="flex flex-col gap-2">
          {CALLS.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: `${c.color}20`, color: c.color }}
                >
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {c.name}
                  </div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {c.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold" style={{ color: c.color }}>
                  {c.status}
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {c.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
