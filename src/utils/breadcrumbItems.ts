/** Breadcrumb segments for Dymo trail; `label` is uppercase for tape styling,
 *  `name` keeps the human-readable form for BreadcrumbList JSON-LD. */

export type BreadcrumbItem = {
  label: string;
  name: string;
  href: string | null;
};

function nameForSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep the raw segment
  }
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

/** Numeric tail on a route that actually paginates: /work/2, /demos/2
 *  (arity 2) and /tags/x/2, /tech/x/2 (arity 3). Other numeric tails
 *  (e.g. a post slug like /posts/2024) are content, not pagination.
 *  A numeric DETAIL slug like /work/2048 is indistinguishable from
 *  pagination by pathname alone; the detail layouts' breadcrumbName
 *  override restores the real title for the final crumb in that case. */
function paginationNumber(segments: string[]): string | null {
  const last = segments[segments.length - 1] ?? "";
  if (!/^\d+$/.test(last)) return null;
  const base = segments[0];
  if (segments.length === 2 && (base === "work" || base === "demos")) {
    return last;
  }
  if (segments.length === 3 && (base === "tags" || base === "tech")) {
    return last;
  }
  return null;
}

/** Builds display list + hrefs from pathname. Pagination pages keep every
 *  ancestor crumb linked and end on an unlinked "Page N" crumb. */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "HOME", name: "Home", href: null }];
  }

  const pageNumber = paginationNumber(segments);
  if (pageNumber) {
    segments.pop();
  }

  const items: BreadcrumbItem[] = [{ label: "HOME", name: "Home", href: "/" }];

  for (let i = 0; i < segments.length; i++) {
    const name = nameForSegment(segments[i] ?? "");
    items.push({
      label: name.toUpperCase(),
      name,
      href: `/${segments.slice(0, i + 1).join("/")}`,
    });
  }

  if (pageNumber) {
    items.push({
      label: `PAGE ${pageNumber}`,
      name: `Page ${pageNumber}`,
      href: null,
    });
  } else {
    const last = items[items.length - 1];
    if (last) {
      last.href = null;
    }
  }

  return items;
}
