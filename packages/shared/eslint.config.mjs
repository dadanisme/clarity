import { defineConfig } from "eslint/config";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([...nextTs]);

export default eslintConfig;
