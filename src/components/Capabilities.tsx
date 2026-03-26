"use client";

import SectionReveal from "./SectionReveal";
import { CAPABILITIES } from "@/lib/constants";

export default function Capabilities() {
  return (
    <section id="capabilities" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Status
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            What agents can do today.
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-16 text-base">
            Nine capabilities live in production. One more coming soon.
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="frost overflow-hidden">
            <div className="grid gap-0 divide-y divide-white/[0.04]">
              {CAPABILITIES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className={c.status === "live" ? "badge-live" : "badge-soon"}
                    >
                      {c.status === "live" ? "Live" : "Soon"}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {c.name}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-[var(--muted)] hidden sm:block truncate ml-4">
                    {c.command}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
