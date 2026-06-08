"use client";
import { motion } from "framer-motion";
import { LOGO_BRANDS } from "@/lib/constants";

export function LogosSection() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <p
          className="text-center text-sm font-medium mb-10 tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Trusted by 2,400+ companies including
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
          {LOGO_BRANDS.map((brand, i) => (
            <motion.span
              key={brand.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-lg font-bold font-head tracking-tight"
              style={{ color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
            >
              {brand.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
