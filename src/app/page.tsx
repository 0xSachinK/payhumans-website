import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Differentiator from "@/components/Differentiator";
import PeerCLI from "@/components/PeerCLI";
import Capabilities from "@/components/Capabilities";
import ForLPs from "@/components/ForLPs";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Differentiator />
        <PeerCLI />
        <Capabilities />
        <ForLPs />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
