import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter:
    | CollectionEntry<"blog">["data"]
    | CollectionEntry<"work">["data"]
    | CollectionEntry<"demos">["data"];
  secHeading?: boolean;
  showDatetime?: boolean;
}

export default function CollectionCard({
  href,
  frontmatter,
  secHeading = true,
  showDatetime = false,
}: Props) {
  const { title, description } = frontmatter;
  const blogData =
    "pubDatetime" in frontmatter
      ? (frontmatter as CollectionEntry<"blog">["data"])
      : null;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-semibold decoration-dashed hover:underline",
  };

  const linkContent = (
    <a
      href={href}
      className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
    >
      {secHeading ? (
        <h2 {...headerProps}>{title}</h2>
      ) : (
        <h3 {...headerProps}>{title}</h3>
      )}
    </a>
  );

  return (
    <li className="my-6">
      {showDatetime ? (
        <>
          {linkContent}
          {blogData && (
            <Datetime
              pubDatetime={blogData.pubDatetime}
              modDatetime={blogData.modDatetime}
              size="sm"
            />
          )}
          <p>{description}</p>
        </>
      ) : (
        <>
          <div className="flex flex-nowrap flex-row justify-between items-center space-x-2 opacity-80">
            <div className="flex items-center gap-2 flex-wrap">
              {linkContent}
            </div>
          </div>
          {description && <p className="text-base">{description}</p>}
        </>
      )}
    </li>
  );
}
