import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";
import card from "./card";

export default (demo: CollectionEntry<"demos">) =>
  card({
    title: demo.data.title,
    footer: [
      <p key="summary" style={{ fontWeight: "bold" }}>
        {demo.data.description ?? demo.data.summary}
      </p>,
      <p key="site" style={{ overflow: "hidden", fontWeight: "bold" }}>
        {SITE.title}
      </p>,
    ],
  });
