import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Differentiator from "@/components/Differentiator";
import HowItWorks from "@/components/HowItWorks";
import PeerCLI from "@/components/PeerCLI";
import IntegrationPaths from "@/components/IntegrationPaths";
import Capabilities from "@/components/Capabilities";
import ForLPs from "@/components/ForLPs";
import Stats from "@/components/Stats";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <Differentiator />
        <HowItWorks />
        <PeerCLI />
        <IntegrationPaths />
        <Capabilities />
        <ForLPs />
        <Stats />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
