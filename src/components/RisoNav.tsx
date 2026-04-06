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
      className="relative z-50 flex w-full flex-wrap items-center justify-center gap-3 py-5 md:justify-between"
      aria-label="Main navigation"
    >
      <motion.div
        initial={showNavMotion ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={navSpring}
      >
        <div className="group relative inline-flex cursor-pointer items-center">
          <DymoLabel
            text={siteTitle.toUpperCase().replace(/\s+/g, " ")}
            size="large"
            as="a"
            href="/"
            isInteractive
          />
          <div
            className="dust-note pointer-events-auto absolute left-[calc(100%+12px)] top-1/2 z-[100] hidden min-w-[200px] max-w-[300px] -translate-x-[10px] -translate-y-1/2 rotate-[3deg] border border-dashed border-black/20 bg-[var(--yellow)] px-[10px] py-1.5 text-center font-mono text-sm font-bold uppercase leading-tight tracking-wide text-[var(--black)] opacity-0 shadow-[2px_3px_6px_rgba(0,0,0,0.2)] transition-[opacity_0.2s_ease,transform_0.3s_cubic-bezier(0.34,1.56,0.64,1)] [clip-path:polygon(0%_0%,100%_0%,98%_100%,2%_95%)] group-hover:-translate-y-1/2 group-hover:translate-x-[5px] group-hover:-rotate-2 group-hover:opacity-100 motion-reduce:transition-[opacity_0.2s_ease,transform_0.2s_ease] md:block"
            aria-hidden="true"
          >
            Pardon the dust, <br />
            I&apos;m doing it live! 🚧
          </div>
        </div>
      </motion.div>
      <ul
        className="flex list-none flex-wrap items-center justify-center gap-1.5 md:justify-start"
        role="list"
      >
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
