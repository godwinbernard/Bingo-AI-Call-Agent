"use client";

const BUBBLES = [
  {
    role: "agent",
    text: "Hi {{first_name}}, this is Alex from {{company_name}}. Do you have 30 seconds?",
    color: "#4F8EF7",
  },
  {
    role: "prospect",
    text: "Sure, what's this about?",
    color: "rgba(255,255,255,0.7)",
  },
  {
    role: "agent",
    text: "Great! We help businesses like yours cut outreach costs by 80% with AI-powered calling...",
    color: "#4F8EF7",
  },
];

const BRANCHES = [
  { label: "Interested", color: "#4F8EF7", bg: "rgba(0,245,212,0.12)" },
  { label: "Objection", color: "#8B5CF6", bg: "rgba(123,97,255,0.12)" },
  { label: "Not now", color: "#F59E0B", bg: "rgba(255,107,107,0.12)" },
];

export function ScriptPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "var(--font-inter), sans-serif",
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
          Script Builder
        </span>
      </div>

      <div className="p-4">
        {/* Chat bubbles */}
        <div className="flex flex-col gap-3 mb-4">
          {BUBBLES.map((b, i) => (
            <div
              key={i}
              className={`flex ${b.role === "prospect" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="rounded-xl px-3 py-2 max-w-[85%] text-xs leading-relaxed"
                style={{
                  background:
                    b.role === "agent"
                      ? "rgba(0,245,212,0.08)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    b.role === "agent"
                      ? "1px solid rgba(0,245,212,0.2)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: b.color,
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {b.text}
              </div>
            </div>
          ))}
        </div>

        {/* Branch options */}
        <div
          className="pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Response branches:
          </div>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((br) => (
              <span
                key={br.label}
                className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer"
                style={{
                  background: br.bg,
                  border: `1px solid ${br.color}40`,
                  color: br.color,
                }}
              >
                {br.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
