"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LINKS } from "@/lib/constants";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For agents", href: "/#agents" },
  { label: "Limits", href: "/#limits" },
  { label: "Docs", href: LINKS.docs },
  { label: "Earn", href: LINKS.earn },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="PayHumans.ai home">
      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#4ade80] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
          <path d="M4 12h12M12 6l6 6-6 6" />
        </svg>
      </span>
      <span className="font-semibold text-sm tracking-tight">
        PayHumans<span className="text-[var(--muted)]">.ai</span>
      </span>
    </Link>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.05]"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/docs#quickstart"
            className="text-sm font-medium text-[#050505] bg-[var(--fg)] hover:bg-white px-4 py-1.5 rounded-md transition-all"
          >
            Onboard an agent
          </Link>
        </div>

        <button
          className="md:hidden p-2 flex flex-col gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
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
            className="md:hidden overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-[var(--secondary)] py-2" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <Link
                href="/docs#quickstart"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-center text-[#050505] bg-[var(--fg)] px-4 py-2 rounded-md mt-2"
              >
                Onboard an agent
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
