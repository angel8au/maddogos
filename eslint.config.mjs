import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Plugin is already registered by eslint-config-next; only extend rules.
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "app/studio/**",
    "public/sw.js",
  ]),
]);

export default eslintConfig;
