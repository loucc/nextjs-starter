import { notFound } from "next/navigation";

// Catch-all so that unmatched paths inside a locale segment render the
// localized [locale]/not-found.tsx instead of the root (plain English)
// not-found.
export default function CatchAllPage() {
  notFound();
}
