import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";
import getSortedWork from "./getSortedWork";

export const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  getSortedPosts(
    posts.filter(post => slugifyAll(post.data.tags).includes(tag))
  );

export const getWorkByTag = (work: CollectionEntry<"work">[], tag: string) =>
  getSortedWork(
    work.filter(workItem => slugifyAll(workItem.data.tags).includes(tag))
  );
