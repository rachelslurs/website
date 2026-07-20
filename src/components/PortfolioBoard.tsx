import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ArrowRightCircle from "@components/ArrowRightCircle";
import DymoLabel from "@components/riso/DymoLabel";
import ToptalBadge from "@components/ToptalBadge";
import {
  NAV_ENTER_DURATION_S,
  NAV_LINK_COUNT,
  NAV_LINK_STAGGER_S,
} from "@components/RisoNav";
import {
  boardCardEntranceExtraRotateDeg,
  boardCardRestRotationDeg,
} from "@utils/cardRotation";
import { seededOffset } from "@utils/seededOffset";
import { SITE } from "@config";

export type TagColor = "red" | "blue" | "green";

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
  quote?: string;
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
 * finishes animating first (last nav item's stagger + animation duration).
 */
const CONTENT_ENTRANCE_DELAY_S =
  NAV_LINK_STAGGER_S * NAV_LINK_COUNT + NAV_ENTER_DURATION_S;

type EntrancePhase =
  /** SSR + pre-hydration: CSS entrance plays at load (content never hidden behind JS). */
  | "auto"
  /** Below the viewport at hydration: hidden, waiting on the observer. */
  | "armed"
  /** Observer fired: re-run the entrance now, without the nav-clearing delay. */
  | "go";

/** Document-space top of `el`'s layout box. offset* geometry ignores CSS
 *  transforms, so this is the *resting* position even while the entrance
 *  animation's translateY/scale (fill-mode both) is mid-flight. */
function restingDocumentTop(el: HTMLElement): number {
  let top = 0;
  for (
    let node: Element | null = el;
    node instanceof HTMLElement;
    node = node.offsetParent
  ) {
    top += node.offsetTop;
  }
  return top;
}

/**
 * Re-arms the load-time CSS entrance as a scroll-triggered one. Before
 * hydration everything is visible (the CSS animation runs by itself); on
 * mount, elements still fully below the viewport are hidden and revealed
 * by an IntersectionObserver, matching the old framer `whileInView` feel.
 */
function useScrollEntrance(rootMargin: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<EntrancePhase>("auto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // If the user scrolled before hydration they may already have seen any
    // element, wherever it sits now — re-hiding would replay an entrance
    // they watched (the framer version was viewport: { once: true }).
    if (window.scrollY > 0) return;
    // Resting geometry, not getBoundingClientRect: at client:idle time the
    // entrance animation often hasn't finished, and its translateY(30px)
    // from-state would misclassify a fold-straddling element as below the
    // viewport — arming it into the observer's negative-margin dead zone
    // where it never un-hides.
    if (restingDocumentTop(el) <= window.innerHeight) return;

    setPhase("armed");
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setPhase("go");
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, phase };
}

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
    const { ref: entranceRef, phase: entrancePhase } =
      useScrollEntrance("-10% 0px");

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
        // Return to the original rest rotation so tape/pins feel physically attached.
        setDragRot(flat ? 0 : rot);
        dragRef.current?.releasePointerCapture(e.pointerId);
      },
      [isDragging, flat, rot]
    );

    const currentRot = dragRot !== null ? dragRot : rot;
    const scale = isDragging ? 1.01 : 1;

    const entranceRotDeg = useMemo(
      () =>
        flat
          ? 0
          : rot +
            (rotationSlug
              ? boardCardEntranceExtraRotateDeg(rotationSlug)
              : seededOffset(index * 31, 6)),
      [flat, rot, index, rotationSlug]
    );
    // Scroll-triggered re-runs skip the nav-clearing delay (the old code
    // cleared it with a timeout for the same reason).
    const entranceDelayS =
      entrancePhase === "go"
        ? stagger * 0.08
        : CONTENT_ENTRANCE_DELAY_S + stagger * 0.08;

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
          transition: isDragging ? "none" : "transform 0.3s var(--ease-spring)",
          touchAction: "auto",
          willChange: isDragging ? "transform" : "auto",
        }}
      >
        <div
          ref={entranceRef}
          className={`board-card relative flex h-full select-none flex-col ${pin} ${shadowClass} ${className} ${
            entrancePhase === "armed" ? "board-enter-armed" : "board-enter"
          }`}
          style={
            {
              "--enter-rot": `${entranceRotDeg}deg`,
              "--enter-delay": `${entranceDelayS}s`,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>
    );
  }
);

const SectionDivider = ({ label, id }: { label: string; id: string }) => {
  const { ref, phase } = useScrollEntrance("-5% 0px");
  return (
    <div
      ref={ref}
      className={`mb-6 mt-16 flex items-center gap-3 py-2 ${
        phase === "armed" ? "board-enter-armed" : "divider-enter"
      }`}
      id={id}
      style={
        {
          "--enter-delay":
            phase === "go" ? "0s" : `${CONTENT_ENTRANCE_DELAY_S}s`,
        } as React.CSSProperties
      }
    >
      <h2 className="shrink-0">
        <DymoLabel text={label} size="section" isInteractive={false} />
      </h2>
      <span className="bg-[var(--black)]/15 h-px flex-1" aria-hidden="true" />
    </div>
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
  return (
    <div className="flex flex-col">
      <section className="zone-hero relative" aria-label="Introduction">
        <BoardCard
          index={0}
          pin="tape-top tp-yellow"
          className="hero-card"
          stagger={0}
        >
          <div className="card hero-card-inner h-full justify-center border-[3px] border-[var(--black)]">
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

          {quote ? (
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
          ) : null}

          <BoardCard
            index={2}
            flat
            className="toptal-badge-card"
            /* min-w matches the fixed tag width so the 168px badge never
               overhangs its flex slot on narrow viewports */
            wrapperClassName="max-sm:flex-1 max-sm:min-w-[168px]"
            stagger={quote ? 3 : 2}
          >
            <div className="toptal-badge-surface">
              <ToptalBadge />
            </div>
          </BoardCard>
        </div>
      </section>

      <div className="h-feed">
        <SectionDivider label="Recent Posts" id="posts" />
        <p className="p-name" hidden>
          Recent Posts
        </p>
        <a className="p-author h-card" href={SITE.website} hidden>
          {SITE.author}
        </a>
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
                <article className="h-entry card flex h-full flex-col">
                  <time
                    className="dt-published post-date"
                    dateTime={post.dateTime}
                  >
                    {post.dateLabel}
                  </time>
                  <h3
                    className={`post-title ${i === 0 ? "post-title-lg" : ""}`}
                    style={{ viewTransitionName: post.slug }}
                  >
                    <a
                      href={post.href}
                      className="p-name u-url transition-colors hover:text-[var(--red)] focus-visible:outline-none"
                    >
                      {post.title}
                    </a>
                  </h3>
                  {post.desc ? (
                    <p className="p-summary post-excerpt">{post.desc}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="p-category sr-only">{post.tag}</span>
                    <DymoLabel
                      text={post.tag}
                      size="section"
                      color={post.tagColor}
                      isInteractive={false}
                    />
                    <a
                      href={post.href}
                      className="card-link card-link-circle u-url"
                    >
                      <ArrowRightCircle className="h-[1.15rem] w-[1.15rem]" />
                      <span className="sr-only">Read: {post.title}</span>
                    </a>
                  </div>
                </article>
              </BoardCard>
            );
          })}
        </section>
      </div>

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
              <article className="card flex h-full flex-col">
                <div className="mb-4 flex flex-1 flex-col">
                  <div className="work-label">{w.label}</div>
                  <h3 className="work-name m-0">
                    <a
                      href={w.href}
                      className="transition-colors hover:text-[var(--red)] focus-visible:outline-none"
                    >
                      {w.name}
                    </a>
                  </h3>
                  <p className="work-desc mb-0 mt-1.5 !flex-none leading-relaxed">
                    {w.desc}
                  </p>
                </div>
                <a href={w.href} className="card-link !mb-1 mt-auto self-start">
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
              <article className="card card-demo flex h-full min-h-[130px] flex-col items-center text-center">
                <div className="flex w-full flex-1 flex-col items-center pb-3 pt-0">
                  <h3 className="demo-title m-0">
                    <a
                      href={d.href}
                      className="transition-colors hover:text-[var(--yellow)] focus-visible:outline-none"
                    >
                      {d.title}
                    </a>
                  </h3>
                  <p className="demo-sub mb-0 mt-auto pt-3 leading-tight">
                    {d.sub}
                  </p>
                </div>
                <a href={d.href} className="card-link demo-link !mb-1 mt-auto">
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
  );
}
