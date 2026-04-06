import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DymoLabel from "@components/riso/DymoLabel";

const NAV_LINKS = [
  { label: "POSTS", href: "/posts" },
  { label: "WORK", href: "/work" },
  { label: "DEMOS", href: "/demos" },
  { label: "ABOUT", href: "/about" },
];

export const NAV_LINK_STAGGER_S = 0.065;

const useActivePath = (activePath?: string) => {
  const [path, setPath] = useState(() => activePath || "");
  useEffect(() => {
    if (activePath) setPath(activePath);
    else setPath(window.location.pathname);
  }, [activePath]);
  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    document.addEventListener("astro:page-load", sync);
    return () => document.removeEventListener("astro:page-load", sync);
  }, []);
  return path;
};

const isNavActive = (currentPath: string, linkHref: string) => {
  if (!currentPath || currentPath === "/") return false;
  if (currentPath === linkHref) return true;
  return currentPath.startsWith(linkHref + "/");
};

export default function RisoNav({
  activePath,
  siteTitle,
  animateEntrance = false,
}: {
  activePath?: string;
  siteTitle: string;
  /** Staggered spring entrance (homepage). */
  animateEntrance?: boolean;
}) {
  const currentPath = useActivePath(activePath);
  const prefersReducedMotion = useReducedMotion();
  const navSpring = { type: "spring" as const, stiffness: 380, damping: 28 };
  const showNavMotion = animateEntrance && !prefersReducedMotion;

  return (
    <motion.nav
      className="relative z-50 flex flex-wrap items-center justify-between gap-3 py-5"
      aria-label="Main navigation"
    >
      <motion.div
        initial={showNavMotion ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={navSpring}
      >
        <DymoLabel
          text={siteTitle.toUpperCase().replace(/\s+/g, " ")}
          size="large"
          as="a"
          href="/"
          isInteractive
        />
      </motion.div>
      <ul className="flex list-none flex-wrap items-center gap-1.5" role="list">
        {NAV_LINKS.map(({ label, href }, i) => (
          <motion.li
            key={href}
            initial={
              showNavMotion ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...navSpring,
              delay: showNavMotion ? NAV_LINK_STAGGER_S * (i + 1) : 0,
            }}
          >
            <DymoLabel
              text={label}
              as="a"
              href={href}
              isActive={isNavActive(currentPath, href)}
            />
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
