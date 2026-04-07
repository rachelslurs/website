/**
 * Table of contents: scroll-spy, sticky-header offset, smooth scroll.
 * Loaded inline on pages with `data-toc-root`; reads items from `data-toc-items` JSON.
 */
(function () {
  const nav = document.querySelector("[data-toc-root]");
  if (!nav || !nav.dataset.tocItems) return;
  let items;
  try {
    items = JSON.parse(nav.dataset.tocItems);
  } catch {
    return;
  }
  if (!items.length) return;

  const links = Array.from(nav.querySelectorAll("a.toc-link"));
  const listItems = Array.from(nav.querySelectorAll("li[data-toc-id]"));

  let isScrolling = false;

  function setActive(currentId) {
    for (const li of listItems) {
      const id = li.getAttribute("data-toc-id");
      const a = li.querySelector("a");
      if (!a) continue;
      if (id === currentId) {
        li.classList.add("active");
        a.setAttribute("aria-current", "location");
      } else {
        li.classList.remove("active");
        a.removeAttribute("aria-current");
      }
    }
  }

  function headerOffset() {
    const header = document.querySelector("header");
    return header ? header.offsetHeight + 20 : 80;
  }

  function handleScroll() {
    if (isScrolling) return;

    const offset = headerOffset();
    const scrollPosition = window.scrollY + offset;
    let currentSectionId = items[0].id;

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const offsetTop = el.offsetTop;
      if (scrollPosition >= offsetTop) {
        currentSectionId = item.id;
      } else {
        break;
      }
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      currentSectionId = items[items.length - 1].id;
    }

    setActive(currentSectionId);
  }

  if (window.location.hash) {
    setActive(window.location.hash.slice(1));
  }
  handleScroll();

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  for (const a of links) {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      const id = href.slice(1);
      const heading = document.getElementById(id);
      if (!heading) return;
      e.preventDefault();

      setActive(id);
      isScrolling = true;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const ho = headerOffset();
          const elementPosition =
            heading.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - ho;
          window.scrollTo({
            top: offsetPosition,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        });
      });

      const scrollDuration = prefersReducedMotion ? 100 : 1000;
      window.setTimeout(() => {
        isScrolling = false;
      }, scrollDuration);

      heading.setAttribute("tabindex", "-1");
      heading.focus();
      window.history.replaceState(null, "", "#" + id);
    });
  }
})();
