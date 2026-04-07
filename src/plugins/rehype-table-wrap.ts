/**
 * Rehype plugin that wraps <table> elements in a scrollable <div>.
 * This ensures tables can scroll horizontally on narrow viewports
 * without affecting the rest of the prose layout.
 */
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

export default function rehypeTableWrap() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName === "table" &&
        parent &&
        typeof index === "number" &&
        // Don't double-wrap
        !(
          (parent as Element).tagName === "div" &&
          ((parent as Element).properties?.className as string[])?.includes(
            "table-scroll-wrapper"
          )
        )
      ) {
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll-wrapper"] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}
