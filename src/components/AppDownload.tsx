import AppQr from "./AppQr";
import { LINKS } from "@/lib/constants";

/* Official Peer app links: QR for a phone camera, store links for tapping. */
export default function AppDownload({ className = "" }: { className?: string }) {
  return (
    <div className={`slip ${className}`}>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="label !text-ink">Get the Peer app</span>
        <span className="label hidden min-[380px]:inline">iOS and Android</span>
      </div>
      <div className="guilloche" aria-hidden="true" />
      <div className="p-5 flex flex-col min-[420px]:flex-row gap-5 min-[420px]:items-center">
        <a
          href={LINKS.peerOnboard}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start rounded-lg border border-rule bg-white p-1.5"
          aria-label="Open the Peer app download page"
        >
          <AppQr size={148} />
        </a>
        <div className="min-w-0">
          <p className="text-[15px] leading-[1.5] text-ink-2">
            Scan with your phone camera, or open a store listing.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href={LINKS.appStore} target="_blank" rel="noopener noreferrer" className="btn btn-ink btn-sm justify-between">
              App Store <span aria-hidden="true">&#8599;</span>
            </a>
            <a href={LINKS.playStore} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm justify-between">
              Google Play <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
      </div>
      <div className="perf" aria-hidden="true" />
      <p className="stub px-5 py-3.5 bg-paper-2/60">
        Listed as &ldquo;Peer: Pay &amp; Earn&rdquo;. The app is made by Peer, not by PayHumans.
      </p>
    </div>
  );
}
