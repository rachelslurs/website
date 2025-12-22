import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"demos">["data"];
  secHeading?: boolean;
}

export default function DemoCard({
  href,
  frontmatter,
  secHeading = true,
}: Props) {
  const { title, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <div
        className={`flex flex-nowrap flex-row justify-between items-center space-x-2 opacity-80`}
      >
        <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      </div>
      {description && <p>{description}</p>}
    </li>
  );
}
