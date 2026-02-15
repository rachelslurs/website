import { useEffect, useState } from "react";

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

  // Set up IntersectionObserver to track active section
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        // Find all intersecting entries
        const intersecting = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            // Sort by position in viewport (topmost first)
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });

        // Set the topmost intersecting heading as active
        if (intersecting.length > 0) {
          const target = intersecting[0].target;
          if (target instanceof HTMLElement) {
            setActiveId(target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: [0, 1],
      }
    );

    // Observe all headings
    tocItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Handle scrolling to bottom - activate last section even if heading isn't at top
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Check if we're at or near the bottom of the page (within 100px)
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // Activate the last TOC item
        if (tocItems.length > 0) {
          setActiveId(tocItems[tocItems.length - 1].id);
        }
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
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

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Calculate offset for sticky header + buffer = 5.25rem = 84px
    const headerOffset = 84;
    const elementPosition = heading.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    // Scroll to heading with offset
    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    // Move focus to heading for screen reader context
    heading.setAttribute("tabindex", "-1");
    heading.focus();

    // Update URL hash without adding to history (use replaceState)
    // This keeps URLs shareable but doesn't pollute browser history
    window.history.replaceState(null, "", `#${id}`);

    // If this is the last section, immediately activate it
    // (handles case where section is too short to trigger IntersectionObserver)
    if (tocItems.length > 0 && id === tocItems[tocItems.length - 1].id) {
      setActiveId(id);
    }
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
