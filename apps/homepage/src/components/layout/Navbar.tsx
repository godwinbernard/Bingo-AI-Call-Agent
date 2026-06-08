"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(8,12,20,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(1.5)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 no-underline group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
                boxShadow: "0 2px 12px rgba(79,142,247,0.3)",
              }}
            >
              B
            </div>
            <span
              className="text-[15px] font-semibold font-head tracking-tight"
              style={{ color: "rgba(226,232,240,0.92)" }}
            >
              Bingo AI
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[13.5px] font-medium rounded-lg transition-all duration-200"
                style={{ color: "rgba(226,232,240,0.55)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(226,232,240,0.9)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(226,232,240,0.55)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-[13.5px] font-medium transition-colors duration-200"
              style={{ color: "rgba(226,232,240,0.55)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.55)")}
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-all duration-200 text-white"
              style={{ background: "#4F8EF7" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#6BA3F9";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(79,142,247,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#4F8EF7";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "rgba(226,232,240,0.7)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[68px] left-0 right-0 z-40 px-5 py-5 flex flex-col gap-1"
            style={{
              background: "rgba(8,12,20,0.97)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-3 px-3 text-[14px] font-medium rounded-lg transition-colors"
                style={{ color: "rgba(226,232,240,0.75)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <a
                href="#"
                className="py-3 text-[14px] font-medium text-center rounded-lg"
                style={{ color: "rgba(226,232,240,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Sign in
              </a>
              <a
                href="#pricing"
                className="py-3 text-[14px] font-semibold text-center rounded-lg text-white"
                style={{ background: "#4F8EF7" }}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
