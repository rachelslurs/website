import type { MouseEvent, PointerEvent } from "react";

export function stopDragChain(e: MouseEvent | PointerEvent) {
  e.stopPropagation();
}

export function externalLinkProps(href: string) {
  if (href.startsWith("http")) {
    return { target: "_blank" as const, rel: "noreferrer" as const };
  }
  return {};
}
