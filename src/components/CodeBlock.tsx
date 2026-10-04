"use client";

import { Fragment, useState, type ReactNode } from "react";

const BASH_TOKEN =
  /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(--[\w-]+)|(\b(?:payhumans|npm|npx|node)\b(?![-\w]))|(<[\w-]+>)|(#.*$)/g;
const JSON_TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g;

function tokens(line: string, pattern: RegExp, classify: (m: RegExpExecArray) => [string, string, string?]): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  pattern.lastIndex = 0;
  for (let m = pattern.exec(line); m; m = pattern.exec(line)) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [cls, text, rest] = classify(m);
    out.push(
      <span key={m.index} className={cls}>
        {text}
      </span>,
    );
    if (rest) out.push(rest);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function highlight(code: string, lang: string): ReactNode {
  return code.split("\n").map((line, i) => {
    let content: ReactNode;
    if (lang === "json") {
      content = tokens(line, JSON_TOKEN, (m) =>
        m[1] ? [m[2] ? "t-p" : "t-s", m[1], m[2]] : ["t-n", m[3]],
      );
    } else if (lang === "text") {
      content = line;
    } else if (line.trimStart().startsWith("#")) {
      content = <span className="t-c">{line}</span>;
    } else {
      content = tokens(line, BASH_TOKEN, (m) =>
        m[1] ? ["t-s", m[1]] : m[2] ? ["t-f", m[2]] : m[3] ? ["t-k", m[3]] : m[4] ? ["t-s", m[4]] : ["t-c", m[5]],
      );
    }
    return (
      <Fragment key={i}>
        {content}
        {"\n"}
      </Fragment>
    );
  });
}

export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return { copied, copy };
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
  const { copied, copy } = useCopy(children);
  return (
    <div className="term">
      <div className="term-bar">
        <span className="sq" aria-hidden="true" />
        <span>{title ?? lang}</span>
        <button type="button" onClick={copy} className="term-copy" data-copied={copied} aria-label="Copy to clipboard">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{highlight(children, lang)}</code>
      </pre>
    </div>
  );
}

/* One-line command with a copy button, for the install step. */
export function InstallChip({ command }: { command: string }) {
  const { copied, copy } = useCopy(command);
  return (
    <div className="install">
      <span className="prompt" aria-hidden="true">
        $
      </span>
      <code>{command}</code>
      <button type="button" onClick={copy} data-copied={copied} aria-label={`Copy: ${command}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
