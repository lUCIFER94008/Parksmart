import { HeroSearch } from "@/components/home/HeroSearch";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedLocations } from "@/components/home/FeaturedLocations";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero with Location Search & Time Interval Form */}
      <HeroSearch />

      {/* 2. Operational Live Availability Statistics */}
      <StatsSection />

      {/* 3. Featured Parking Locations Grid */}
      <FeaturedLocations />

      {/* 4. How It Works - 4-Step Process */}
      <HowItWorks />

      {/* 5. Platform Core Benefits & Features */}
      <BenefitsSection />

      {/* 6. User Feedback / Pilot Experience */}
      <TestimonialsSection />
    </div>
  );
}
