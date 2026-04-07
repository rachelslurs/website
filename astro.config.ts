import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import risoAnalogTheme, {
  risoAnalogSyntaxTransformer,
} from "./src/config/shiki-riso-theme";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  trailingSlash: "never",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      theme: risoAnalogTheme,
      wrap: true,
      transformers: [risoAnalogSyntaxTransformer],
    },
  },
  vite: {
    optimizeDeps: {
      include: ["framer-motion"],
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
  experimental: {
    contentLayer: true,
  },
  build: {
    inlineStylesheets: "always",
  },
});
