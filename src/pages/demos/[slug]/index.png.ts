import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForDemo } from "@utils/generateOgImages";
import { slugifyStr } from "@utils/slugify";

export async function getStaticPaths() {
  const demos = await getCollection("demos").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return demos.map(demo => ({
    params: { slug: slugifyStr(demo.data.title) },
    props: demo,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(
    await generateOgImageForDemo(props as CollectionEntry<"demos">),
    {
      headers: { "Content-Type": "image/png" },
    }
  );
