import { Hero } from "@/components/landing/Hero";
import { SellingPoints } from "@/components/landing/SellingPoints";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LiveDonationFeed } from "@/components/landing/LiveDonationFeed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SellingPoints />
      <HowItWorks />
      <LiveDonationFeed />
    </>
  );
}
