import type { ShikiTransformer } from "shiki";
import { createCssVariablesTheme } from "shiki/core";

/**
 * “Faded ink” Shiki palette — CSS variables + fallbacks; background is transparent so
 * `prose prose-analog pre` greenbar stripes show through.
 * @see https://shiki.style/guide/theme-colors#css-variables-theme
 */
const risoAnalogTheme = createCssVariablesTheme({
  name: "riso-analog",
  variablePrefix: "--astro-code-",
  fontStyle: true,
  variableDefaults: {
    foreground: "#1a1a1a",
    /** Lets riso.css greenbar stripes show; Shiki sets inline background-color on `<pre>` */
    background: "transparent",
    "token-keyword": "#0078bf",
    "token-parameter": "#4a4a4a",
    "token-function": "#e8453c",
    "token-string": "#00a95c",
    "token-string-expression": "#00a95c",
    "token-punctuation": "#6a6a6a",
    "token-link": "#0078bf",
    "token-comment": "#7a7a7a",
    "token-constant": "#7b68ae",
    "token-inserted": "#00a95c",
    "token-deleted": "#e8453c",
    "token-changed": "#f47a2d",
    "ansi-black": "#1a1a2e",
    "ansi-red": "#e8453c",
    "ansi-green": "#00a95c",
    "ansi-yellow": "#ffb511",
    "ansi-blue": "#0078bf",
    "ansi-magenta": "#f5a0b1",
    "ansi-cyan": "#00a95c",
    "ansi-white": "#f5f0e8",
    "ansi-bright-black": "#5a5150",
    "ansi-bright-red": "#ff6b63",
    "ansi-bright-green": "#4dcc8c",
    "ansi-bright-yellow": "#ffd54d",
    "ansi-bright-blue": "#4da3e6",
    "ansi-bright-magenta": "#ffc0cb",
    "ansi-bright-cyan": "#4dcc8c",
    "ansi-bright-white": "#ffffff",
  },
});

/** css-variables theme is mostly foreground-only; match prior prose-analog accents */
export const risoAnalogSyntaxTransformer: ShikiTransformer = {
  span(node) {
    const style = node.properties?.style;
    if (typeof style !== "string") return;
    if (style.includes("token-comment")) {
      node.properties.style = `${style}; font-style: italic`;
    }
    if (style.includes("token-keyword")) {
      node.properties.style = `${style}; font-weight: 700`;
    }
  },
};

export default risoAnalogTheme;
