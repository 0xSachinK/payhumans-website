"use client";

import dynamic from "next/dynamic";
import EarnSteps from "./EarnSteps";
import EarnCTA from "./EarnCTA";
import EarnDashboard from "./EarnDashboard";
import EarnRoadmap from "./EarnRoadmap";
import ExtensionCheck from "./ExtensionCheck";
import Footer from "@/components/Footer";

const Web3Provider = dynamic(() => import("@/providers/Web3Provider"), {
  ssr: false,
});
const EarnNavigation = dynamic(() => import("./EarnNavigation"), {
  ssr: false,
});
const EarnHero = dynamic(() => import("./EarnHero"), { ssr: false });
const JobBoard = dynamic(() => import("./JobBoard"), { ssr: false });

export default function EarnPageClient() {
  return (
    <Web3Provider>
      <EarnNavigation />
      <main>
        <EarnHero />
        <ExtensionCheck />
        <EarnDashboard />
        <EarnSteps />
        <JobBoard />
        <EarnCTA />
        <EarnRoadmap />
      </main>
      <Footer />
    </Web3Provider>
  );
}
