"use client";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface Props {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2000 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const value = useAnimatedCounter(target, duration, inView);

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
