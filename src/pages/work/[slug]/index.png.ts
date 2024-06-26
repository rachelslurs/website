import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForWork } from "@utils/generateOgImages";
import { slugifyStr } from "@utils/slugify";

export async function getStaticPaths() {
  const works = await getCollection("work").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return works.map(work => ({
    params: { slug: slugifyStr(work.data.title) },
    props: work,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForWork(props as CollectionEntry<"work">), {
    headers: { "Content-Type": "image/png" },
  });
