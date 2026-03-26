"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedCounter({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) return;
    const m = value.match(/[\d.]+/);
    if (!m) return;
    const target = parseFloat(m[0]);
    const pre = value.slice(0, value.indexOf(m[0]));
    const suf = value.slice(value.indexOf(m[0]) + m[0].length);
    const dec = m[0].includes(".") ? m[0].split(".")[1].length : 0;
    const dur = 1100;
    const t0 = performance.now() + delay;
    function tick(now: number) {
      const e = now - t0;
      if (e < 0) { requestAnimationFrame(tick); return; }
      const p = Math.min(e / dur, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      setDisplay(`${pre}${v.toFixed(dec)}${suf}`);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="font-mono text-3xl md:text-4xl font-bold tracking-tight glow-text">
        {display}
      </div>
      <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.2em] mt-2">
        {label}
      </div>
    </motion.div>
  );
}
