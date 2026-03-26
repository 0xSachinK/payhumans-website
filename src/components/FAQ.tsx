"use client";

import * as Accordion from "@radix-ui/react-accordion";
import SectionReveal from "./SectionReveal";
import { FAQ as items } from "@/lib/constants";

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Questions
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            Frequently asked.
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-16 text-base">
            Everything you need to know about PayHumans and the Peer protocol.
          </p>
        </SectionReveal>

        <SectionReveal>
          <Accordion.Root type="single" collapsible className="space-y-2">
            {items.map((item, i) => (
              <Accordion.Item
                key={i}
                value={`item-${i}`}
                className="frost overflow-hidden"
              >
                <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-medium hover:bg-white/[0.015] transition-colors group">
                  <span>{item.q}</span>
                  <svg
                    className="chevron w-4 h-4 text-[var(--muted)] shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-[slideDown_200ms_ease] data-[state=closed]:animate-[slideUp_200ms_ease]">
                  <div className="px-6 pb-5 text-sm text-[var(--secondary)] leading-relaxed">
                    {item.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </SectionReveal>
      </div>
    </section>
  );
}
