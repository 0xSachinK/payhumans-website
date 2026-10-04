import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ForAgents from "@/components/ForAgents";
import ForHumans from "@/components/ForHumans";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { CLI, FAQ as faq, LINKS, SITE } from "@/lib/constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#site`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#cli`,
      name: "PayHumans CLI",
      alternateName: CLI.packageName,
      applicationCategory: "DeveloperApplication",
      operatingSystem: `Node.js ${CLI.node} or newer`,
      description:
        "Command-line tool that lets an AI agent fund a human-executed fiat payment with supported crypto, track it, and withdraw unclaimed funds.",
      url: `${SITE.url}${LINKS.docs}`,
      downloadUrl: LINKS.npm,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE.url}/#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <ForAgents />
        <ForHumans />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
