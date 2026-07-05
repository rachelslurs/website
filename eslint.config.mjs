import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    // Replaces .eslintignore (unsupported in flat config); node_modules is
    // always ignored. .astro/ and .vercel/ are generated output.
    ignores: [
      ".husky/",
      ".vscode/",
      "public/",
      "dist/",
      ".yarn/",
      ".astro/",
      ".vercel/",
    ],
  },
  js.configs.recommended,
  // Sets up astro-eslint-parser for .astro files (TS script parts included);
  // the plugin resolves @typescript-eslint/parser from the typescript-eslint
  // meta package.
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
