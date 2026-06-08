"use client";

const HEIGHTS = [40, 70, 55, 85, 60, 90, 75, 100, 65, 80, 50, 95, 70, 45, 85];

export function WaveformBars({ color = "#4F8EF7", playing = true }: { color?: string; playing?: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-12" aria-hidden>
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${h}%`,
            background: color,
            animation: playing ? `wave 1.2s ease-in-out ${i * 0.08}s infinite` : "none",
            opacity: playing ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
