import { SITE } from "@config";

/** Canonical URLs have no trailing slash for directory-like pages
 *  (trailingSlash: "never"); file-like paths keep their name untouched.
 *  Single source for <link rel="canonical"> and JSON-LD url/@id values. */
export function getCanonicalURL(pathname: string, base?: string | URL): string {
  const isFile = /\.(xml|txt|json|html?|webmanifest)$/i.test(pathname);
  const path =
    pathname && pathname.endsWith("/") && pathname.length > 1 && !isFile
      ? pathname.slice(0, -1)
      : pathname;
  return new URL(path, base ?? SITE.website).href;
}
