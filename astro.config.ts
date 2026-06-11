import { defineConfig } from "astro/config";
import type { AstroIntegration } from "astro";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { FontaineTransform } from "fontaine";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

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
    // Most CSS modules (Astro scoped styles) declare no fonts; skip the
    // css-tree parse + MagicString allocation the handler always pays.
    if (!code.includes("font-face") && !code.includes("font-family")) return;
    return handler.call(this, code, id);
  };
  return plugin;
}
/** Inline each page's used CSS and load the stylesheets async (media swap).
 *  The render-blocking shared sheet was the whole LCP render delay on mobile
 *  (~1.1s est. by Lighthouse): nothing painted until ~20KB gz of CSS arrived.
 *  Runs on the built HTML so it sees exactly what each page uses. */
function criticalCss(): AstroIntegration {
  return {
    name: "critical-css",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const { default: Beasties } = await import("beasties");
        const root = fileURLToPath(dir);
        const beasties = new Beasties({
          path: root,
          // Swap via media="print" → "all"; full sheet still arrives and
          // covers JS-toggled states (hover/drag classes, TOC .active).
          preload: "media",
          // @font-face must be critical: fontaine's metric-matched fallbacks
          // live there, and late-arriving overrides would reflow text.
          inlineFonts: true,
          // The three above-the-fold faces are hand-preloaded in Layout.astro.
          preloadFonts: false,
          logLevel: "warn",
        });
        const entries = await readdir(root, {
          recursive: true,
          withFileTypes: true,
        });
        // Beasties only inlines @font-face for the primary families; the
        // fontaine "<family> fallback" faces (size-adjust/ascent-override)
        // stay in the async sheet, so text would render in raw Georgia and
        // shift when the sheet lands. Inline them on every page (<1KB).
        const fallbackFaces = new Set<string>();
        for (const entry of entries) {
          if (!entry.isFile() || !entry.name.endsWith(".css")) continue;
          const css = await readFile(
            join(entry.parentPath, entry.name),
            "utf8"
          );
          for (const face of css.match(/@font-face\{[^}]*\}/g) ?? []) {
            if (/font-family:[^;]*fallback/i.test(face))
              fallbackFaces.add(face);
          }
        }
        const fallbackCss = [...fallbackFaces].join("");
        let count = 0;
        for (const entry of entries) {
          if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
          const file = join(entry.parentPath, entry.name);
          const html = await readFile(file, "utf8");
          const processed = (await beasties.process(html)).replace(
            "</head>",
            `<style>${fallbackCss}</style></head>`
          );
          await writeFile(file, processed);
          count += 1;
        }
        logger.info(`inlined critical CSS into ${count} pages`);
      },
    },
  };
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
    criticalCss(),
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
