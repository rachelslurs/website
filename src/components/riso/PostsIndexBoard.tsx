import { useCallback, useEffect, useRef, useState } from "react";
import ArrowRightCircle from "@components/ArrowRightCircle";
import DymoLabel from "@components/riso/DymoLabel";
import { usePrefersReducedMotion } from "@utils/usePrefersReducedMotion";
import type { PortfolioPost } from "@components/PortfolioBoard";

/** Seconds between each card's entrance — clearer than PortfolioBoard's 0.08s step. */
const STAGGER_STEP_S = 0.14;

/** Even vertical gap (px) between two cards stacked in the same column, applied
 *  by the measured layout so differing card heights never overlap. */
const COLUMN_GAP_PX = 56;

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
  topPx,
  children,
}: {
  /** Display index: row position (--i) and entrance stagger both derive
   *  from it — unlike the homepage BoardCard, the two never diverge here. */
  index: number;
  side: "left" | "right";
  zIndex: number;
  dragDisabled: boolean;
  tapeClass: string;
  /** Measured slot top (px), applied as inline `top`. null pre-measure → CSS
   *  falls back to the row grid (`.posts-card { top: calc(…) }`). */
  topPx: number | null;
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
        // Measured slot top overrides the CSS row-grid fallback; set as a real
        // `top` (not a var) so the spring transition fires. `pos` (drag) wins.
        ...(topPx != null ? { top: topPx } : null),
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

  const boardRef = useRef<HTMLDivElement>(null);
  /** Measured layout: per-card slot tops plus the board/twine extents derived
   *  from real content heights. null until the first measure (SSR / pre-JS uses
   *  the CSS row-grid fallback). */
  const [layout, setLayout] = useState<{
    tops: number[];
    boardHeight: number;
    stringH: number;
  } | null>(null);
  const lastWidthRef = useRef(0);

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

  /** Measure each card's real height and stack cards within their visual column
   *  (grouped by resolved offsetLeft, so it works in both the two-column and
   *  stacked bands without a hard-coded breakpoint) using an even gap. Then size
   *  the board and twine (--string-h) to the tallest column so they follow the
   *  real content instead of the --n/--est-h estimate. */
  const measureAndLayout = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const cards = Array.from(
      board.querySelectorAll<HTMLElement>(".posts-card")
    );
    if (!cards.length) return;

    const cs = getComputedStyle(board);
    const num = (name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const baseY = num("--base-y", 104);
    const twineTop = num("--twine-top", 52);
    const bottomPad = num("--bottom-pad", 260);
    const stringTail = num("--string-tail", 92);
    // Right column starts one row-step lower, preserving the board's diagonal
    // stagger; single-column (stacked) has one column, so it never applies.
    const rowStep = num("--row-step", 270);

    // Column assignment mirrors the CSS bands: below the container-query
    // breakpoint everything is one centered column (chronological order),
    // otherwise cards alternate left/right. Key off board width — NOT live
    // offsetLeft, which animates via the `.posts-card` `left` transition and
    // would misgroup cards mid-resize. Keep 854 in sync with the
    // `@container (width < 854px)` rule in riso-posts-index.css.
    const stacked = board.getBoundingClientRect().width < 854;

    let cursorLeft = baseY;
    let cursorRight = baseY + rowStep;
    let cursorSingle = baseY;
    const tops = cards.map((card, i) => {
      const h = card.offsetHeight;
      let top: number;
      if (stacked) {
        top = cursorSingle;
        cursorSingle = top + h + COLUMN_GAP_PX;
      } else if (i % 2 === 0) {
        top = cursorLeft;
        cursorLeft = top + h + COLUMN_GAP_PX;
      } else {
        top = cursorRight;
        cursorRight = top + h + COLUMN_GAP_PX;
      }
      return top;
    });

    // Cursors now hold each column's next slot = last card bottom + gap.
    const maxBottom =
      (stacked ? cursorSingle : Math.max(cursorLeft, cursorRight)) -
      COLUMN_GAP_PX;
    const boardHeight = Math.max(800, maxBottom + bottomPad);
    const stringH = Math.max(120, maxBottom - twineTop + stringTail);

    setLayout({ tops, boardHeight, stringH });
  }, []);

  // Re-measure after render and load-more, and once web fonts settle (font swap
  // changes card heights).
  useEffect(() => {
    measureAndLayout();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measureAndLayout();
    });
    return () => {
      cancelled = true;
    };
  }, [measureAndLayout, visibleCount]);

  // Re-measure on width change (flips column membership between bands). Ignore
  // height-only changes — those come from our own board resize and would loop.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      const w = Math.round(entries[0]!.contentRect.width);
      if (w === lastWidthRef.current) return;
      lastWidthRef.current = w;
      measureAndLayout();
    });
    ro.observe(board);
    return () => ro.disconnect();
  }, [measureAndLayout]);

  return (
    <div className="posts-index-frame">
      <div
        ref={boardRef}
        className={`posts-index-board not-prose${
          hasMore ? "" : " posts-index-board--complete"
        }`}
        style={
          {
            "--n": nPosts,
            ...(layout
              ? {
                  height: layout.boardHeight,
                  "--string-h": `${layout.stringH}px`,
                }
              : null),
          } as React.CSSProperties
        }
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
              topPx={layout?.tops[displayIdx] ?? null}
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
