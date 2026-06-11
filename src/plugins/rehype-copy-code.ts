/**
 * Rehype plugin that adds the copy-to-clipboard button to fenced code blocks
 * at build time. Runs after Shiki (Astro applies syntax highlighting before
 * user rehype plugins), so it sees the final `<pre>`. The click handler is a
 * delegated listener in src/layouts/Layout.astro.
 *
 * The wrapper `<div>` is the positioning context for the absolute button —
 * `.analog-prose div:has(> pre)` in riso.css makes it `position: relative` —
 * so the button stays pinned to the block. Scoped to the same content
 * collections as rehype-heading-links.
 */
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { VFile } from "vfile";

const CONTENT_PATH = /\/src\/content\/(blog|work|demos)\//;

export default function rehypeCopyCode() {
  return (tree: Root, file: VFile) => {
    if (!CONTENT_PATH.test(String(file.path ?? ""))) return;
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || typeof index !== "number") {
        return;
      }
      const button: Element = {
        type: "element",
        tagName: "button",
        properties: {
          className: [
            "copy-code",
            "absolute",
            "right-3",
            "top-3",
            "rounded",
            "bg-skin-card",
            "px-2",
            "py-1",
            "text-xs",
            "leading-4",
            "text-skin-base",
            "font-medium",
          ],
        },
        children: [{ type: "text", value: "Copy" }],
      };
      node.properties = node.properties ?? {};
      node.properties.tabIndex = 0;
      node.children.push(button);
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: {},
        children: [node],
      };
      (parent as Element).children[index] = wrapper;
    });
  };
}
