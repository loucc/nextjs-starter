import { describe, expect, it } from "vitest";
import { extractFontUrl } from "./ogFonts";

const CSS2_SAMPLE = `
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.ttf) format('truetype');
}
`;

describe("extractFontUrl", () => {
  it("extracts the first ttf url from a css2 response", () => {
    expect(extractFontUrl(CSS2_SAMPLE)).toBe(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.ttf"
    );
  });

  it("ignores woff2 sources (unsupported by satori)", () => {
    expect(
      extractFontUrl("@font-face { src: url(https://x/f.woff2) format('woff2'); }")
    ).toBe(null);
  });

  it("returns null when no supported source exists", () => {
    expect(extractFontUrl("")).toBe(null);
  });
});
