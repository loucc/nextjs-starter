import type { MDXComponents } from "mdx/types";
import SiteMDXComponents from "@/components/mdx/MDXComponents";

// @next/mdx automatically applies this to every compiled .mdx file
// (works in Server Components, unlike MDXProvider which needs the client).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...SiteMDXComponents,
    ...components,
  };
}
