import type { MarkdownHeading } from "astro";

/** Headings to show in the sidebar TOC (matches legacy TableOfContents.tsx filters). */
export function filterTocHeadings(
  headings: MarkdownHeading[]
): MarkdownHeading[] {
  return headings.filter(h => {
    if (h.depth < 2 || h.depth > 4) return false;
    if (h.slug === "table-of-contents") return false;
    const t = h.text.toLowerCase();
    if (t.includes("table of contents")) return false;
    return true;
  });
}
