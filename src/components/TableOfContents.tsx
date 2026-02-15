import { useEffect, useState, useRef } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2, 3, or 4 for h2, h3, h4
}

export default function TableOfContents() {
  const [activeId, setActiveId] = useState<string>(
    typeof window !== "undefined" ? window.location.hash.slice(1) : ""
  );
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const isScrollingRef = useRef(false);

  // Extract headings on mount
  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(
        "article h2[id], article h3[id], article h4[id]"
      )
    ).filter(heading => {
      // Exclude the TOC heading itself
      const text = heading.textContent?.toLowerCase() || "";
      return (
        heading.id !== "table-of-contents" &&
        !text.includes("table of contents")
      );
    });

    const items: TocItem[] = headings.map(heading => {
      // Extract text content, excluding screen-reader only text and link decorations
      let text = "";

      const headingLink =
        heading.querySelector<HTMLAnchorElement>(".heading-link");

      if (headingLink) {
        // Try to get text from the link first (WorkDetails: text is inside the link)
        const linkClone = headingLink.cloneNode(true) as HTMLAnchorElement;
        // Remove screen-reader only elements and decoration spans
        linkClone
          .querySelectorAll(".sr-only, span[aria-hidden]")
          .forEach(el => el.remove());
        const linkText =
          linkClone.textContent?.replace(/[🔗#]/g, "").trim() || "";

        if (linkText.length > 1) {
          // Link contains the heading text (WorkDetails style)
          text = linkText;
        } else {
          // Link is just decoration, get text from heading (PostDetails style)
          const headingClone = heading.cloneNode(true) as HTMLHeadingElement;
          headingClone
            .querySelectorAll(".heading-link, .sr-only")
            .forEach(el => el.remove());
          text = headingClone.textContent?.replace(/[🔗#]/g, "").trim() || "";
        }
      } else {
        // No link found, just use heading text directly
        const headingClone = heading.cloneNode(true) as HTMLHeadingElement;
        headingClone.querySelectorAll(".sr-only").forEach(el => el.remove());
        text = headingClone.textContent?.replace(/[🔗#]/g, "").trim() || "";
      }

      return {
        id: heading.id,
        text,
        level: parseInt(heading.tagName[1]), // h2 -> 2, h3 -> 3, h4 -> 4
      };
    });

    setTocItems(items);
  }, []);

  // Simple scroll spy: track which section is currently active
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      // Skip updates if we're in the middle of programmatic scrolling
      if (isScrollingRef.current) return;

      // Use same offset as click handler for consistency
      const header = document.querySelector("header");
      const headerOffset = header ? header.offsetHeight + 20 : 80;
      const scrollPosition = window.scrollY + headerOffset;

      // Find which section we're currently in
      let currentSectionId = tocItems[0].id; // Default to first section

      for (const item of tocItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        const offsetTop = element.offsetTop;

        // If we've scrolled past this heading, it becomes the current section
        if (scrollPosition >= offsetTop) {
          currentSectionId = item.id;
        } else {
          // We haven't reached this heading yet, so stop
          break;
        }
      }

      // Check if we're at the bottom of the page - always highlight last section
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        currentSectionId = tocItems[tocItems.length - 1].id;
      }

      setActiveId(currentSectionId);
    };

    // Run once on mount to set initial active section
    handleScroll();

    // Add scroll listener with throttling for performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, [tocItems]);

  // Don't render if no headings found
  if (tocItems.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const heading = document.getElementById(id);
    if (!heading) return;

    // Set active immediately for better visual feedback
    setActiveId(id);

    // Block IntersectionObserver updates during programmatic scroll
    isScrollingRef.current = true;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Wait for layout to settle before calculating position
    // Use double RAF to ensure all layout/paint is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Calculate offset based on actual sticky header height
        const header = document.querySelector("header");
        const headerOffset = header ? header.offsetHeight + 20 : 80; // +20px breathing room

        // Get fresh position after layout settles
        const elementPosition =
          heading.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });

    // Re-enable IntersectionObserver after scroll completes
    // For smooth scroll, wait ~1 second; for instant scroll, wait 100ms
    const scrollDuration = prefersReducedMotion ? 100 : 1000;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, scrollDuration);

    // Move focus to heading for screen reader context
    heading.setAttribute("tabindex", "-1");
    heading.focus();

    // Update URL hash without adding to history (use replaceState)
    // This keeps URLs shareable but doesn't pollute browser history
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="toc-nav" aria-label="Table of contents">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-skin-base">
        Table of Contents
      </h2>
      <ul className="space-y-2 text-sm">
        {tocItems.map(item => (
          <li
            key={item.id}
            style={{
              paddingLeft: `${(item.level - 2) * 0.75}rem`,
            }}
          >
            <a
              href={`#${item.id}`}
              className={`block border-l-2 py-1 transition-all duration-200 ease-in-out ${
                activeId === item.id
                  ? "active border-skin-accent font-medium text-skin-accent"
                  : "border-transparent text-skin-base/70 hover:text-skin-accent"
              }`}
              style={{
                paddingLeft: "0.75rem",
                marginLeft: "-0.75rem",
              }}
              onClick={e => handleClick(e, item.id)}
              aria-current={activeId === item.id ? "location" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
