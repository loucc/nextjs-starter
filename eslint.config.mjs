import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Mirrors the previous .eslintrc.json ("next/core-web-vitals") — the
// project did not enable the stricter typescript preset.
const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**", // local wrangler dev state: bundled worker.js + sqlite can OOM ESLint
    ".idea/**",
    ".vscode/**",
    ".claude/**",
    ".github/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
