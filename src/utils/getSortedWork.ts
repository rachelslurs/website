import type { CollectionEntry } from "astro:content";
import workFilter from "./workFilter";

const getSortedWork = (work: CollectionEntry<"work">[]) => {
  return work
    .filter(workFilter)
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

export default getSortedWork;
