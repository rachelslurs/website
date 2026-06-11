import type { APIRoute } from "astro";
import { SITE } from "@config";

// /search is deliberately NOT disallowed here: it carries a noindex meta tag,
// which crawlers can only see if they are allowed to fetch the page.
const robots = `
User-agent: *
Allow: /
Disallow: /admin
Disallow: /cdn-cgi/zaraz/

Sitemap: ${new URL("sitemap.xml", SITE.website).href}
`.trim();

export const GET: APIRoute = () =>
  new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
