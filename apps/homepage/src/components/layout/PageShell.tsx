import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  label?: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function PageShell({ title, subtitle, label, children, lastUpdated }: PageShellProps) {
  return (
    <div className="min-h-screen" style={{ background: "#080C14" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 h-14 flex items-center px-5 sm:px-8"
        style={{
          background: "rgba(8,12,20,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
            style={{ color: "rgba(226,232,240,0.5)" }}
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white"
              style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)" }}
            >
              B
            </div>
            <span className="text-[14px] font-semibold font-head" style={{ color: "rgba(226,232,240,0.85)" }}>
              Bingo AI
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        {label && (
          <div className="section-label mb-6">{label}</div>
        )}
        <h1
          className="text-[2rem] sm:text-[2.6rem] font-extrabold font-head tracking-tight leading-[1.1] mb-4"
          style={{ color: "#E2E8F0" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[1.05rem] leading-[1.75] max-w-2xl" style={{ color: "rgba(226,232,240,0.5)" }}>
            {subtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="text-[12px] mt-4" style={{ color: "rgba(226,232,240,0.28)" }}>
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
        {children}
      </div>

      {/* Footer strip */}
      <div
        className="max-w-4xl mx-auto px-5 sm:px-8 pb-12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.25)" }}>
          © {new Date().getFullYear()} Bingo AI, Inc. All rights reserved.
        </p>
        <Link href="/" className="text-[12px] transition-colors" style={{ color: "rgba(226,232,240,0.35)" }}>
          bingo.ai
        </Link>
      </div>
    </div>
  );
}
