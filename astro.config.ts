import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import { SITE } from "./src/config";
import risoAnalogTheme, {
  risoAnalogSyntaxTransformer,
} from "./src/config/shiki-riso-theme";
import mdx from "@astrojs/mdx";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeTableWrap from "./src/plugins/rehype-table-wrap";
import rehypeHeadingLinks from "./src/plugins/rehype-heading-links";
import rehypeCopyCode from "./src/plugins/rehype-copy-code";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  trailingSlash: "never",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkToc as any],
    // rehypeHeadingIds runs first so heading-links sees ids (Astro only
    // injects its own copy after user plugins; that second run is a no-op).
    rehypePlugins: [
      rehypeHeadingIds as any,
      rehypeTableWrap as any,
      rehypeHeadingLinks as any,
      rehypeCopyCode as any,
    ],
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
