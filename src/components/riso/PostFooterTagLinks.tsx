import DymoLabel from "@components/riso/DymoLabel";

const TAG_COLORS = ["blue", "red", "green"] as const;

export default function PostFooterTagLinks({
  items,
  basePath = "/tags",
}: {
  items: { slug: string; label: string }[];
  /** URL prefix for tag links, e.g. `/tags` (blog) or `/tech` (work). */
  basePath?: string;
}) {
  return (
    <>
      {items.map(({ slug, label }, i) => (
        <a
          key={slug}
          href={`${basePath}/${slug}`}
          className="post-tag-dymo-link"
          {...{ "transition:name": slug }}
        >
          <DymoLabel
            text={label}
            size="section"
            isInteractive
            color={TAG_COLORS[i % TAG_COLORS.length]}
          />
        </a>
      ))}
    </>
  );
}
