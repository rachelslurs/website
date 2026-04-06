import DymoLabel from "@components/riso/DymoLabel";

const TAG_COLORS = ["blue", "red", "green"] as const;

export default function PostFooterTagLinks({
  items,
}: {
  items: { slug: string; label: string }[];
}) {
  return (
    <>
      {items.map(({ slug, label }, i) => (
        <a
          key={slug}
          href={`/tags/${slug}`}
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
