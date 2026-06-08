"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,5,16,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{ background: "linear-gradient(135deg, #00f5d4, #7b61ff)" }}
            >
              B
            </div>
            <span
              className="text-base font-bold font-head"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Bingo AI
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00f5d4")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Log in
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: "#00f5d4", color: "#050510" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "none")}
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 px-4 py-4 flex flex-col gap-3"
            style={{
              background: "rgba(5,5,16,0.97)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-2 text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <a
                href="#"
                className="py-2 text-sm font-medium text-center rounded-lg"
                style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                Log in
              </a>
              <a
                href="#"
                className="py-2 text-sm font-semibold text-center rounded-lg"
                style={{ background: "#00f5d4", color: "#050510" }}
              >
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
