import { useCallback, useEffect, useRef, useState } from "react";
import ArrowRightCircle from "@components/ArrowRightCircle";
import DymoLabel from "@components/riso/DymoLabel";
import { usePrefersReducedMotion } from "@utils/usePrefersReducedMotion";
import type { PortfolioPost } from "@components/PortfolioBoard";

/** Seconds between each card's entrance — clearer than PortfolioBoard's 0.08s step. */
const STAGGER_STEP_S = 0.14;

/* Board geometry (card columns, twine length, board height) lives entirely in
   riso-posts-index.css as container-query-driven custom properties, so the
   SSR HTML is correctly laid out at every width before any JS runs. The
   component feeds the CSS five inputs, all stringly-typed (a dropped one
   fails silently — e.g. no `--i` stacks every card on row one):
     --n            visible card count (board inline style; load-more bumps it)
     --complete     class modifier on the board (twine tail length)
     --i            per-card index (row position)
     posts-card--right  per-card column class
     --enter-delay  per-card entrance stagger (consumed by riso.css
                    `.board-enter`, whose 0.55s duration this STAGGER_STEP_S
                    is tuned against — change them together) */

/** Max downward pull (px) for the “load more” cord gesture. */
const PULL_CORD_MAX_PX = 56;
/** Release past this offset to load more (px). */
const PULL_CORD_THRESHOLD_PX = 28;
/** Pulls above this offset suppress the button click (avoids duplicate after a drag). */
const PULL_DRAG_SUPPRESS_CLICK_PX = 10;
/** Snap-back duration for the cord stretch (matches riso.css easing). */
const PULL_SNAP_TRANSITION = "height 0.35s var(--ease-spring)";

function DraggableCard({
  index,
  side,
  zIndex,
  dragDisabled,
  tapeClass,
  children,
}: {
  /** Display index: row position (--i) and entrance stagger both derive
   *  from it — unlike the homepage BoardCard, the two never diverge here. */
  index: number;
  side: "left" | "right";
  zIndex: number;
  dragDisabled: boolean;
  tapeClass: string;
  children: React.ReactNode;
}) {
  /** Inline drag position; non-null only mid-drag (seeded from
   *  offsetLeft/offsetTop on grab). Cleared on release so the card springs
   *  back to its CSS column slot via the .posts-card left/top transition —
   *  the same spring-home the old JS layout produced by resetting pos. */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const scale = isDragging ? 1.01 : 1;
  const shadowClass = isDragging
    ? "is-dragging"
    : isHovered && !dragDisabled
      ? "is-hovered"
      : "";

  const onPointerDown = (e: React.PointerEvent) => {
    if (dragDisabled) return;
    if (
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    e.preventDefault();
    const el = dragRef.current;
    if (el && pos === null) {
      // Resolved CSS position; offset* reads layout, not the inline style.
      setPos({ x: el.offsetLeft, y: el.offsetTop });
    }
    setIsDragging(true);
    dragRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos(p => (p ? { x: p.x + e.movementX, y: p.y + e.movementY } : p));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    // Spring home: dropping the inline position hands the card back to the
    // CSS slot, animated by the .posts-card left/top transition.
    setPos(null);
    dragRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={dragRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`posts-card${side === "right" ? " posts-card--right" : ""}`}
      style={{
        ...({ "--i": index } as React.CSSProperties),
        ...(pos ? { left: Math.round(pos.x), top: Math.round(pos.y) } : null),
        zIndex: isDragging ? 9999 : zIndex,
        transform: `scale(${scale})`,
        pointerEvents: "auto",
        cursor: dragDisabled ? "default" : isDragging ? "grabbing" : "grab",
        ...(isDragging ? { transition: "none" } : null),
        touchAction: dragDisabled ? "auto" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
    >
      <div
        className={`board-card board-enter relative flex h-full min-h-0 min-w-0 flex-col select-none ${tapeClass} ${shadowClass}`}
        style={
          {
            "--enter-delay": `${index * STAGGER_STEP_S}s`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

function PullMoreCord({
  prefersReducedMotion,
  remainingPosts,
  onLoadMore,
}: {
  prefersReducedMotion: boolean;
  remainingPosts: number;
  onLoadMore: () => void;
}) {
  const reduced = prefersReducedMotion;
  /** The cord's pull/click handlers are React-bound, so pre-hydration (and
   *  with JS off) the SSR'd cord is a dead control — keep it hidden until
   *  mount so it never invites an interaction that does nothing. Older
   *  posts stay reachable without JS via the paginated tag pages. */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const [stretchPx, setStretchPx] = useState(0);
  const [pullDragActive, setPullDragActive] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const pullStretchRef = useRef(0);
  const pullStartYRef = useRef(0);
  const pullDragActiveRef = useRef(false);
  const suppressClickRef = useRef(false);

  const endPullGesture = useCallback(
    (opts?: { skipSnap?: boolean; abort?: boolean }) => {
      const releasedAt = pullStretchRef.current;
      pullDragActiveRef.current = false;
      setPullDragActive(false);

      if (opts?.abort) {
        pullStretchRef.current = 0;
        setStretchPx(0);
        setSnapping(false);
        return;
      }

      const meaningfulPull = releasedAt > PULL_DRAG_SUPPRESS_CLICK_PX;
      const shouldLoad = releasedAt >= PULL_CORD_THRESHOLD_PX;
      if (shouldLoad) {
        onLoadMore();
      }
      if (shouldLoad || meaningfulPull) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 450);
      }

      if (releasedAt <= 0) {
        pullStretchRef.current = 0;
        setStretchPx(0);
        return;
      }

      if (reduced || opts?.skipSnap) {
        pullStretchRef.current = 0;
        setStretchPx(0);
        setSnapping(false);
        return;
      }

      setSnapping(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pullStretchRef.current = 0;
          setStretchPx(0);
        });
      });
    },
    [onLoadMore, reduced]
  );

  const handlePullPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (snapping) return;
      if (e.button !== 0) return;
      // Prevent native scroll/overscroll rubber-banding from “pulling” the page.
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      pullStartYRef.current = e.clientY;
      pullStretchRef.current = 0;
      setStretchPx(0);
      pullDragActiveRef.current = true;
      setPullDragActive(true);
    },
    [snapping]
  );

  const handlePullPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pullDragActiveRef.current) return;
      const dy = e.clientY - pullStartYRef.current;
      const v = Math.max(0, Math.min(PULL_CORD_MAX_PX, dy));
      pullStretchRef.current = v;
      setStretchPx(v);
      if (v > 0) e.preventDefault();
    },
    []
  );

  const handlePullPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pullDragActiveRef.current) return;
      e.preventDefault();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be released */
      }
      endPullGesture();
    },
    [endPullGesture]
  );

  const handlePullPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pullDragActiveRef.current) return;
      e.preventDefault();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      endPullGesture({ abort: true });
    },
    [endPullGesture]
  );

  const handleConnectorTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "height") return;
      if (e.target !== e.currentTarget) return;
      setSnapping(false);
      pullStretchRef.current = 0;
    },
    []
  );

  const handleButtonClick = useCallback(() => {
    if (suppressClickRef.current) return;
    onLoadMore();
  }, [onLoadMore]);

  const stackClass = [
    "pull-stack",
    pullDragActive ? "pull-stack--dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`pull-container${hydrated ? " pull-container--ready" : ""}${
        reduced ? " pull-container--no-motion" : ""
      }`}
    >
      <div
        className={stackClass}
        onPointerDown={handlePullPointerDown}
        onPointerMove={handlePullPointerMove}
        onPointerUp={handlePullPointerUp}
        onPointerCancel={handlePullPointerCancel}
      >
        <div className="pull-connector-track" aria-hidden="true">
          <div
            className="pull-connector"
            style={{
              height: stretchPx,
              transition: snapping ? PULL_SNAP_TRANSITION : undefined,
            }}
            onTransitionEnd={handleConnectorTransitionEnd}
          />
        </div>
        <div className="pull-knot-hit" aria-hidden="true">
          <div className="twine-knot knot-bottom" />
        </div>
        <button
          type="button"
          className="pull-action"
          onClick={handleButtonClick}
          aria-label={`Load more posts. ${remainingPosts} remaining.`}
        >
          <span className="pull-tag-text" aria-hidden="true">
            PULL FOR MORE
          </span>
        </button>
      </div>
    </div>
  );
}

export default function PostsIndexBoard({
  posts,
  pageSize,
}: {
  posts: PortfolioPost[];
  pageSize: number;
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [loadMoreStatus, setLoadMoreStatus] = useState("");
  /** null = unknown (SSR / pre-hydration). Treated as touch so the static
   *  HTML never ships touch-action:none — cards are SSR-visible and tile
   *  most of a phone viewport, so a pre-hydration scroll dead-zone is worse
   *  than a briefly disabled drag. */
  const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const dragDisabled = isTouchDevice !== false;

  const displayedPosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;
  const remainingPosts = posts.length - visibleCount;

  const handleLoadMore = useCallback(() => {
    const batch = Math.min(pageSize, remainingPosts);
    setVisibleCount(v => v + batch);
    const noun = batch === 1 ? "post" : "posts";
    setLoadMoreStatus(`${batch} more ${noun} loaded.`);
  }, [pageSize, remainingPosts]);

  const nPosts = displayedPosts.length;

  return (
    <div className="posts-index-frame">
      <div
        className={`posts-index-board not-prose${
          hasMore ? "" : " posts-index-board--complete"
        }`}
        style={{ "--n": nPosts } as React.CSSProperties}
      >
        <div className="posts-rss-anchor">
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="rss-tag"
            aria-label="RSS feed"
            title="RSS Feed"
          >
            RSS
          </a>
        </div>

        <div className="posts-twine">
          <div className="twine-knot knot-top" />
          {!hasMore && <div className="twine-knot knot-bottom" />}
        </div>

        {hasMore && (
          <PullMoreCord
            prefersReducedMotion={prefersReducedMotion}
            remainingPosts={remainingPosts}
            onLoadMore={handleLoadMore}
          />
        )}
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {loadMoreStatus}
        </p>

        {displayedPosts.map((post, displayIdx) => {
          const isLeft = displayIdx % 2 === 0;
          /* Corner washi (tape-c): same centered diagonal strips as homepage Writing cards. */
          const tapeClass = `${displayIdx === 0 ? "featured-post-tape " : ""}tape-c ${
            displayIdx % 2 === 0 ? "tc-pink" : "tc-yellow"
          }`;

          /* Higher index = lower z so earlier posts overlap later ones; base scales with count so z stays above .pull-container (riso-posts-index.css). */
          const stackZ = 100 + (nPosts - 1 - displayIdx);

          return (
            <DraggableCard
              key={post.id}
              index={displayIdx}
              side={isLeft ? "left" : "right"}
              zIndex={stackZ}
              dragDisabled={dragDisabled}
              tapeClass={tapeClass}
            >
              <article className="card flex flex-col">
                <h2
                  className="post-title m-0 mb-2 font-semibold"
                  style={{ viewTransitionName: post.slug }}
                >
                  <a
                    href={post.href}
                    title={post.title}
                    className="hover:text-[var(--red)] transition-colors focus-visible:outline-none"
                  >
                    {post.title}
                  </a>
                </h2>
                <time className="post-date" dateTime={post.dateTime}>
                  {post.dateLabel}
                </time>
                {post.desc ? (
                  <p className="post-excerpt m-0">{post.desc}</p>
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
            </DraggableCard>
          );
        })}
      </div>
    </div>
  );
}
