import HeroSection from "@/components/HeroSection";
import LiveStatsBar from "@/components/LiveStatsBar";
import UnifiedGateway from "@/components/UnifiedGateway";
import FeaturesSection from "@/components/FeaturesSection";
import ProductReveal3D from "@/components/ProductReveal3D";
import ActivityFeed from "@/components/ActivityFeed";
import ComplaintWorkflow from "@/components/ComplaintWorkflow";
import PollutionMapSection from "@/components/PollutionMapSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import FloatingParticles from "@/components/FloatingParticles";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-transparent text-[#AEB9B5] relative selection:bg-[#5CE0A5]/20 selection:text-[#5CE0A5]">
      {/* Global Ambient Floating Particles Canvas */}
      <FloatingParticles />

      {/* Hero Section (1st 3D background video is UNTOUCHED) */}
      <HeroSection />

      <LiveStatsBar />

      {/* Unified Master Launchpad: 1 Link to Access Everything */}
      <UnifiedGateway />

      <FeaturesSection />

      {/* 3D Product Inspection Reveal Section */}
      <ProductReveal3D />

      <ActivityFeed />

      <ComplaintWorkflow />

      <PollutionMapSection />

      <AboutSection />

      <Footer />
    </main>
  );
}
