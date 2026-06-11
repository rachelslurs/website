import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@config";
import { getUniquePostTags, getUniqueWorkTags } from "@utils/getUniqueTags";
import { getPostsByTag, getWorkByTag } from "@utils/getItemsByTag";
import getSortedWork from "@utils/getSortedWork";
import getSortedDemos from "@utils/getSortedDemos";

/** Replaces @astrojs/sitemap so detail URLs can carry an accurate lastmod
 *  from frontmatter (modDatetime ?? pubDatetime). Listing URLs carry none —
 *  a fabricated lastmod is worse than no lastmod. */

interface SitemapEntry {
  loc: string;
  lastmod?: Date;
}

// Routes without collection data. Keep in sync with src/pages — a new static
// page must be added here by hand. /search is deliberately excluded (noindex).
const STATIC_PATHS = [
  "/",
  "/about",
  "/accessibility",
  "/uses",
  "/posts",
  "/tags",
  "/tech",
];

const absolute = (path: string) => new URL(path, SITE.website).href;

type Dated = CollectionEntry<"blog" | "work" | "demos">;

const lastmodOf = ({ data }: Dated) => data.modDatetime ?? data.pubDatetime;

/** Mirror of Astro's paginate(): base path is page 1, /2.. for the rest. */
function paginatedPaths(basePath: string, itemCount: number): string[] {
  const pageCount = Math.max(1, Math.ceil(itemCount / SITE.postPerPage));
  return [
    basePath,
    ...Array.from({ length: pageCount - 1 }, (_, i) => `${basePath}/${i + 2}`),
  ];
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod
        ? `<lastmod>${lastmod.toISOString()}</lastmod>`
        : "";
      return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const GET: APIRoute = async () => {
  // Same predicate as the [slug] detail routes, so every built page is listed.
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const work = await getCollection("work", ({ data }) => !data.draft);
  const demos = await getCollection("demos", ({ data }) => !data.draft);

  const entries: SitemapEntry[] = STATIC_PATHS.map(path => ({
    loc: absolute(path),
  }));

  // Paginated listing routes mirror their [...page] getStaticPaths inputs.
  for (const path of paginatedPaths("/work", getSortedWork(work).length)) {
    entries.push({ loc: absolute(path) });
  }
  for (const path of paginatedPaths("/demos", getSortedDemos(demos).length)) {
    entries.push({ loc: absolute(path) });
  }
  for (const { tag } of getUniquePostTags(posts)) {
    for (const path of paginatedPaths(
      `/tags/${tag}`,
      getPostsByTag(posts, tag).length
    )) {
      entries.push({ loc: absolute(path) });
    }
  }
  for (const { tag } of getUniqueWorkTags(work)) {
    for (const path of paginatedPaths(
      `/tech/${tag}`,
      getWorkByTag(work, tag).length
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
