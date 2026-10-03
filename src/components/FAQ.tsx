import Link from "next/link";
import { FAQ as items, LINKS } from "@/lib/constants";

export default function FAQ() {
  return (
    <section id="faq" className="band">
      <div className="wrap grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-8 lg:gap-16">
        <div>
          <p className="label mb-4">Questions</p>
          <h2 className="h2">Asked before funding.</h2>
          <p className="body mt-4 text-[15px]">
            The{" "}
            <Link href={LINKS.docs} className="link">
              docs
            </Link>{" "}
            go further on every one of these.
          </p>
        </div>
        <div className="faq">
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p className="answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
