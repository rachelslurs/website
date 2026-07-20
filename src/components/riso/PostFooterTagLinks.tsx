import DymoLabel from "@components/riso/DymoLabel";

const TAG_COLORS = ["blue", "red", "green"] as const;

export default function PostFooterTagLinks({
  items,
  basePath = "/tags",
  asCategory = false,
}: {
  items: { slug: string; label: string }[];
  /** URL prefix for tag links, e.g. `/tags` (blog) or `/tech` (work). */
  basePath?: string;
  /** Add p-category for h-entry tag markup. */
  asCategory?: boolean;
}) {
  return (
    <>
      {items.map(({ slug, label }, i) => (
        <span key={slug} className="contents">
          {asCategory && <span className="p-category sr-only">{label}</span>}
          <a href={`${basePath}/${slug}`} className="post-tag-dymo-link">
            <DymoLabel
              text={label}
              size="section"
              isInteractive
              color={TAG_COLORS[i % TAG_COLORS.length]}
            />
          </a>
        </span>
      ))}
    </>
  );
}
