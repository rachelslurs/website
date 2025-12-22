import type { CollectionEntry } from "astro:content";
import { demoFilter } from "./filters";

const getSortedDemos = (demos: CollectionEntry<"demos">[]) => {
  return demos
    .filter(demoFilter)
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

export default getSortedDemos;
