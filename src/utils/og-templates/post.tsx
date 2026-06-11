import type { CollectionEntry } from "astro:content";
import card from "./card";

export default (post: CollectionEntry<"blog">) =>
  card({
    title: post.data.title,
    footer: (
      <span>
        by{" "}
        <span
          style={{
            color: "transparent",
          }}
        >
          "
        </span>
        <span style={{ overflow: "hidden", fontWeight: "bold" }}>
          {post.data.author}
        </span>
      </span>
    ),
  });
