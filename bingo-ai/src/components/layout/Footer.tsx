"use client";

const COLS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "TCPA Compliance", "DPA"],
  },
];

export function Footer() {
  return (
    <footer
      className="relative z-10 pt-16 pb-8"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ background: "linear-gradient(135deg, #00f5d4, #7b61ff)" }}
              >
                B
              </div>
              <span className="font-bold font-head" style={{ color: "rgba(255,255,255,0.9)" }}>
                Bingo AI
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              The world&apos;s most advanced AI call agent platform. Built for scale, compliance, and conversion.
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              hello@bingo.ai
            </p>
          </div>

          {/* Link cols */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Bingo AI, Inc. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Made with ❤️ for sales teams everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
