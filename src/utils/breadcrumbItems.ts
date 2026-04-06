/** Breadcrumb segments for Dymo trail; labels are uppercase for tape styling. */

export type BreadcrumbItem = { label: string; href: string | null };

function labelForSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).toUpperCase();
  } catch {
    return segment.toUpperCase();
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
    return [{ label: "HOME", href: null }];
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
    breadcrumbList.splice(
      1,
      3,
      `${breadcrumbList[1]} ${
        Number(breadcrumbList[2]) === 1 || breadcrumbList[2] === ""
          ? ""
          : "(page " + breadcrumbList[2] + ")"
      }`
    );
  }

  const items: BreadcrumbItem[] = [{ label: "HOME", href: "/" }];

  for (let i = 0; i < breadcrumbList.length; i++) {
    const isLast = i === breadcrumbList.length - 1;
    const segment = breadcrumbList[i] ?? "";
    const label = labelForSegment(segment);

    if (isLast) {
      items.push({ label, href: null });
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

    items.push({ label, href });
  }

  return items;
}
