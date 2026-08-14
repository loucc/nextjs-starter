import Hero from "@/components/home/Hero";
import ProductSubmission from "@/components/home/ProductSubmission";
import Showcase from "@/components/home/Showcase";
import Waitlist from "@/components/home/Waitlist";
import WellnessSections from "@/components/home/WellnessSections";

export default function HomeComponent() {
  return (
    <>
      <Hero />
      <WellnessSections />
      <Showcase />
      <Waitlist />
      <ProductSubmission />
    </>
  );
}
