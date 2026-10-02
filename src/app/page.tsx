import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PeerCLI from "@/components/PeerCLI";
import ForLPs from "@/components/ForLPs";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <PeerCLI />
        <ForLPs />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
