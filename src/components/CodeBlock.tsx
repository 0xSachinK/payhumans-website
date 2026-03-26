"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";

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
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="s-str">$1</span>')
      .replace(/(--[\w-]+)/g, '<span class="s-flag">$1</span>')
      .replace(/\b(peer|npm|npx)\b(\s+)([\w-]+)/g, '<span class="s-kw">$1</span>$2<span class="s-cmd">$3</span>')
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
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="terminal group/term"
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
        <button
          onClick={copy}
          className="ml-auto text-[11px] font-mono text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover/term:opacity-100 transition-all px-2 py-0.5 rounded hover:bg-white/[0.06]"
          aria-label="Copy code"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-[13px] leading-[1.7] font-mono">
        <code dangerouslySetInnerHTML={{ __html: hl(children, lang) }} />
      </pre>
    </motion.div>
  );
}
