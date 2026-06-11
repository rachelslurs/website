/** Breadcrumb segments for Dymo trail; `label` is uppercase for tape styling,
 *  `name` keeps the human-readable form for BreadcrumbList JSON-LD. */

export type BreadcrumbItem = {
  label: string;
  name: string;
  href: string | null;
};

function nameForSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Builds display list + hrefs from pathname.
 * Merges `/posts` and `/posts/N` into "Posts (page N)"; keeps `/posts/slug` as two crumbs.
 */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const currentUrlPath = pathname.replace(/\/+$/, "");
  const raw = currentUrlPath.split("/").filter(Boolean);

  if (raw.length === 0) {
    return [{ label: "HOME", name: "Home", href: null }];
  }

  const breadcrumbList = currentUrlPath.split("/").slice(1);

  if (breadcrumbList[0] === "posts") {
    if (breadcrumbList.length === 1) {
      breadcrumbList.splice(0, 1, `Posts (page 1)`);
    } else if (
      breadcrumbList.length === 2 &&
      /^\d+$/.test(breadcrumbList[1] ?? "")
    ) {
      breadcrumbList.splice(0, 2, `Posts (page ${breadcrumbList[1]})`);
    }
  }

  if (
    (breadcrumbList[0] === "tags" || breadcrumbList[0] === "tech") &&
    breadcrumbList.length >= 3 &&
    !isNaN(Number(breadcrumbList[2]))
  ) {
    const tagName = breadcrumbList[1] ?? "";
    const pagePart =
      breadcrumbList[2] === "" || Number(breadcrumbList[2]) === 1
        ? ""
        : `(page ${breadcrumbList[2]})`;
    breadcrumbList.splice(1, 3, pagePart ? `${tagName} ${pagePart}` : tagName);
  }

  const items: BreadcrumbItem[] = [{ label: "HOME", name: "Home", href: "/" }];

  for (let i = 0; i < breadcrumbList.length; i++) {
    const isLast = i === breadcrumbList.length - 1;
    const segment = breadcrumbList[i] ?? "";
    const name = nameForSegment(segment);
    const label = name.toUpperCase();

    if (isLast) {
      items.push({ label, name, href: null });
      continue;
    }

    let href: string;
    if (breadcrumbList.length === raw.length) {
      href = `/${raw.slice(0, i + 1).join("/")}`;
    } else if (
      segment.startsWith("Posts") &&
      raw[0] === "posts" &&
      raw.length >= 2
    ) {
      href = `/${raw.slice(0, 2).join("/")}`;
    } else if (
      breadcrumbList.length === 2 &&
      raw.length === 3 &&
      (raw[0] === "tags" || raw[0] === "tech")
    ) {
      href = i === 0 ? `/${raw[0]}` : `/${raw.slice(0, 3).join("/")}`;
    } else {
      href = `/${raw.slice(0, i + 1).join("/")}`;
    }

    items.push({ label, name, href });
  }

  return items;
}
