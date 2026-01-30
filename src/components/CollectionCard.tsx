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
  };

  const linkContent = (
    <a
      href={href}
      className="view-transition no-underline focus-visible:no-underline focus-visible:underline-offset-0"
    >
      {secHeading ? (
        <h3 {...headerProps}>
          <span className="highlight-wavy">{title}</span>
        </h3>
      ) : (
        <h3 {...headerProps}>
          <span className="highlight-wavy">{title}</span>
        </h3>
      )}
    </a>
  );

  return (
    <li className="ps-0 my-4 py-2">
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
          <p className="my-2">{description}</p>
        </>
      ) : (
        <>
          <div className="flex flex-nowrap flex-row justify-between items-center space-x-2">
            <div className="flex items-center gap-2 flex-wrap">
              {linkContent}
            </div>
          </div>
          {description && <p className="text-base mt-1 mb-0">{description}</p>}
        </>
      )}
    </li>
  );
}
