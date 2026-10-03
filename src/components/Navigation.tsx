"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./brand/Logo";
import { LINKS } from "@/lib/constants";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For agents", href: "/#agents" },
  { label: "For humans", href: LINKS.earn },
  { label: "Docs", href: LINKS.docs },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="wrap h-16 flex items-center justify-between gap-6">
        <Logo />

        <nav className="hidden md:flex items-center gap-7" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <Link href={LINKS.cliDocs} className="btn btn-ink btn-sm">
            Install the CLI
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden -mr-2 p-2 flex flex-col gap-[5px]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${open ? "translate-y-[3.25px] rotate-45" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${open ? "-translate-y-[3.25px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open ? (
        <nav id="mobile-menu" className="md:hidden border-t border-rule" aria-label="Main">
          <div className="wrap py-3 flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-3 text-[15px] text-ink-2 border-b border-rule" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href={LINKS.cliDocs} onClick={() => setOpen(false)} className="btn btn-ink mt-4 mb-2">
              Install the CLI
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
