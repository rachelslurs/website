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
/** Base delay before the first card (homepage waits for nav; /posts uses 0). */
const CONTENT_ENTRANCE_DELAY_S = 0;
/** Seconds between each card’s entrance — clearer than PortfolioBoard’s 0.08s step. */
const STAGGER_STEP_S = 0.14;

const CARD_WIDTH = 360;
/** Gap (px) from twine edge to nearest card edge — keeps columns centered on the string at any board width. */
const TWINE_GAP = 45;
const HALF_TWINE = 2;
/** Match `.knot-top::before { height }` in riso.css — dangling string above the knot. */
const KNOT_TOP_TAIL_PX = 45;
const ROW_STEP_DEFAULT = 270;
const TWINE_TOP_DEFAULT = 52;
/** Pull stack nudges up so the bottom knot meets the twine (no visible gap). */
const TWINE_PULL_STACK_OVERLAP = 10;
/** Pull column height (knot + tail + margin + button) — tune if layout/CSS changes. */
const PULL_STACK_HEIGHT_PX = 168;
/** When all posts are shown: knot tail extends below the twine column end. */
const BOTTOM_KNOT_TAIL_BELOW_TWINE_PX = 52;
/** Extra vertical stripe length so the bottom knot + pull sit lower (tune visually). */
const TWINE_EXTRA_LENGTH_PX = 200;
const EDGE_PAD = 8;
/** Below this width, add more vertical rhythm (RSS ↔ cards ↔ pull). */
const NARROW_BOARD_MAX_PX = 640;
const ROW_STEP_NARROW = 300;
const TWINE_TOP_NARROW = 74;
const CARD_BASE_Y_DEFAULT = 104;
const CARD_BASE_Y_NARROW = 157;
const BOARD_BOTTOM_PAD_DEFAULT = 260;
const BOARD_BOTTOM_PAD_NARROW = 300;
/**
 * Below this width, two 360px columns + twine gap do not fit — use one centered column
 * so cards are not clipped or overlapping horizontally.
 */
const TWO_COL_MIN_PX =
  CARD_WIDTH * 2 + TWINE_GAP * 2 + HALF_TWINE * 2 + EDGE_PAD * 2 + 24;
/** Vertical stride when stacked (must exceed typical card height incl. excerpt). */
const STACK_ROW_STEP = 360;
const TWINE_TOP_STACKED = 66;
const CARD_BASE_Y_STACKED = 140;
/** Conservative card block height for board sizing (content varies). */
const EST_CARD_H_TWO_COL = 320;
const EST_CARD_H_STACKED = 350;

function cardXsForBoardWidth(width: number) {
  const w = Math.max(width, 320);
  const center = w / 2;
  let leftX = center - HALF_TWINE - TWINE_GAP - CARD_WIDTH;
  const rightXRaw = center + HALF_TWINE + TWINE_GAP;
  leftX = Math.max(EDGE_PAD, leftX);
  let rightX = rightXRaw;
  if (rightX + CARD_WIDTH > w - EDGE_PAD) {
    rightX = w - EDGE_PAD - CARD_WIDTH;
  }
  return { leftX, rightX };
}

function boardLayout(boardWidth: number) {
  const w = Math.max(boardWidth, 320);
  const stacked = w < TWO_COL_MIN_PX;
  const cardW = stacked ? Math.min(CARD_WIDTH, w - EDGE_PAD * 2) : CARD_WIDTH;
  const stackedLeftX = Math.round((w - cardW) / 2);
  const twoCol = cardXsForBoardWidth(w);
  return {
    stacked,
    cardW,
    stackedLeftX,
    leftX: twoCol.leftX,
    rightX: twoCol.rightX,
  };
}

function DraggableCard({
  targetX,
  targetY,
  w,
  zIndex,
  dragDisabled,
  stagger,
  tapeClass,
  children,
}: {
  targetX: number;
  targetY: number;
  w: number;
  zIndex: number;
  dragDisabled: boolean;
  stagger: number;
  tapeClass: string;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const [dragRot, setDragRot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const entranceVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 30,
        rotate: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
      visible: (staggerIndex: number) => ({
        opacity: 1,
        y: 0,
        rotate: 0,
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

  const currentRot = dragRot !== null ? dragRot : 0;
  const scale = isDragging ? 1.04 : isHovered && !dragDisabled ? 1.015 : 1;
  const shadowClass = isDragging
    ? "is-dragging"
    : isHovered && !dragDisabled
      ? "is-hovered"
      : "";

  useEffect(() => {
    if (!isDragging) {
      setPos({ x: targetX, y: targetY });
    }
  }, [targetX, targetY, isDragging]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (dragDisabled) return;
    if (
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    e.preventDefault();
    setIsDragging(true);
    setDragRot(0);
    dragRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragRot(0);
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
      className="pin"
      style={{
        position: "absolute",
        left: Math.round(pos.x),
        top: Math.round(pos.y),
        width: w,
        zIndex: isDragging ? 9999 : zIndex,
        transform: `translate(0, 0) rotate(${currentRot}deg) scale(${scale})`,
        pointerEvents: "auto",
        cursor: dragDisabled ? "default" : isDragging ? "grabbing" : "grab",
        transition: isDragging
          ? "none"
          : "left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        touchAction: dragDisabled ? "auto" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
    >
      <motion.div
        className={`board-card relative flex h-full min-h-0 min-w-0 flex-col select-none ${tapeClass} ${shadowClass}`}
        variants={entranceVariants}
        custom={stagger}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
      >
        {children}
      </motion.div>
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(1200);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsTouchDevice(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0]?.contentRect.width;
      if (cr) setBoardWidth(cr);
    });
    ro.observe(el);
    setBoardWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => boardLayout(boardWidth), [boardWidth]);

  const narrowBoard = boardWidth < NARROW_BOARD_MAX_PX;
  const stacked = layout.stacked;
  const twineTop = stacked
    ? TWINE_TOP_STACKED
    : narrowBoard
      ? TWINE_TOP_NARROW
      : TWINE_TOP_DEFAULT;
  const rowStep = stacked
    ? STACK_ROW_STEP
    : narrowBoard
      ? ROW_STEP_NARROW
      : ROW_STEP_DEFAULT;
  const cardBaseY = stacked
    ? CARD_BASE_Y_STACKED
    : narrowBoard
      ? CARD_BASE_Y_NARROW
      : CARD_BASE_Y_DEFAULT;
  const boardBottomPad = narrowBoard
    ? BOARD_BOTTOM_PAD_NARROW
    : BOARD_BOTTOM_PAD_DEFAULT;

  const dragDisabled = isTouchDevice;

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

  const nPosts = displayedPosts.length;
  const estCardH = stacked ? EST_CARD_H_STACKED : EST_CARD_H_TWO_COL;
  /** Same as (top of first card − twine start): gap under top knot area to first card top. */
  const topGap = cardBaseY - twineTop;
  /**
   * Twine length from topGap / last-card math, plus TWINE_EXTRA_LENGTH_PX so the pull + knot
   * sit lower. Uses estCardH as stand-in for last card height.
   */
  const stringHeight =
    nPosts === 0
      ? 260
      : hasMore
        ? Math.max(
            120,
            2 * topGap +
              (nPosts - 1) * rowStep +
              estCardH +
              TWINE_PULL_STACK_OVERLAP -
              PULL_STACK_HEIGHT_PX +
              TWINE_EXTRA_LENGTH_PX
          )
        : Math.max(
            120,
            2 * topGap +
              (nPosts - 1) * rowStep +
              estCardH -
              BOTTOM_KNOT_TAIL_BELOW_TWINE_PX +
              TWINE_EXTRA_LENGTH_PX
          );
  const stackBottomY =
    nPosts === 0 ? twineTop : cardBaseY + (nPosts - 1) * rowStep + estCardH;
  const boardHeight = Math.max(
    800,
    twineTop + stringHeight + boardBottomPad,
    stackBottomY + boardBottomPad
  );

  /** Tag top lines up with the top of the knot tail (`knot-top::before`), before the knot blob. */
  const rssAnchorTop = twineTop - KNOT_TOP_TAIL_PX;

  return (
    <div
      ref={boardRef}
      className={`posts-index-board not-prose${stacked ? " posts-index-board--stacked" : ""}`}
      style={{
        height: `${boardHeight}px`,
        transition: "height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className="posts-rss-anchor"
        style={{
          top: rssAnchorTop,
          /* Right edge of RSS tag aligns with right edge of the card column. */
          left: stacked
            ? layout.stackedLeftX + layout.cardW
            : layout.rightX + CARD_WIDTH,
          transform: "translateX(-100%)",
        }}
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

      <div
        className="posts-twine"
        style={{
          top: twineTop,
          height: `${stringHeight}px`,
        }}
      >
        <div className="twine-knot knot-top" />
        {!hasMore && <div className="twine-knot knot-bottom" />}
      </div>

      {hasMore && (
        <div
          className={`pull-container ${prefersReducedMotion ? "pull-container--no-motion" : ""}`}
          style={{
            top: `${twineTop + stringHeight - TWINE_PULL_STACK_OVERLAP}px`,
          }}
        >
          <div className="twine-knot knot-bottom" aria-hidden="true" />
          <button
            type="button"
            className="pull-action"
            onClick={handleLoadMore}
            aria-label={`Load more posts. ${remainingPosts} remaining.`}
          >
            <span className="pull-tag-text" aria-hidden="true">
              PULL FOR MORE
            </span>
          </button>
        </div>
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

        const targetX = stacked
          ? layout.stackedLeftX
          : isLeft
            ? layout.leftX
            : layout.rightX;
        const targetY = cardBaseY + displayIdx * rowStep;
        /* Corner washi (tape-c): same centered diagonal strips as homepage Writing cards. */
        const tapeClass = `${displayIdx === 0 ? "featured-post-tape " : ""}tape-c ${
          displayIdx % 2 === 0 ? "tc-pink" : "tc-yellow"
        }`;

        const stackZ = 14 - displayIdx;
        const stagger = displayIdx;

        return (
          <DraggableCard
            key={post.id}
            targetX={targetX}
            targetY={targetY}
            w={layout.cardW}
            zIndex={stackZ}
            dragDisabled={dragDisabled}
            stagger={stagger}
            tapeClass={tapeClass}
          >
            <article className="card flex flex-col">
              <h2
                className="post-title m-0 mb-1 font-semibold"
                style={{ viewTransitionName: post.slug }}
              >
                <a
                  href={post.href}
                  className="hover:text-[var(--red)] transition-colors focus-visible:outline-none"
                >
                  {post.title}
                </a>
              </h2>
              <time
                className="post-date mb-3 font-mono text-xs uppercase tracking-widest text-[var(--ink-muted)]"
                dateTime={post.dateTime}
              >
                {post.dateLabel}
              </time>
              {post.desc ? (
                <p className="post-excerpt m-0 font-body leading-relaxed">
                  {post.desc}
                </p>
              ) : null}

              <div className="mt-auto flex items-end justify-between pt-4">
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
            </article>
          </DraggableCard>
        );
      })}
    </div>
  );
}
