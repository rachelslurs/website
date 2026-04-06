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
import { slugifyStr } from "@utils/slugify";
import { seededOffset } from "@utils/seededOffset";

/** Base delay before the first card (homepage waits for nav; /posts uses 0). */
const CONTENT_ENTRANCE_DELAY_S = 0;
/** Seconds between each card’s entrance — clearer than PortfolioBoard’s 0.08s step. */
const STAGGER_STEP_S = 0.14;

const CARD_WIDTH = 360;
/** Gap (px) from twine edge to nearest card edge — keeps columns centered on the string at any board width. */
const TWINE_GAP = 45;
const HALF_TWINE = 2;
const ROW_STEP = 190;
const TWINE_TOP = 72;
/** Pull stack nudges up so the bottom knot meets the twine (no visible gap). */
const TWINE_PULL_STACK_OVERLAP = 10;
const CARD_BASE_Y = 120;
const EDGE_PAD = 8;

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
  const hideX = Math.max(EDGE_PAD, center - CARD_WIDTH / 2);
  return { leftX, rightX, hideX };
}

function DraggableCard({
  targetX,
  targetY,
  w,
  zIndex,
  isVisible,
  dragDisabled,
  stagger,
  animationIndex,
  tapeClass,
  children,
}: {
  targetX: number;
  targetY: number;
  w: number;
  zIndex: number;
  isVisible: boolean;
  dragDisabled: boolean;
  stagger: number;
  animationIndex: number;
  tapeClass: string;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const restRot = useMemo(
    () => seededOffset(animationIndex * 17, 2.5),
    [animationIndex]
  );
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const [dragRot, setDragRot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const entranceVariants = useMemo(() => {
    const hiddenRotate = restRot + seededOffset(animationIndex * 31, 6);
    return {
      hidden: {
        opacity: 0,
        y: 30,
        rotate: hiddenRotate,
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
    };
  }, [restRot, animationIndex]);

  const currentRot = dragRot !== null ? dragRot : restRot;
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
      (e.target as HTMLElement).closest("button") ||
      !isVisible
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
    setDragRot(seededOffset(Date.now(), 3));
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
        pointerEvents: !isVisible ? "none" : "auto",
        cursor: dragDisabled ? "default" : isDragging ? "grabbing" : "grab",
        transition: isDragging
          ? "none"
          : "left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        touchAction: dragDisabled ? "auto" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
    >
      <motion.div
        className={`board-card relative flex h-full min-h-0 min-w-0 flex-col select-none card-looseleaf ${tapeClass} ${shadowClass}`}
        variants={entranceVariants}
        custom={stagger}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate={isVisible ? "visible" : "hidden"}
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

  const { leftX, rightX, hideX } = useMemo(
    () => cardXsForBoardWidth(boardWidth),
    [boardWidth]
  );

  const dragDisabled = isTouchDevice;

  const displayedPosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount]
  );
  const displayOrder = useMemo(
    () => displayedPosts.map(p => p.id),
    [displayedPosts]
  );
  const hasMore = visibleCount < posts.length;
  const remainingPosts = posts.length - visibleCount;

  const handleLoadMore = useCallback(() => {
    const batch = Math.min(pageSize, remainingPosts);
    setVisibleCount(v => v + pageSize);
    const noun = batch === 1 ? "post" : "posts";
    setLoadMoreStatus(`${batch} more ${noun} loaded.`);
  }, [pageSize, remainingPosts]);

  const stringHeight = Math.max(300, displayOrder.length * ROW_STEP + 100);
  const boardHeight = Math.max(800, TWINE_TOP + stringHeight + 260);

  return (
    <div
      ref={boardRef}
      className="posts-index-board not-prose"
      style={{
        height: `${boardHeight}px`,
        transition: "height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className="posts-twine"
        style={{
          top: TWINE_TOP,
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
            top: `${TWINE_TOP + stringHeight - TWINE_PULL_STACK_OVERLAP}px`,
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

      {posts.map((post, postIndex) => {
        const filteredIdx = displayOrder.indexOf(post.id);
        const isVisible = filteredIdx !== -1;
        const colIndex = filteredIdx >= 0 ? filteredIdx : postIndex;
        const isLeft = colIndex % 2 === 0;

        const targetX = isVisible ? (isLeft ? leftX : rightX) : hideX;
        const targetY = isVisible ? CARD_BASE_Y + filteredIdx * ROW_STEP : 1800;
        const tapeClass = isLeft
          ? "tape-right-edge tp-pink"
          : "tape-left-edge tp-yellow";

        const titleVt = slugifyStr(post.title);
        const stackZ = filteredIdx === -1 ? 0 : 14 - filteredIdx;
        const stagger = filteredIdx >= 0 ? filteredIdx : 0;

        return (
          <DraggableCard
            key={post.id}
            targetX={targetX}
            targetY={targetY}
            w={CARD_WIDTH}
            zIndex={stackZ}
            isVisible={isVisible}
            dragDisabled={dragDisabled}
            stagger={stagger}
            animationIndex={postIndex}
            tapeClass={tapeClass}
          >
            <div className="hole-punch hole-1" />
            <div className="hole-punch hole-2" />
            <div className="hole-punch hole-3" />

            <time className="pd" dateTime={post.dateTime}>
              {post.dateLabel}
            </time>
            <h2 className="pt m-0">{post.title}</h2>
            {post.desc ? <p className="pe m-0">{post.desc}</p> : null}

            <div className="posts-card-footer">
              <DymoLabel
                text={post.tag}
                size="section"
                color={post.tagColor}
                isInteractive={false}
              />
              <a
                href={post.href}
                className="card-link"
                style={{ viewTransitionName: titleVt }}
              >
                <span aria-hidden="true">&rarr;</span> Read
                <span className="sr-only">: {post.title}</span>
              </a>
            </div>
          </DraggableCard>
        );
      })}
    </div>
  );
}
