import type { CollectionEntry } from "astro:content";

/** Flatten Astro `image()` / string union for JSON debug output. */
function serializeImageLike(v: unknown): unknown {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "src" in v) {
    const o = v as { src: unknown; width?: number; height?: number };
    return {
      src: o.src,
      width: o.width ?? null,
      height: o.height ?? null,
    };
  }
  return null;
}

export function dumpWorkFields(entry: CollectionEntry<"work">) {
  const d = entry.data;
  return {
    collection: "work",
    id: entry.id,
    slug: entry.slug,
    href: `/work/${entry.slug}`,
    title: d.title,
    summary: d.summary,
    description: d.description ?? null,
    author: d.author,
    pubDatetime: d.pubDatetime.toISOString(),
    modDatetime: d.modDatetime?.toISOString() ?? null,
    year: d.year ?? null,
    featured: d.featured ?? null,
    draft: d.draft ?? null,
    tags: d.tags,
    features:
      d.features?.map(f => ({
        src: f.src,
        alt: f.alt,
        caption: f.caption ?? null,
      })) ?? null,
    ogImage: serializeImageLike(d.ogImage),
    canonicalURL: d.canonicalURL ?? null,
  };
}

export function dumpDemoFields(entry: CollectionEntry<"demos">) {
  const d = entry.data;
  return {
    collection: "demos",
    id: entry.id,
    slug: entry.slug,
    href: `/demos/${entry.slug}`,
    title: d.title,
    summary: d.summary ?? null,
    description: d.description ?? null,
    author: d.author,
    pubDatetime: d.pubDatetime.toISOString(),
    modDatetime: d.modDatetime?.toISOString() ?? null,
    featured: d.featured ?? null,
    draft: d.draft ?? null,
    ogImage: serializeImageLike(d.ogImage),
    canonicalURL: d.canonicalURL ?? null,
  };
}

export function dumpLinkFields(entry: CollectionEntry<"links">) {
  const d = entry.data;
  return {
    collection: "links",
    id: entry.id,
    slug: entry.slug,
    title: d.title,
    subtitle: d.subtitle ?? null,
    url: d.url,
    linkType: d.linkType,
    gifLink: serializeImageLike(d.gifLink),
    author: d.author,
    pubDatetime: d.pubDatetime.toISOString(),
    modDatetime: d.modDatetime?.toISOString() ?? null,
    draft: d.draft ?? null,
  };
}
