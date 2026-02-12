import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**"],
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
