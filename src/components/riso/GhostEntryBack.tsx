import type { MouseEventHandler } from "react";
import DymoLabel from "@components/riso/DymoLabel";

/** When session history has only this page (e.g. opened in a new tab), go here instead of back(). */
export default function GhostEntryBack({
  fallbackHref,
}: {
  fallbackHref: string;
}) {
  const onClick: MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();
    if (window.history.length === 1) {
      window.location.assign(fallbackHref);
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="ghost-btn-wrapper ghost-btn-wrapper--header"
      style={{ margin: "0 auto var(--baseline) auto" }}
    >
      <a
        href={fallbackHref}
        className="ghost-entry-back-link focus-outline"
        style={{ textDecoration: "none", transform: "rotate(-2deg)" }}
        onClick={onClick}
      >
        <DymoLabel text="<- BACK" isInteractive={true} />
      </a>
    </div>
  );
}
