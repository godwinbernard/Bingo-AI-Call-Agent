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
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
                  boxShadow: "0 2px 12px rgba(79,142,247,0.25)",
                }}
              >
                B
              </div>
              <span
                className="font-semibold font-head text-[15px]"
                style={{ color: "rgba(226,232,240,0.9)" }}
              >
                Bingo AI
              </span>
            </div>
            <p
              className="text-[13px] leading-[1.7] mb-5"
              style={{ color: "rgba(226,232,240,0.38)" }}
            >
              The world&apos;s most advanced AI call agent platform. Built for
              scale, compliance, and conversion.
            </p>
            <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.28)" }}>
              hello@bingo.ai
            </p>
          </div>

          {/* Link cols */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4
                className="text-[12px] font-semibold mb-5 tracking-[0.08em] uppercase"
                style={{ color: "rgba(226,232,240,0.45)" }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] transition-colors duration-200"
                      style={{ color: "rgba(226,232,240,0.38)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(226,232,240,0.78)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(226,232,240,0.38)")
                      }
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
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.28)" }}>
            © {new Date().getFullYear()} Bingo AI, Inc. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: "rgba(226,232,240,0.28)" }}>
            Built for sales teams who move fast
          </p>
        </div>
      </div>
    </footer>
  );
}
