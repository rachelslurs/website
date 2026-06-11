import type { ImageMetadata } from "astro";

export interface ResolvedOgImage {
  url: string;
  width?: number;
  height?: number;
}

/** Resolve a frontmatter ogImage (resolved image, URL string, or absent) to
 *  an absolute URL plus dimensions when they are actually known. The
 *  generated fallback images are always 1200x630 (see generateOgImages.tsx);
 *  a string path has unknown dimensions, so none are advertised. */
export function resolveOgImage(
  ogImage: ImageMetadata | string | undefined,
  fallbackPath: string,
  origin: string
): ResolvedOgImage {
  if (!ogImage) {
    return {
      url: new URL(fallbackPath, origin).href,
      width: 1200,
      height: 630,
    };
  }
  if (typeof ogImage === "string") {
    return { url: new URL(ogImage, origin).href };
  }
  return {
    url: new URL(ogImage.src, origin).href,
    width: ogImage.width,
    height: ogImage.height,
  };
}
