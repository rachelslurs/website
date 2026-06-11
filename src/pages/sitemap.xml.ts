import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@config";
import { getUniquePostTags, getUniqueWorkTags } from "@utils/getUniqueTags";
import { postFilter, workFilter, demoFilter } from "@utils/filters";
import { slugifyAll } from "@utils/slugify";

/** Replaces @astrojs/sitemap so detail URLs can carry an accurate lastmod
 *  from frontmatter (modDatetime ?? pubDatetime). Listing URLs carry none —
 *  a fabricated lastmod is worse than no lastmod. */

interface SitemapEntry {
  loc: string;
  lastmod?: Date;
}

// Static routes derived from src/pages itself, so a new page cannot silently
// drift out of the sitemap. Dynamic ([param]) routes are enumerated below;
// noindex pages are excluded.
const EXCLUDED_PATHS = new Set(["/search", "/404"]);
// Every page extension Astro routes (.ts endpoints are deliberately absent).
const staticPageFiles = import.meta.glob("./**/*.{astro,mdx,md,html}");
const STATIC_PATHS = Object.keys(staticPageFiles)
  .filter(file => !file.includes("["))
  .map(file => {
    const route =
      "/" + file.replace(/^\.\//, "").replace(/\.(astro|mdx|md|html)$/, "");
    return route === "/index" ? "/" : route.replace(/\/index$/, "");
  })
  .filter(path => !EXCLUDED_PATHS.has(path))
  .sort();

const absolute = (path: string) => new URL(path, SITE.website).href;

type Dated = CollectionEntry<"blog" | "work" | "demos">;

const buildTime = new Date();

/** modDatetime ?? pubDatetime, clamped: a future timestamp (scheduled or
 *  mistyped frontmatter) is invalid in a sitemap and erodes lastmod trust. */
const lastmodOf = ({ data }: Dated) => {
  const lastmod = data.modDatetime ?? data.pubDatetime;
  return lastmod > buildTime ? buildTime : lastmod;
};

/** Mirror of Astro's paginate(): base path is page 1, /2.. for the rest.
 *  All [...page] routes paginate by SITE.postPerPage; if one ever diverges,
 *  this must follow. */
function paginatedPaths(basePath: string, itemCount: number): string[] {
  const pageCount = Math.max(1, Math.ceil(itemCount / SITE.postPerPage));
  return [
    basePath,
    ...Array.from({ length: pageCount - 1 }, (_, i) => `${basePath}/${i + 2}`),
  ];
}

/** Entry count per slugified tag in one pass (mirrors getItemsByTag). */
function tagCounts(
  entries: Array<CollectionEntry<"blog"> | CollectionEntry<"work">>
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of new Set(slugifyAll(entry.data.tags))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.toISOString()}</lastmod>`
        : "";
      return `  <url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const GET: APIRoute = async () => {
  // Time-aware filters match the listing routes. The [slug] routes build
  // scheduled-future entries too, but advertising an embargoed URL (with a
  // future lastmod) is exactly what a sitemap should not do — they join the
  // sitemap on the first build after their publish time.
  const posts = (await getCollection("blog")).filter(postFilter);
  const work = (await getCollection("work")).filter(workFilter);
  const demos = (await getCollection("demos")).filter(demoFilter);

  const entries: SitemapEntry[] = STATIC_PATHS.map(path => ({
    loc: absolute(path),
  }));

  // Paginated listing routes mirror their [...page] getStaticPaths inputs.
  for (const path of paginatedPaths("/work", work.length)) {
    entries.push({ loc: absolute(path) });
  }
  for (const path of paginatedPaths("/demos", demos.length)) {
    entries.push({ loc: absolute(path) });
  }
  const postTagCounts = tagCounts(posts);
  for (const { tag } of getUniquePostTags(posts)) {
    for (const path of paginatedPaths(
      `/tags/${tag}`,
      postTagCounts.get(tag) ?? 0
    )) {
      entries.push({ loc: absolute(path) });
    }
  }
  const workTagCounts = tagCounts(work);
  for (const { tag } of getUniqueWorkTags(work)) {
    for (const path of paginatedPaths(
      `/tech/${tag}`,
      workTagCounts.get(tag) ?? 0
    )) {
      entries.push({ loc: absolute(path) });
    }
  }

  for (const post of posts) {
    entries.push({
      loc: absolute(`/posts/${post.slug}`),
      lastmod: lastmodOf(post),
    });
  }
  for (const workItem of work) {
    entries.push({
      loc: absolute(`/work/${workItem.slug}`),
      lastmod: lastmodOf(workItem),
    });
  }
  for (const demo of demos) {
    entries.push({
      loc: absolute(`/demos/${demo.slug}`),
      lastmod: lastmodOf(demo),
    });
  }

  return new Response(toXml(entries), {
    headers: { "Content-Type": "application/xml" },
  });
};
