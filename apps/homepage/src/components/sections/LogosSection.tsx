"use client";
import { motion } from "framer-motion";
import { LOGO_BRANDS } from "@/lib/constants";

export function LogosSection() {
  return (
    <section className="py-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="divider mb-12" />
        <p
          className="text-center text-[11.5px] font-semibold mb-10 tracking-[0.12em] uppercase"
          style={{ color: "rgba(226,232,240,0.28)" }}
        >
          Trusted by 2,400+ revenue teams
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
          {LOGO_BRANDS.map((brand, i) => (
            <motion.span
              key={brand.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="text-[15px] font-bold font-head tracking-tight cursor-default transition-colors duration-200"
              style={{ color: "rgba(226,232,240,0.18)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.55)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.18)")}
            >
              {brand.name}
            </motion.span>
          ))}
        </div>
        <div className="divider mt-12" />
      </div>
    </section>
  );
}
