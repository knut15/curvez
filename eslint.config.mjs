import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: [".build/", ".omc/", "**/.omc/"] },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: js.configs.recommended.rules,
  },
];
