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

/**
 * Builds display list + hrefs from pathname. A trailing all-numeric segment
 * is a pagination index (e.g. /work/2, /tags/react/2) and folds into the
 * previous crumb as "(page N)".
 */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "HOME", name: "Home", href: null }];
  }

  let pageNumber: string | null = null;
  if (
    segments.length >= 2 &&
    /^\d+$/.test(segments[segments.length - 1] ?? "")
  ) {
    pageNumber = segments.pop() ?? null;
  }

  const items: BreadcrumbItem[] = [{ label: "HOME", name: "Home", href: "/" }];

  for (let i = 0; i < segments.length; i++) {
    const isLast = i === segments.length - 1;
    let name = nameForSegment(segments[i] ?? "");
    if (isLast && pageNumber) {
      name = `${name} (page ${pageNumber})`;
    }
    items.push({
      label: name.toUpperCase(),
      name,
      href: isLast ? null : `/${segments.slice(0, i + 1).join("/")}`,
    });
  }

  return items;
}
