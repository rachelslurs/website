import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import workOgImage from "./og-templates/work";
import demoOgImage from "./og-templates/demo";

// Fonts come from the installed @fontsource package (already a dependency)
// so builds don't depend on fetching TTFs from the network.
const require = createRequire(import.meta.url);

const loadFont = (file: string) =>
  readFileSync(require.resolve(`@fontsource/ibm-plex-mono/files/${file}`));

const fontRegular = loadFont("ibm-plex-mono-latin-400-normal.woff");
// The 700 weight matches the bold TTF this previously fetched; it stays
// declared as 600 below so template font-weight resolution is unchanged.
const fontBold = loadFont("ibm-plex-mono-latin-700-normal.woff");
// latin-ext keeps accented titles (Łukasz, Škoda…) from rendering as blanks;
// satori falls back across same-family entries per glyph.
const fontRegularExt = loadFont("ibm-plex-mono-latin-ext-400-normal.woff");
const fontBoldExt = loadFont("ibm-plex-mono-latin-ext-700-normal.woff");

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "IBM Plex Mono",
      data: fontRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: fontRegularExt,
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: fontBold,
      weight: 600,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: fontBoldExt,
      weight: 600,
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await satori(postOgImage(post), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForWork(work: CollectionEntry<"work">) {
  const svg = await satori(workOgImage(work), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForDemo(demo: CollectionEntry<"demos">) {
  const svg = await satori(demoOgImage(demo), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options);
  return svgBufferToPngBuffer(svg);
}
