import { Fragment } from "react";
import DymoLabel from "@components/riso/DymoLabel";
import type { BreadcrumbItem } from "@utils/breadcrumbItems";

export default function BreadcrumbsDymo({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <nav
      className="breadcrumb-dymo my-6 flex flex-wrap items-center gap-x-2 gap-y-2"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}-${item.href ?? "here"}`}>
          {i > 0 && (
            <span className="select-none text-skin-base/35" aria-hidden="true">
              ›
            </span>
          )}
          <DymoLabel
            text={item.label}
            size="normal"
            as={item.href ? "a" : "span"}
            href={item.href ?? undefined}
            isInteractive={!!item.href}
          />
        </Fragment>
      ))}
    </nav>
  );
}
