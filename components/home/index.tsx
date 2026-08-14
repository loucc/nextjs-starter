import Hero from "@/components/home/Hero";
import ProductSubmission from "@/components/home/ProductSubmission";
import Waitlist from "@/components/home/Waitlist";
import WellnessSections from "@/components/home/WellnessSections";

export default function HomeComponent() {
  return (
    <>
      <Hero />
      <WellnessSections />
      <Waitlist />
      <ProductSubmission />
    </>
  );
}
