"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function hl(code: string, lang: string): string {
  if (lang === "json") return hlJSON(code);
  if (lang === "typescript") return hlTS(code);
  return hlBash(code);
}

function hlBash(code: string): string {
  return code.split("\n").map((l) => {
    if (l.trim().startsWith("#"))
      return `<span class="s-comment">${l}</span>`;
    return l
      .replace(/(--[\w-]+)/g, '<span class="s-flag">$1</span>')
      .replace(/\b(peer|npm|npx)\b/g, '<span class="s-kw">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="s-str">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="s-val">$1</span>');
  }).join("\n");
}

function hlJSON(code: string): string {
  return code
    .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="s-prop">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="s-str">$1</span>')
    .replace(/[{}[\]]/g, '<span class="s-br">$&</span>');
}

function hlTS(code: string): string {
  return code
    .replace(/\b(import|from|const|new)\b/g, '<span class="s-kw">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="s-str">$1</span>')
    .replace(/([\w]+)\s*:/g, '<span class="s-prop">$1</span>:')
    .replace(/\b(\d+)\b/g, '<span class="s-val">$1</span>')
    .replace(/\b(Zkp2pClient)\b/g, '<span class="s-type">$1</span>');
}

export default function CodeBlock({
  title,
  lang = "bash",
  children,
}: {
  title?: string;
  lang?: string;
  children: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="terminal"
    >
      <div className="terminal-bar">
        <div className="terminal-dot bg-[#ff5f57]" />
        <div className="terminal-dot bg-[#febc2e]" />
        <div className="terminal-dot bg-[#28c840]" />
        {title ? (
          <span className="ml-3 text-[11px] text-[var(--muted)] font-mono">
            {title}
          </span>
        ) : null}
      </div>
      <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <code dangerouslySetInnerHTML={{ __html: hl(children, lang) }} />
      </pre>
    </motion.div>
  );
}
