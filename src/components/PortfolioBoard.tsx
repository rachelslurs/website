import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import DymoLabel from "@components/riso/DymoLabel";
import { NAV_LINK_STAGGER_S } from "@components/RisoNav";
import {
  boardCardEntranceExtraRotateDeg,
  boardCardRestRotationDeg,
} from "@utils/cardRotation";
import { seededOffset } from "@utils/seededOffset";

export type TagColor = "red" | "blue" | "green";

const ArrowRightCircle = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    {...props}
  >
    {/* Chunky chevron right, centered for use inside the circular button */}
    <path
      d="M10.25 8.25 14 12l-3.75 3.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface PortfolioPost {
  id: string;
  /** Matches `CollectionEntry.slug` / post URL segment; shared-element VT name with post page title. */
  slug: string;
  dateLabel: string;
  dateTime: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: TagColor;
  href: string;
}

export interface PortfolioWork {
  id: string;
  label: string;
  name: string;
  desc: string;
  href: string;
}

export interface PortfolioDemo {
  id: string;
  title: string;
  sub: string;
  href: string;
}

export interface PortfolioBoardProps {
  heroHeadline: string;
  heroBody: string;
  quote: string;
  skills?: string[];
  posts: PortfolioPost[];
  work: PortfolioWork[];
  demos: PortfolioDemo[];
}

const DEFAULT_SKILLS = [
  "React",
  "TypeScript",
  "UI Animation",
  "Design Systems",
  "a11y",
  "Storybook",
];

/**
 * Delay before board cards / section dividers start their entrance, so nav
 * finishes animating first (last nav item stagger + spring settle buffer).
 */
const CONTENT_ENTRANCE_DELAY_S = NAV_LINK_STAGGER_S * 4 + 0.28;

/** After this, board entrance delay drops to 0 so scroll-triggered items don’t wait. */
const BOARD_DELAY_CLEAR_MS = Math.round(
  (CONTENT_ENTRANCE_DELAY_S + 0.15) * 1000
);

const BoardEntranceDelayContext = createContext(CONTENT_ENTRANCE_DELAY_S);

const BoardCard = React.memo(
  ({
    children,
    index,
    pin = "",
    className = "",
    /** Applied to the outer wrapper (grid/flex item). Use for `col-span-*` etc. */
    wrapperClassName = "",
    style = {},
    stagger = 0,
    /** When set (blog cards), tilt matches `/posts` board and post header. */
    rotationSlug,
    /** No rest or entrance rotation (blog cards on index). */
    flat = false,
  }: {
    children: React.ReactNode;
    index: number;
    pin?: string;
    className?: string;
    wrapperClassName?: string;
    style?: React.CSSProperties;
    stagger?: number;
    rotationSlug?: string;
    flat?: boolean;
  }) => {
    const rot = useMemo(
      () =>
        flat
          ? 0
          : rotationSlug
            ? boardCardRestRotationDeg(rotationSlug)
            : seededOffset(index * 17, 2.5),
      [flat, rotationSlug, index]
    );
    const [dragRot, setDragRot] = useState<number | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [z, setZ] = useState(10);
    const dragRef = useRef<HTMLDivElement | null>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const boardEntranceDelayS = useContext(BoardEntranceDelayContext);

    useEffect(() => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    }, []);

    const onPointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (isTouchDevice) return;
        if ((e.target as HTMLElement).closest("a, button")) return;
        e.preventDefault();
        setIsDragging(true);
        setDragRot(0);
        setZ(9999);
        dragRef.current?.setPointerCapture(e.pointerId);
      },
      [isTouchDevice]
    );

    const onPointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging) return;
        setOffset(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
      },
      [isDragging]
    );

    const onPointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        setDragRot(flat ? 0 : seededOffset(Date.now(), 3));
        dragRef.current?.releasePointerCapture(e.pointerId);
      },
      [isDragging, flat]
    );

    const currentRot = dragRot !== null ? dragRot : rot;
    /* Scale only while dragging — hover scale made body text look like it “changed font” (AA re-raster). */
    const scale = isDragging ? 1.04 : 1;

    const entranceVariants = useMemo(
      () => ({
        hidden: {
          opacity: 0,
          y: 30,
          rotate: flat
            ? 0
            : rot +
              (rotationSlug
                ? boardCardEntranceExtraRotateDeg(rotationSlug)
                : seededOffset(index * 31, 6)),
          scale: 0.95,
        },
        visible: {
          opacity: 1,
          y: 0,
          rotate: 0,
          scale: 1,
          transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 25,
            delay: boardEntranceDelayS + stagger * 0.08,
          },
        },
      }),
      [flat, rot, index, stagger, boardEntranceDelayS, rotationSlug]
    );

    const shadowClass = isDragging
      ? "is-dragging"
      : isHovered && !isTouchDevice
        ? "is-hovered"
        : "";

    return (
      <div
        ref={dragRef}
        className={`h-full ${wrapperClassName}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          ...style,
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${currentRot}deg) scale(${scale})`,
          zIndex: isDragging ? 9999 : z,
          cursor: isTouchDevice ? "default" : isDragging ? "grabbing" : "grab",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          touchAction: "auto",
          willChange: isDragging ? "transform" : "auto",
        }}
      >
        <motion.div
          className={`board-card relative flex h-full flex-col select-none ${pin} ${shadowClass} ${className}`}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={entranceVariants}
        >
          {children}
        </motion.div>
      </div>
    );
  }
);

const SectionDivider = ({ label, id }: { label: string; id: string }) => {
  const prefersReducedMotion = useReducedMotion();
  const boardEntranceDelayS = useContext(BoardEntranceDelayContext);
  const delay = prefersReducedMotion ? 0 : boardEntranceDelayS;
  return (
    <motion.div
      className="mb-6 mt-16 flex items-center gap-3 py-2"
      id={id}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      <h2 className="shrink-0">
        <DymoLabel text={label} size="section" isInteractive={false} />
      </h2>
      <span className="h-px flex-1 bg-[var(--black)]/15" aria-hidden="true" />
    </motion.div>
  );
};

const Swatch = ({
  color,
  pattern = "stripe",
  index,
  style = {},
}: {
  color: string;
  pattern?: "stripe" | "dot";
  index: number;
  style?: React.CSSProperties;
}) => (
  <div
    className={`swatch swatch-${pattern}`}
    aria-hidden="true"
    style={{
      ["--sw-color" as string]: color,
      transform: `rotate(${seededOffset(index * 23, 5)}deg)`,
      ...style,
    }}
  />
);

export default function PortfolioBoard({
  heroHeadline,
  heroBody,
  quote,
  skills = DEFAULT_SKILLS,
  posts,
  work,
  demos,
}: PortfolioBoardProps) {
  const prefersReducedMotion = useReducedMotion();

  const [boardEntranceDelayS, setBoardEntranceDelayS] = useState(() =>
    prefersReducedMotion ? 0 : CONTENT_ENTRANCE_DELAY_S
  );
  useEffect(() => {
    if (prefersReducedMotion) {
      setBoardEntranceDelayS(0);
      return;
    }
    const id = window.setTimeout(() => {
      setBoardEntranceDelayS(0);
    }, BOARD_DELAY_CLEAR_MS);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion]);

  return (
    <BoardEntranceDelayContext.Provider value={boardEntranceDelayS}>
      <div className="flex flex-col">
        <section className="zone-hero relative" aria-label="Introduction">
          <BoardCard
            index={0}
            pin="tape-top tp-yellow"
            className="hero-card"
            stagger={0}
          >
            <div className="card h-full hero-card-inner border-[3px] border-[var(--black)] justify-center">
              <h1 className="hero-headline mb-4 mt-0">{heroHeadline}</h1>
              <p className="hero-body max-w-[480px]">{heroBody}</p>
            </div>
          </BoardCard>

          <div className="hero-sidebar">
            <BoardCard
              index={1}
              pin="pushpin pp-green"
              className="skills-card"
              wrapperClassName="max-sm:flex-1 max-sm:min-w-[140px]"
              stagger={1}
            >
              <div
                className="card flex flex-wrap content-center justify-center gap-[5px] p-4"
                role="list"
                aria-label="Technical skills"
              >
                {skills.map((tag, i) => {
                  const highlight = ["React", "a11y"].includes(tag)
                    ? "tag-yellow"
                    : tag === "UI Animation"
                      ? "tag-pink"
                      : "";
                  return (
                    <span
                      key={tag}
                      role="listitem"
                      className={`skill-tag inline-block ${highlight}`}
                      style={{
                        transform: `rotate(${seededOffset(i * 11, 1.5)}deg)`,
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </BoardCard>

            <BoardCard
              index={2}
              pin="pushpin pp-red"
              className="quote-card"
              wrapperClassName="max-sm:flex-1 max-sm:min-w-[140px]"
              stagger={2}
            >
              <blockquote className="card m-0 flex min-h-[100px] items-center justify-center border-2 border-dashed border-[var(--black)] p-5">
                <p className="quote-text">{quote}</p>
              </blockquote>
            </BoardCard>
          </div>

          <Swatch
            color="var(--yellow)"
            pattern="stripe"
            index={0}
            style={{
              gridArea: "auto",
              position: "absolute",
              top: "-10px",
              right: "40%",
            }}
          />
        </section>

        <SectionDivider label="Recent Posts" id="posts" />
        <section
          className="relative grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1"
          aria-label="Blog posts"
        >
          {posts.map((post, i) => {
            const pins = [
              "tape-c tc-pink",
              "pushpin pp-yellow",
              "pushpin pp-green",
              "tape-top tp-blue",
              "tape-c tc-yellow",
              "pushpin pp-blue",
            ];
            return (
              <BoardCard
                key={post.id}
                index={i + 10}
                flat
                pin={pins[i % pins.length]}
                className={`post-item ${i === 0 ? "featured-post-tape" : ""}`}
                wrapperClassName={i === 0 ? "col-span-2 max-sm:col-span-1" : ""}
                stagger={i}
              >
                <article className="card h-full flex flex-col">
                  <time className="post-date" dateTime={post.dateTime}>
                    {post.dateLabel}
                  </time>
                  <h3
                    className={`post-title ${i === 0 ? "post-title-lg" : ""}`}
                    style={{ viewTransitionName: post.slug }}
                  >
                    <a
                      href={post.href}
                      className="hover:text-[var(--red)] transition-colors focus-visible:outline-none"
                    >
                      {post.title}
                    </a>
                  </h3>
                  {post.desc ? (
                    <p className="post-excerpt">{post.desc}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <DymoLabel
                      text={post.tag}
                      size="section"
                      color={post.tagColor}
                      isInteractive={false}
                    />
                    <a href={post.href} className="card-link card-link-circle">
                      <ArrowRightCircle className="h-[1.15rem] w-[1.15rem]" />
                      <span className="sr-only">Read: {post.title}</span>
                    </a>
                  </div>
                </article>
              </BoardCard>
            );
          })}
        </section>

        <div className="flex justify-center gap-4 py-2" aria-hidden="true">
          <Swatch color="var(--red)" pattern="dot" index={3} />
          <Swatch color="var(--blue)" pattern="dot" index={4} />
          <Swatch color="var(--green)" pattern="stripe" index={5} />
        </div>

        <SectionDivider label="Featured Work" id="work" />
        <section
          className="relative grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1"
          aria-label="Selected work"
        >
          {work.map((w, i) => {
            const pins = ["bclip", "tape-c tc-pink", "pushpin pp-yellow"];
            return (
              <BoardCard
                key={w.id}
                index={i + 20}
                pin={pins[i % pins.length]}
                className="work-item"
                wrapperClassName={
                  i === work.length - 1
                    ? "max-lg:col-span-2 max-sm:col-span-1"
                    : ""
                }
                stagger={i}
              >
                <article className="card h-full flex flex-col">
                  <div className="flex flex-1 flex-col mb-4">
                    <div className="work-label">{w.label}</div>
                    <h3 className="work-name m-0">
                      <a
                        href={w.href}
                        className="hover:text-[var(--red)] transition-colors focus-visible:outline-none"
                      >
                        {w.name}
                      </a>
                    </h3>
                    <p className="work-desc !flex-none mt-1.5 mb-0 leading-relaxed">
                      {w.desc}
                    </p>
                  </div>
                  <a
                    href={w.href}
                    className="card-link self-start mt-auto !mb-1"
                  >
                    <span aria-hidden="true">&rarr;</span> Case study
                    <span className="sr-only">: {w.name}</span>
                  </a>
                </article>
              </BoardCard>
            );
          })}
        </section>

        <SectionDivider label="DEMOS" id="demos" />
        <section
          className="relative grid grid-cols-4 gap-8 max-lg:grid-cols-2"
          aria-label="Interactive demos"
        >
          {demos.map((d, i) => {
            const pins = [
              "pushpin pp-red",
              "tape-top tp-yellow",
              "pushpin pp-blue",
              "tape-top tp-green",
            ];
            return (
              <BoardCard
                key={d.id}
                index={i + 30}
                pin={pins[i % pins.length]}
                className="demo-item"
                stagger={i}
              >
                <article className="card h-full card-demo flex min-h-[130px] flex-col items-center text-center">
                  <div className="flex flex-1 w-full flex-col items-center pt-0 pb-3">
                    <h3 className="demo-title m-0">
                      <a
                        href={d.href}
                        className="hover:text-[var(--yellow)] transition-colors focus-visible:outline-none"
                      >
                        {d.title}
                      </a>
                    </h3>
                    <p className="demo-sub mt-auto pt-3 mb-0 leading-tight">
                      {d.sub}
                    </p>
                  </div>
                  <a
                    href={d.href}
                    className="card-link demo-link mt-auto !mb-1"
                  >
                    <span aria-hidden="true">&rarr;</span> Launch
                    <span className="sr-only">: {d.title} demo</span>
                  </a>
                </article>
              </BoardCard>
            );
          })}
        </section>

        <div
          className="flex flex-wrap justify-center gap-4 py-2"
          aria-hidden="true"
        >
          <Swatch color="var(--pink)" pattern="stripe" index={6} />
          <Swatch
            color="var(--violet)"
            pattern="dot"
            index={7}
            style={{ borderRadius: "50%" }}
          />
          <Swatch color="var(--orange)" pattern="dot" index={8} />
        </div>
      </div>
    </BoardEntranceDelayContext.Provider>
  );
}
