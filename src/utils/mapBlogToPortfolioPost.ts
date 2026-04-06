import type { TagColor } from "@components/PortfolioBoard";
import type { CollectionEntry } from "astro:content";

const TAG_COLORS: TagColor[] = ["red", "blue", "green"];

export function formatPostDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function tagColorForIndex(i: number): TagColor {
  return TAG_COLORS[i % TAG_COLORS.length]!;
}

export function mapBlogEntryToPortfolioPost(
  entry: CollectionEntry<"blog">,
  index: number
) {
  const tag = entry.data.tags[0] ?? "Writing";
  return {
    id: entry.id,
    /** Content-collection slug; use for view-transition-name with post detail (must match `post.slug`). */
    slug: entry.slug,
    dateLabel: formatPostDate(entry.data.pubDatetime),
    dateTime: entry.data.pubDatetime.toISOString(),
    title: entry.data.title,
    desc: entry.data.description ?? "",
    tag,
    tagColor: tagColorForIndex(index),
    href: `/posts/${entry.slug}`,
  };
}
