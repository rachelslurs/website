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
const BOARD_BOTTOM_PAD_DEFAULT = 340;
const BOARD_BOTTOM_PAD_NARROW = 380;

/** Keep in sync with `.posts-index-board` `--posts-pull-cord-max` in riso.css (stable elastic slot). */
const PULL_CORD_MAX_PX = 100;
/** Match `.twine-knot { height }` in riso.css — elastic segment is at least this tall when visible. */
const TWINE_KNOT_BODY_HEIGHT_PX = 10;
const PULL_CORD_THRESHOLD_PX = 28;
const PULL_DRAG_SUPPRESS_CLICK_PX = 10;

function layoutBoardWidthPx(width: number) {
  return Math.round(Math.max(width, 320));
}

/**
 * Posts index: pull cord and twine layout (keep DOM + `riso.css` in sync).
 *
 * Grid + `hasMore`: center column = top knot + `posts-twine-stripe__main` only. Load-more sits in
 * `.posts-index-pull-below` under the masonry.
 *
 * Continuous thread (no separate `__tail` strip): `--posts-thread-stretch` (registered in CSS) drives
 * `padding-bottom` + matching negative `margin-bottom` on `__main` (background paints into padding) and
 * `translateY` on `.posts-index-pull-below__pull-shift` so knot + CTA track the visual end. Idle bounce
 * animates the variable on `.posts-index-stack--thread-idle-bounce`; drag/snap set it on the board.
 * Keep `PULL_CORD_MAX_PX` in sync with `--posts-pull-cord-max` in riso.css.
 *
 * `usePullCord` returns pointer handlers, stretch state, and `connectorClass` / `trackClass` for
 * `PullMoreCord`. `TWINE_KNOT_BODY_HEIGHT_PX` aligns with `--twine-knot-body-h`.
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

  useEffect(() => {
    if (!snapping) return;
    const id = window.setTimeout(() => {
      setSnapping(false);
      pullStretchRef.current = 0;
    }, 450);
    return () => window.clearTimeout(id);
  }, [snapping]);

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
      pullStretchRef.current = releasedAt;
      setStretchPx(releasedAt);
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

  const handleThreadSnapTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (
        e.propertyName !== "--posts-thread-stretch" &&
        !e.propertyName.includes("posts-thread-stretch")
      ) {
        return;
      }
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
    handlePullPointerDown,
    handlePullPointerMove,
    handlePullPointerUp,
    handlePullPointerCancel,
    handleLostPointerCapture,
    handleThreadSnapTransitionEnd,
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
          className="post-title m-0 font-semibold"
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
          className="post-date m-0 font-mono uppercase tracking-widest text-[var(--ink-muted)]"
          dateTime={post.dateTime}
        >
          {post.dateLabel}
        </time>
        {post.desc ? (
          <p className="post-excerpt m-0 hidden font-body leading-relaxed md:block">
            {post.desc}
          </p>
        ) : null}

        <div className="mt-auto flex w-full items-end justify-end pt-[calc(var(--posts-sp)*2)] md:justify-between md:pt-[calc(var(--posts-sp)*4)]">
          <span className="sr-only md:hidden">Tag: {post.tag}</span>
          <span className="hidden min-w-0 md:inline-block" aria-hidden="true">
            <DymoLabel
              text={post.tag}
              size="section"
              color={post.tagColor}
              isInteractive={false}
            />
          </span>
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

  const boardStyle = useMemo((): React.CSSProperties => {
    const padTrans = "padding-bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    const threadSnapTrans =
      "--posts-thread-stretch 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
    const style: React.CSSProperties = {
      paddingBottom: `${boardBottomPad}px`,
      transition: pull.snapping ? `${padTrans}, ${threadSnapTrans}` : padTrans,
    };
    if (!hasMore) return style;
    if (pull.reduced) {
      (style as Record<string, string>)["--posts-thread-stretch"] =
        "var(--twine-knot-body-h)";
      return style;
    }
    if (pull.idleDangle) return style;
    let stretchPxOut = 0;
    if (pull.stretchPx > 0 || pull.pullDragActive) {
      stretchPxOut = Math.max(pull.stretchPx, TWINE_KNOT_BODY_HEIGHT_PX);
    } else if (pull.snapping) {
      stretchPxOut = 0;
    } else {
      return style;
    }
    (style as Record<string, string>)["--posts-thread-stretch"] =
      `${stretchPxOut}px`;
    return style;
  }, [
    boardBottomPad,
    hasMore,
    pull.idleDangle,
    pull.pullDragActive,
    pull.reduced,
    pull.snapping,
    pull.stretchPx,
  ]);

  return (
    <div
      ref={boardRef}
      className={`posts-index-board not-prose${
        narrowBoard ? " posts-index-board--narrow" : ""
      }`}
      style={boardStyle}
      onTransitionEnd={hasMore ? pull.handleThreadSnapTransitionEnd : undefined}
    >
      <div
        className={[
          "posts-index-stack",
          hasMore && !pull.reduced && pull.idleDangle
            ? "posts-index-stack--thread-idle-bounce"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
            <div className="posts-index-twine-grow">
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
                    <div
                      className={[
                        "posts-twine-stripe__main",
                        "posts-twine-stripe__main--thread-cord",
                      ].join(" ")}
                      aria-hidden
                    />
                  </div>
                ) : (
                  <div className="posts-twine-stripe" />
                )}
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

        {hasMore ? (
          <div className="posts-index-pull-below">
            <div className="posts-index-pull-below__elastic">
              <div className="posts-index-pull-below__pull-shift">
                <PullMoreCord pull={pull} remainingPosts={remainingPosts} />
              </div>
            </div>
          </div>
        ) : null}
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
