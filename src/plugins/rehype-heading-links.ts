/**
 * Rehype plugin that appends a "#" anchor link to content headings (h2–h6)
 * at build time — replacing the runtime decoration the detail layouts used
 * to re-run after every view-transition swap. Scoped to the content
 * collections that render through the detail layouts so standalone pages
 * (e.g. src/pages/*.mdx) keep their previous, link-free headings.
 *
 * Needs heading ids, so `rehypeHeadingIds` must run before this plugin in
 * `markdown.rehypePlugins` (Astro only injects its own copy *after* user
 * plugins).
 *
 * The anchor's span deliberately has no text child: Astro's heading
 * collector re-runs after user plugins and folds descendant text into the
 * TOC heading text, so the visible "#" glyph comes from CSS instead (see
 * `a.heading-link span::before` in riso.css). The span keeps the existing
 * base.css hover-reveal styling (`a.heading-link span` + heading `group`
 * class) working unchanged.
 */
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { VFile } from "vfile";

const CONTENT_PATH = /\/src\/content\/(blog|work|demos)\//;
const HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "h6"]);

function headingText(node: Element): string {
  let text = "";
  visit(node, "text", t => {
    text += t.value;
  });
  return text.trim();
}

export default function rehypeHeadingLinks() {
  return (tree: Root, file: VFile) => {
    if (!CONTENT_PATH.test(String(file.path ?? ""))) return;
    visit(tree, "element", (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName)) return;
      if (node.properties?.dataExcludeHeadingLink !== undefined) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || id.length === 0) return;
      const title = headingText(node);
      const link: Element = {
        type: "element",
        tagName: "a",
        properties: {
          className: ["ml-2", "heading-link"],
          href: `#${id}`,
          ariaLabel: title
            ? `Link to section: ${title}`
            : "Link to this section",
        },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { ariaHidden: "true" },
            children: [],
          },
        ],
      };
      const className = node.properties.className;
      if (Array.isArray(className)) {
        className.push("group");
      } else {
        node.properties.className = ["group"];
      }
      node.children.push(link);
    });
  };
}
