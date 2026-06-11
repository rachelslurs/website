import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";
import card from "./card";

export default (work: CollectionEntry<"work">) =>
  card({
    title: work.data.title,
    footer: [
      <p key="summary" style={{ fontWeight: "bold" }}>
        {work.data.description ?? work.data.summary}
      </p>,
      <p key="site" style={{ overflow: "hidden", fontWeight: "bold" }}>
        {SITE.title}
      </p>,
    ],
  });
