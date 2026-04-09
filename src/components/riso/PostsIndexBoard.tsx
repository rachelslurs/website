import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import DymoLabel from "@components/riso/DymoLabel";
import type { PortfolioPost } from "@components/PortfolioBoard";

const CONTENT_ENTRANCE_DELAY_S = 0;
const STAGGER_STEP_S = 0.14;

const KNOT_TOP_TAIL_PX = 45;
const NARROW_BOARD_MAX_PX = 640;
const BOARD_BOTTOM_PAD_DEFAULT = 260;
const BOARD_BOTTOM_PAD_NARROW = 300;

const PULL_CORD_MAX_PX = 56;
/** Match `.twine-knot { height }` in riso.css — elastic segment is at least this tall when visible. */
const TWINE_KNOT_BODY_HEIGHT_PX = 10;
const PULL_CORD_THRESHOLD_PX = 28;
const PULL_DRAG_SUPPRESS_CLICK_PX = 10;
const PULL_SNAP_TRANSITION = "height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";

function layoutBoardWidthPx(width: number) {
  return Math.round(Math.max(width, 320));
}

/**
 * Posts index — pull cord (keep DOM + CSS in sync):
 * Strand is `.posts-twine-stripe` in `.posts-twine--flow` (knot → stripe + `__tail` segment → PullMoreCord).
 * `usePullCord` sets JS height while dragging; CSS keyframes when idle. `.posts-index-twine-grow--idle-elastic-cancel`
 * cancels extra elastic height so the grid row stays stable. `TWINE_KNOT_BODY_HEIGHT_PX` matches `--twine-knot-body-h`.
 */
function usePullCord({
  prefersReducedMotion,
  onLoadMore,
}: {
  prefersReducedMotion: boolean | null;
  onLoadMore: () => void;
}) {
  const reduced = prefersReducedMotion === true;
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
        /* ignore */
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

  const handleLostPointerCapture = useCallback(() => {
    if (!pullDragActiveRef.current) return;
    endPullGesture();
  }, [endPullGesture]);

  const handleStrandTransitionEnd = useCallback(
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
    snapping ? "pull-stack--snapping" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /** While pulling / snapping: JS height. At idle: CSS animates length in sync with the bounce layer. */
  const cordHeightPx =
    stretchPx === 0 ? 0 : Math.max(stretchPx, TWINE_KNOT_BODY_HEIGHT_PX);
  const idleDangle =
    stretchPx === 0 && !pullDragActive && !snapping && !reduced;

  const idleStatic = reduced && stretchPx === 0 && !pullDragActive && !snapping;

  const connectorCollapsed =
    cordHeightPx === 0 && !snapping && !idleDangle && !idleStatic;

  const connectorClass = [
    "pull-connector",
    idleDangle ? "pull-connector--idle-dangle" : "",
    idleStatic ? "pull-connector--idle-static" : "",
    connectorCollapsed ? "pull-connector--rest" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const trackClass = [
    "pull-connector-track",
    connectorCollapsed ? "pull-connector-track--rest" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /** Tail is `.posts-twine-stripe__tail` inside `.posts-twine-stripe--pull` (idle keyframes or `--posts-stripe-tail-h`). */
  const stripeTailClassName = [
    "posts-twine-stripe__tail",
    idleDangle ? "posts-twine-stripe__tail--idle-dangle" : "",
    idleStatic ? "posts-twine-stripe__tail--idle-static" : "",
    !idleDangle && !idleStatic ? "posts-twine-stripe__tail--js" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stripeTailStyle: React.CSSProperties | undefined =
    idleDangle || idleStatic
      ? undefined
      : ({
          ["--posts-stripe-tail-h" as string]: `${Math.max(cordHeightPx, TWINE_KNOT_BODY_HEIGHT_PX)}px`,
        } as React.CSSProperties);

  const twineGrowCancelClassName =
    idleDangle && !reduced ? "posts-index-twine-grow--idle-elastic-cancel" : "";

  const twinePullExtraPx =
    idleDangle || idleStatic
      ? 0
      : Math.max(
          0,
          Math.max(cordHeightPx, TWINE_KNOT_BODY_HEIGHT_PX) -
            TWINE_KNOT_BODY_HEIGHT_PX
        );

  const twineGrowCancelStyle: React.CSSProperties | undefined =
    twinePullExtraPx > 0
      ? { marginBottom: `-${twinePullExtraPx}px` }
      : undefined;

  return {
    reduced,
    stretchPx,
    pullDragActive,
    snapping,
    cordHeightPx,
    idleDangle,
    idleStatic,
    connectorCollapsed,
    stackClass,
    connectorClass,
    trackClass,
    stripeTailClassName,
    stripeTailStyle,
    twineGrowCancelClassName,
    twineGrowCancelStyle,
    handlePullPointerDown,
    handlePullPointerMove,
    handlePullPointerUp,
    handlePullPointerCancel,
    handleLostPointerCapture,
    handleStrandTransitionEnd,
    handleButtonClick,
  };
}

function PullMoreCord({
  pull,
  remainingPosts,
}: {
  pull: ReturnType<typeof usePullCord>;
  remainingPosts: number;
}) {
  const {
    reduced,
    stackClass,
    handlePullPointerDown,
    handlePullPointerMove,
    handlePullPointerUp,
    handlePullPointerCancel,
    handleLostPointerCapture,
    handleButtonClick,
  } = pull;

  return (
    <div
      className={[
        "pull-container pull-container--flow pull-container--strand-in-twine",
        reduced ? "pull-container--no-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={stackClass}
        onPointerDown={handlePullPointerDown}
        onPointerMove={handlePullPointerMove}
        onPointerUp={handlePullPointerUp}
        onPointerCancel={handlePullPointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
      >
        <div
          className="pull-connector-track pull-connector-track--rest"
          aria-hidden="true"
        />
        <div className="pull-bounce-layer">
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
    </div>
  );
}

function PostCard({
  post,
  tapeClass,
  stagger,
}: {
  post: PortfolioPost;
  tapeClass: string;
  stagger: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const entranceVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
      visible: (staggerIndex: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: 260,
          damping: 25,
          delay: CONTENT_ENTRANCE_DELAY_S + staggerIndex * STAGGER_STEP_S,
        },
      }),
    }),
    []
  );

  return (
    <motion.article
      className={`board-card posts-index-card relative flex min-h-0 min-w-0 max-w-full flex-col select-none ${tapeClass}`}
      variants={entranceVariants}
      custom={stagger}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate="visible"
    >
      <div className="card flex flex-col">
        <h2
          className="post-title m-0 mb-1 text-sm font-semibold md:text-base"
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
        <time
          className="post-date mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-[var(--ink-muted)] md:mb-3 md:text-xs"
          dateTime={post.dateTime}
        >
          {post.dateLabel}
        </time>
        {post.desc ? (
          <p className="post-excerpt m-0 hidden font-body leading-relaxed md:block">
            {post.desc}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between pt-2 md:pt-4">
          <DymoLabel
            text={post.tag}
            size="section"
            color={post.tagColor}
            isInteractive={false}
          />
          <a href={post.href} className="card-link">
            <span aria-hidden="true">&rarr;</span> Read
            <span className="sr-only">: {post.title}</span>
          </a>
        </div>
      </div>
    </motion.article>
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
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(1200);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = boardRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0]?.contentRect.width;
      if (cr) setBoardWidth(layoutBoardWidthPx(cr));
    });
    ro.observe(el);
    setBoardWidth(layoutBoardWidthPx(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  const narrowBoard = boardWidth < NARROW_BOARD_MAX_PX;
  const boardBottomPad = narrowBoard
    ? BOARD_BOTTOM_PAD_NARROW
    : BOARD_BOTTOM_PAD_DEFAULT;

  const displayedPosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount]
  );
  const hasMore = visibleCount < posts.length;
  const remainingPosts = posts.length - visibleCount;

  const handleLoadMore = useCallback(() => {
    const batch = Math.min(pageSize, remainingPosts);
    setVisibleCount(v => v + batch);
    const noun = batch === 1 ? "post" : "posts";
    setLoadMoreStatus(`${batch} more ${noun} loaded.`);
  }, [pageSize, remainingPosts]);

  const pull = usePullCord({
    prefersReducedMotion,
    onLoadMore: handleLoadMore,
  });

  const leftPosts = useMemo(
    () => displayedPosts.filter((_, i) => i % 2 === 0),
    [displayedPosts]
  );
  const rightPosts = useMemo(
    () => displayedPosts.filter((_, i) => i % 2 === 1),
    [displayedPosts]
  );

  /** Stagger index follows global post order for consistent entrance timing. */
  const staggerFor = (globalIndex: number) => globalIndex;

  /** Vertical offset for absolutely positioned RSS in two-column mode (aligns with twine knot tail). */
  const rssAnchorTop = useMemo(
    () => (narrowBoard ? 74 : 52) - KNOT_TOP_TAIL_PX,
    [narrowBoard]
  );

  return (
    <div
      ref={boardRef}
      className={`posts-index-board not-prose${
        narrowBoard ? " posts-index-board--narrow" : ""
      }`}
      style={{
        paddingBottom: `${boardBottomPad}px`,
        transition: "padding-bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="posts-index-grid">
        <div className="posts-index-col posts-index-col--left">
          {leftPosts.map((post, i) => {
            const displayIdx = i * 2;
            const tapeClass = `${displayIdx === 0 ? "featured-post-tape " : ""}tape-c ${
              displayIdx % 2 === 0 ? "tc-pink" : "tc-yellow"
            }`;
            return (
              <PostCard
                key={post.id}
                post={post}
                tapeClass={tapeClass}
                stagger={staggerFor(displayIdx)}
              />
            );
          })}
        </div>

        <div
          className={
            "posts-index-center" +
            (hasMore ? " posts-index-center--twine-pull" : "")
          }
        >
          <div
            className={[
              "posts-index-twine-grow",
              hasMore ? pull.twineGrowCancelClassName : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={hasMore ? pull.twineGrowCancelStyle : undefined}
          >
            <div className="posts-twine--flow">
              <div className="twine-knot knot-top" />
              {hasMore ? (
                <div
                  className={[
                    "posts-twine-stripe",
                    "posts-twine-stripe--pull",
                    pull.reduced ? "posts-twine-stripe--reduced-motion" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  <div className="posts-twine-stripe__main" aria-hidden />
                  <div
                    className={pull.stripeTailClassName}
                    style={pull.stripeTailStyle}
                    aria-hidden
                    onTransitionEnd={pull.handleStrandTransitionEnd}
                  />
                </div>
              ) : (
                <div className="posts-twine-stripe" />
              )}
              {hasMore ? (
                <PullMoreCord pull={pull} remainingPosts={remainingPosts} />
              ) : null}
              {!hasMore ? <div className="twine-knot knot-bottom" /> : null}
            </div>
          </div>
        </div>

        <div className="posts-index-col posts-index-col--right">
          <div
            className="posts-rss-anchor posts-rss-anchor--grid"
            style={
              rssAnchorTop !== undefined ? { top: rssAnchorTop } : undefined
            }
          >
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
          {rightPosts.map((post, i) => {
            const displayIdx = i * 2 + 1;
            const tapeClass = `tape-c ${
              displayIdx % 2 === 0 ? "tc-pink" : "tc-yellow"
            }`;
            return (
              <PostCard
                key={post.id}
                post={post}
                tapeClass={tapeClass}
                stagger={staggerFor(displayIdx)}
              />
            );
          })}
        </div>
      </div>

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {loadMoreStatus}
      </p>
    </div>
  );
}
