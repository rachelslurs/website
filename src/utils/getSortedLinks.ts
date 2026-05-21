import type { CollectionEntry } from "astro:content";
import { linkFilter } from "./filters";

const getSortedLinks = (links: CollectionEntry<"links">[]) => {
  return links
    .filter(linkFilter)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default getSortedLinks;
