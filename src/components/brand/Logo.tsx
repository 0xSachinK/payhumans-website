import Link from "next/link";
import { useId } from "react";

/*
  The mark: a square (the agent) hands off to a circle (the person).
  The circle sits in front and cuts a clean gap into the square, so the
  two read as separate parties that meet at one point: the payment.
*/
export function Mark({
  size = 28,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const mask = useId();
  return (
    <svg
      width={(size * 32) / 20}
      height={size}
      viewBox="0 6 32 20"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <circle cx="21.5" cy="16" r="10.9" fill="#000" />
        </mask>
      </defs>
      <rect x="1" y="8" width="16" height="16" rx="2.2" fill="var(--ink)" mask={`url(#${mask})`} />
      <circle cx="21.5" cy="16" r="9" fill="var(--pen)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      Pay<span className="pen">humans</span>
    </span>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="PayHumans.ai home">
      <Mark size={20} />
      <Wordmark />
    </Link>
  );
}
