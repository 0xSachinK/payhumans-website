"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LINKS } from "@/lib/constants";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "CLI", href: "#cli" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Earn", href: "/earn" },
  { label: "FAQ", href: "#faq" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-mono text-xs font-bold">P</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">
            PayHumans<span className="text-[var(--accent)]">.ai</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={LINKS.docs}
            className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            Docs
          </a>
          <a
            href={LINKS.github}
            className="text-sm font-medium text-[#050505] bg-[var(--fg)] hover:bg-white px-4 py-1.5 rounded-md transition-all hover:shadow-[0_0_16px_rgba(228,228,231,0.15)]"
          >
            Get started
          </a>
        </div>

        <button
          className="md:hidden p-2 flex flex-col gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-[var(--fg)] transition-all ${open ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-5 h-px bg-[var(--fg)] transition-all ${open ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.04]"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="text-sm text-[var(--secondary)] py-2" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a href={LINKS.github} className="text-sm font-medium text-center text-[#050505] bg-[var(--fg)] px-4 py-2 rounded-md mt-2">
                Get started
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
