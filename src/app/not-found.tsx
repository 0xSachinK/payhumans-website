import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LINKS } from "@/lib/constants";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="flex-1 flex items-center">
        <div className="wrap py-24">
          <p className="label mb-5">404</p>
          <h1 className="h2">
            No page at this address. <span className="pen">Nothing was paid.</span>
          </h1>
          <p className="lede mt-5 max-w-[34rem]">
            If you followed a link to an order, it may have been mistyped. Order and claim
            links open the claim page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-ink">
              Home
            </Link>
            <Link href={LINKS.docs} className="btn btn-line">
              Docs
            </Link>
            <Link href={LINKS.recover} className="btn btn-line">
              Claim page
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
