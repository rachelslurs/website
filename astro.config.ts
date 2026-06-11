import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { FontaineTransform } from "fontaine";

/** Fontaine 0.8 declares its transform as `{ filter, handler }`, a hook form
 *  Vite 5 silently skips — unwrap it to a plain function so it runs. */
function fontainePlugin() {
  const plugin = FontaineTransform.vite({
    fallbacks: {
      Lora: ["Georgia"],
      "Zilla Slab": ["Georgia"],
      "Archivo Black": ["Arial"],
      "IBM Plex Mono": ["Courier New"],
    },
  }) as any;
  const { handler } = plugin.transform;
  plugin.transform = function (code: string, id: string) {
    if (!/\.css(\?|$)/.test(id)) return;
    return handler.call(this, code, id);
  };
  return plugin;
}
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
    plugins: [
      // Metric-matched local fallback faces (size-adjust/ascent-override…)
      // for each @font-face, so the swap to the web font doesn't reflow
      // text — kills font CLS and the late LCP repaint of the first <p>.
      fontainePlugin(),
    ],
  },
  scopedStyleStrategy: "where",
  experimental: {
    contentLayer: true,
  },
  build: {
    // "always" inlined ~150 KB of CSS (incl. all @font-face) into every
    // page head — nothing painted until it downloaded. "auto" keeps the
    // shared sheet external and cacheable across pages.
    inlineStylesheets: "auto",
  },
});
