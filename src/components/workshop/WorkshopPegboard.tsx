import DymoLabel from "@components/riso/DymoLabel";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PlayIcon,
  TvIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import type {
  PegboardCardDTO,
  PegboardPanelDTO,
} from "@utils/serializeWorkshopPegboard";
import {
  desktopPegboardSideGap,
  hardwareDims,
  hasPlacementCollision,
  initialPackPositions,
  PEG_GRID,
  proposedDragPosition,
  resolveLayoutAfterResize,
  snapToGrid,
} from "@utils/workshopPegboardPhysics";

import "../../styles/workshop-pegboard.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

export interface WorkshopPegboardProps {
  panels: PegboardPanelDTO[];
}

type CardSpec = {
  id: string;
  hardware: PegboardCardDTO["hardware"];
  w: number;
  h: number;
};

function stopDragChain(e: MouseEvent | PointerEvent) {
  e.stopPropagation();
}

function useViewportPegboard() {
  const [vw, setVw] = useState(1024);
  const [vh, setVh] = useState(768);
  const [isMobile, setIsMobile] = useState(false);

  useIsoLayoutEffect(() => {
    function read() {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    }
    read();
    window.addEventListener("resize", read);
    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", read);
    return () => {
      window.removeEventListener("resize", read);
      mq.removeEventListener("change", read);
    };
  }, []);

  return { vw, vh, isMobile };
}

function desktopInnerW(vw: number): number {
  const maxInnerW = vw - 96;
  return Math.floor(maxInnerW / PEG_GRID) * PEG_GRID;
}

function desktopViewportInnerH(vh: number): number {
  return Math.floor((vh - 96) / PEG_GRID) * PEG_GRID;
}

function mobileInnerW(vw: number): number {
  const panelOuter = Math.min(420, vw);
  const maxInner = panelOuter - 48;
  return Math.max(PEG_GRID * 4, Math.floor(maxInner / PEG_GRID) * PEG_GRID);
}

function mobileViewportInnerH(vh: number): number {
  return Math.floor((vh - 80) / PEG_GRID) * PEG_GRID;
}

function externalLinkProps(href: string) {
  if (href.startsWith("http")) {
    return { target: "_blank" as const, rel: "noreferrer" as const };
  }
  return {};
}

function CaseStudyClipboard({
  item,
  dragVisual,
}: {
  item: PegboardCardDTO;
  dragVisual: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const metalId = `clipMetal-${uid}`;
  const darkId = `clipDark-${uid}`;
  const ext = externalLinkProps(item.href);

  const label = item.caseStudyLabel ?? "Case Study";
  const year = item.caseStudyYear ?? "—";

  return (
    <div
      className={`masonite-bg ${dragVisual ? "peg-clipboard--dragging" : ""}`}
    >
      <svg
        width={240}
        height={100}
        viewBox="0 0 240 100"
        fill="none"
        className="peg-clipboard-spec-svg"
        style={{ filter: "drop-shadow(3px 5px 4px rgba(0,0,0,0.3))" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="15%" stopColor="#cbd5e1" />
            <stop offset="35%" stopColor="#64748b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id={darkId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect
          x="70"
          y="50"
          width="100"
          height="16"
          rx="4"
          fill={`url(#${darkId})`}
        />
        <path
          d="M 120 8 C 138 8, 145 18, 148 30 C 152 48, 160 52, 175 52 C 192 52, 196 60, 196 75 C 196 88, 192 94, 185 94 L 55 94 C 48 94, 44 88, 44 75 C 44 60, 48 52, 65 52 C 80 52, 88 48, 92 30 C 95 18, 102 8, 120 8 Z M 120 22 A 8 8 0 1 0 120 38 A 8 8 0 1 0 120 22"
          fill={`url(#${metalId})`}
          fillRule="evenodd"
        />
        <circle
          cx="120"
          cy="30"
          r="14"
          fill="none"
          stroke={`url(#${metalId})`}
          strokeWidth="4"
        />
        <circle
          cx="120"
          cy="30"
          r="16"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>
      <div className="peg-clipboard__papers">
        <div className="peg-clipboard__paper-back" aria-hidden />
        <div className="peg-clipboard__paper-front">
          <div className="peg-clipboard-wireframe" aria-hidden>
            <div className="peg-clipboard-wireframe__chrome">
              <TvIcon className="peg-clipboard-wireframe__icon" />
              <PlayIcon className="peg-clipboard-wireframe__play" />
            </div>
            <div className="peg-clipboard-wireframe__bar peg-clipboard-wireframe__bar--blue" />
            <div className="peg-clipboard-wireframe__row">
              <span className="peg-clipboard-wireframe__block peg-clipboard-wireframe__block--orange" />
              <span className="peg-clipboard-wireframe__block peg-clipboard-wireframe__block--blue" />
            </div>
          </div>
          <div className="peg-clipboard-meta-pill">
            <span className="peg-clipboard-meta-pill__dot" />
            <span>
              {label} / {year}
            </span>
          </div>
          <a
            href={item.href}
            className="peg-clipboard-title"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            {item.title}
          </a>
          {item.description ? (
            <p className="peg-clipboard-desc">{item.description}</p>
          ) : null}
          <a
            href={item.href}
            className="polished-btn"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            View case study
          </a>
        </div>
      </div>
    </div>
  );
}

function LinkLcdCard({ item }: { item: PegboardCardDTO }) {
  const ext = externalLinkProps(item.href);
  const chipLabel = (item.subtitle ?? "").trim() || "Link";
  const gifSrc = item.gifLink;
  const [gifPlaying, setGifPlaying] = useState(false);

  useEffect(() => {
    if (!gifSrc || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setGifPlaying(!mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [gifSrc]);

  const openVideoUrl = () => {
    if (typeof window === "undefined") return;
    window.open(item.href, ext.target ?? "_blank", "noopener,noreferrer");
  };

  const handlePlay = (e: MouseEvent<HTMLButtonElement>) => {
    stopDragChain(e);
    if (gifSrc) {
      setGifPlaying(true);
    } else {
      openVideoUrl();
    }
  };

  return (
    <div className="lcd-hardware">
      <div className="lcd-hardware__tilt">
        <div className="lcd-shadow-base" aria-hidden />
        <div className="lcd-pcb">
          <div className="lcd-pcb__substrate" aria-hidden>
            <div className="lcd-pcb__pin-strip">
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} className="lcd-pcb__pin" />
              ))}
            </div>
          </div>
          <div className="lcd-slate">
            <div className="lcd-slate__chrome">
              <div className="lcd-slate__top">
                <span className="lcd-chip-label">{chipLabel}</span>
                <a
                  href={item.href}
                  className="lcd-see-external focus-outline"
                  {...ext}
                  onPointerDown={stopDragChain}
                  onClick={stopDragChain}
                >
                  <span>See video</span>
                  <ArrowTopRightOnSquareIcon
                    className="lcd-see-external__icon"
                    aria-hidden
                  />
                </a>
              </div>
              <div className="lcd-screen-stage">
                {!(gifPlaying && gifSrc) ? (
                  <span className="lcd-screen-stage__scanlines" aria-hidden />
                ) : null}
                {gifPlaying && gifSrc ? (
                  <img
                    src={gifSrc}
                    alt=""
                    className="lcd-screen-gif"
                    loading="eager"
                    decoding="async"
                  />
                ) : null}
                {!gifPlaying ? (
                  <button
                    type="button"
                    className="lcd-play-trigger focus-outline"
                    aria-label={
                      gifSrc
                        ? `Play animated preview for ${item.title}`
                        : `Open video for ${item.title}`
                    }
                    onClick={handlePlay}
                    onPointerDown={stopDragChain}
                  >
                    <PlayIcon className="lcd-play-trigger__icon" aria-hidden />
                    <span className="lcd-play-trigger__label">Play</span>
                  </button>
                ) : null}
              </div>
              <div className="lcd-headline">
                <span className="lcd-headline__text">{item.title}</span>
              </div>
              <p className="lcd-date-line">{item.dateLabel}</p>
            </div>
          </div>
        </div>
      </div>
      <span className="lcd-mount-hook lcd-mount-hook--l" aria-hidden />
      <span className="lcd-mount-hook lcd-mount-hook--r" aria-hidden />
    </div>
  );
}

function DemoBlueprintCard({
  item,
  dragVisual,
}: {
  item: PegboardCardDTO;
  dragVisual: boolean;
}) {
  const ext = externalLinkProps(item.href);
  const accent = item.subtitleColor ?? "var(--blue)";

  return (
    <div
      className={`blueprint-card ${dragVisual ? "blueprint-card--dragging" : ""}`}
    >
      <div className="blueprint-bg blueprint-mask">
        <span className="blueprint-hook blueprint-hook--tl" aria-hidden />
        <span className="blueprint-hook blueprint-hook--tr" aria-hidden />
        <div className="blueprint-body">
          <div className="blueprint-icon-recess" aria-hidden>
            <WrenchScrewdriverIcon />
          </div>
          <a
            href={item.href}
            className="blueprint-title"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            {item.title}
          </a>
          {item.subtitle ? (
            <p className="blueprint-subtitle" style={{ color: accent }}>
              {item.subtitle}
            </p>
          ) : null}
          {item.description ? (
            <p className="blueprint-desc">{item.description}</p>
          ) : null}
          <a
            href={item.href}
            className="mech-switch"
            {...ext}
            onPointerDown={stopDragChain}
            onClick={stopDragChain}
          >
            Open demo
          </a>
        </div>
      </div>
    </div>
  );
}

function PegCard({
  item,
  x,
  y,
  w,
  h,
  innerW,
  innerH,
  specs,
  positions,
  dragDisabled,
  screenWidth,
  onDragCommit,
}: {
  item: PegboardCardDTO;
  x: number;
  y: number;
  w: number;
  h: number;
  innerW: number;
  innerH: number;
  specs: CardSpec[];
  positions: Record<string, { x: number; y: number }>;
  dragDisabled: boolean;
  screenWidth: number;
  onDragCommit: (id: string, nx: number, ny: number) => void;
}) {
  const rawX = useMotionValue(x);
  const rawY = useMotionValue(y);
  const snapOffsetX = useTransform(rawX, v => snapToGrid(v) - v);
  const snapOffsetY = useTransform(rawY, v => snapToGrid(v) - v);
  const draggingRef = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const [clipboardDragVisual, setClipboardDragVisual] = useState(false);
  const [blueprintDragVisual, setBlueprintDragVisual] = useState(false);

  const isClipboard = item.hardware === "clipboard";
  const isLcd = item.hardware === "lcd";
  const isBlueprint = item.hardware === "blueprint";

  useEffect(() => {
    if (!draggingRef.current) {
      rawX.set(x);
      rawY.set(y);
    }
  }, [x, y, rawX, rawY]);

  const spec: CardSpec = useMemo(
    () => ({ id: item.id, hardware: item.hardware, w, h }),
    [item.id, item.hardware, w, h]
  );

  const padding = 32;
  const scaleFactor =
    dragDisabled && screenWidth < w + padding ? (screenWidth - padding) / w : 1;

  const whileDrag = isClipboard
    ? { scale: 1.01, zIndex: 50 }
    : isLcd
      ? { scale: 1.05, zIndex: 45 }
      : isBlueprint
        ? { scale: 1.02, zIndex: 50 }
        : { scale: 1, zIndex: 40 };

  const cardInner =
    item.hardware === "clipboard" ? (
      <div
        className="peg-card__inner peg-card__inner--clipboard"
        style={{ width: w, height: h, position: "relative" }}
      >
        <CaseStudyClipboard item={item} dragVisual={clipboardDragVisual} />
      </div>
    ) : item.hardware === "lcd" ? (
      <div
        className="peg-card__inner peg-card__inner--lcd"
        style={{ width: w, height: h, position: "relative" }}
      >
        <LinkLcdCard item={item} />
      </div>
    ) : (
      <div
        className="peg-card__inner peg-card__inner--blueprint"
        style={{ width: w, height: h, position: "relative" }}
      >
        <DemoBlueprintCard item={item} dragVisual={blueprintDragVisual} />
      </div>
    );

  const rootClass = [
    "peg-card",
    dragDisabled ? "peg-card--static" : "peg-card--drag",
    isClipboard && "peg-card--clipboard",
    isLcd && "peg-card--lcd",
    isBlueprint && "peg-card--blueprint",
  ]
    .filter(Boolean)
    .join(" ");

  if (dragDisabled) {
    return (
      <div
        className={rootClass}
        style={{
          width: w,
          height: h,
          transform: `translate(${x}px, ${y}px) scale(${scaleFactor})`,
          transformOrigin: "top center",
          marginBottom: `${-h * (1 - scaleFactor)}px`,
        }}
      >
        {cardInner}
      </div>
    );
  }

  return (
    <motion.div
      className={rootClass}
      style={{
        x: rawX,
        y: rawY,
        width: w,
        height: h,
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={whileDrag}
      onDragStart={() => {
        draggingRef.current = true;
        dragOrigin.current = { x: rawX.get(), y: rawY.get() };
        if (isClipboard) setClipboardDragVisual(true);
        if (isBlueprint) setBlueprintDragVisual(true);
      }}
      onDragEnd={(_e, info) => {
        const ox = dragOrigin.current.x;
        const oy = dragOrigin.current.y;
        const prop = proposedDragPosition(
          ox,
          oy,
          info.offset.x,
          info.offset.y,
          w,
          h,
          innerW,
          innerH
        );
        const hit = hasPlacementCollision(
          item.id,
          prop.x,
          prop.y,
          spec,
          specs,
          positions,
          innerW,
          innerH
        );
        const finishDrag = () => {
          draggingRef.current = false;
          if (isClipboard) setClipboardDragVisual(false);
          if (isBlueprint) setBlueprintDragVisual(false);
        };
        if (hit) {
          void Promise.all([
            animate(rawX, ox, spring),
            animate(rawY, oy, spring),
          ]).then(finishDrag);
        } else {
          void Promise.all([
            animate(rawX, prop.x, spring),
            animate(rawY, prop.y, spring),
          ]).then(() => {
            finishDrag();
            onDragCommit(item.id, prop.x, prop.y);
          });
        }
      }}
    >
      <motion.div
        style={{
          x: snapOffsetX,
          y: snapOffsetY,
          width: w,
          height: h,
        }}
        className="touch-none"
      >
        {cardInner}
      </motion.div>
    </motion.div>
  );
}

function PegboardPanelView({
  items,
  isMobile,
  vw,
  vh,
  layoutWidth,
  layoutHeight,
}: {
  items: PegboardCardDTO[];
  isMobile: boolean;
  vw: number;
  vh: number;
  /** When set (e.g. from portal-inner ResizeObserver), drives grid size instead of window. */
  layoutWidth?: number;
  layoutHeight?: number;
}) {
  const w = layoutWidth ?? vw;
  const h = layoutHeight ?? vh;
  const innerW = isMobile ? mobileInnerW(w) : desktopInnerW(w);
  const viewportH = isMobile
    ? mobileViewportInnerH(h)
    : desktopViewportInnerH(h);

  const itemsKey = useMemo(() => items.map(i => i.id).join("|"), [items]);

  const specs: CardSpec[] = useMemo(() => {
    return items.map(it => {
      const { w, h } = hardwareDims(it.hardware);
      return { id: it.id, hardware: it.hardware, w, h };
    });
  }, [itemsKey, items]);

  const packedLayout = useMemo(() => {
    const { positions: packed, contentHeight } = initialPackPositions(
      items.map(i => ({ id: i.id, hardware: i.hardware })),
      innerW
    );
    const ih = Math.max(viewportH, contentHeight);
    return {
      innerH: ih,
      positions: resolveLayoutAfterResize(packed, specs, innerW, ih),
    };
  }, [itemsKey, innerW, viewportH, specs, items]);

  const [positions, setPositions] = useState(packedLayout.positions);
  const innerH = packedLayout.innerH;

  useEffect(() => {
    setPositions(prev => {
      const nextIds = new Set(specs.map(s => s.id));
      const prevKeys = Object.keys(prev);
      const sameSet =
        prevKeys.length === nextIds.size && prevKeys.every(k => nextIds.has(k));
      if (!sameSet) {
        return packedLayout.positions;
      }
      return resolveLayoutAfterResize(prev, specs, innerW, packedLayout.innerH);
    });
  }, [packedLayout, itemsKey, innerW, viewportH, specs, items]);

  const onDragCommit = useCallback((id: string, nx: number, ny: number) => {
    setPositions(p => ({ ...p, [id]: { x: nx, y: ny } }));
  }, []);

  return (
    <div className="pegboard-bg" style={{ width: innerW, height: innerH }}>
      <span className="heavy-screw heavy-screw--tl" aria-hidden />
      <span className="heavy-screw heavy-screw--tr" aria-hidden />
      <span className="heavy-screw heavy-screw--bl" aria-hidden />
      <span className="heavy-screw heavy-screw--br" aria-hidden />
      {items.map(it => {
        const { w, h } = hardwareDims(it.hardware);
        const pos = positions[it.id];
        if (!pos) return null;
        return (
          <PegCard
            key={it.id}
            item={it}
            x={pos.x}
            y={pos.y}
            w={w}
            h={h}
            innerW={innerW}
            innerH={innerH}
            specs={specs}
            positions={positions}
            dragDisabled={isMobile}
            screenWidth={w}
            onDragCommit={onDragCommit}
          />
        );
      })}
    </div>
  );
}

export default function WorkshopPegboard({ panels }: WorkshopPegboardProps) {
  const { vw, vh, isMobile } = useViewportPegboard();
  const portalInnerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [layoutSize, setLayoutSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  /** Mobile column: panel index at ends, or -1 when mid-scroll (reference: both nav buttons stay enabled). */
  const [mobilePanelIdx, setMobilePanelIdx] = useState(0);

  const layoutW = layoutSize?.w ?? vw;
  const layoutH = layoutSize?.h ?? vh;

  const desktopInner = useMemo(() => desktopInnerW(layoutW), [layoutW]);
  const sideGap = useMemo(
    () => desktopPegboardSideGap(layoutW, desktopInner),
    [layoutW, desktopInner]
  );

  useIsoLayoutEffect(() => {
    const el = portalInnerRef.current;
    if (!el) return;
    const apply = (width: number, height: number) => {
      setLayoutSize({ w: width, h: height });
    };
    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        apply(width, height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [panels.length]);

  const syncScrollIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / pageW);
    setActivePanelIndex(
      Math.min(Math.max(0, idx), Math.max(0, panels.length - 1))
    );
  }, [panels.length]);

  const syncMobileScrollIndex = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 10;
    const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10;
    const n = panels.length;
    if (atTop && atBottom) {
      setMobilePanelIdx(-1);
    } else if (atTop) {
      setMobilePanelIdx(0);
    } else if (atBottom) {
      setMobilePanelIdx(Math.max(0, n - 1));
    } else {
      setMobilePanelIdx(-1);
    }
  }, [panels.length]);

  useEffect(() => {
    syncScrollIndex();
  }, [syncScrollIndex, panels.length, layoutW]);

  useEffect(() => {
    if (!isMobile) return;
    syncMobileScrollIndex();
  }, [isMobile, panels.length, syncMobileScrollIndex]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth;
    el.scrollBy({ left: -pageW, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.clientWidth;
    el.scrollBy({ left: pageW, behavior: "smooth" });
  }, []);

  const scrollMobilePrev = useCallback(() => {
    const delta =
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
    mobileScrollRef.current?.scrollBy({
      top: -delta,
      behavior: "smooth",
    });
  }, []);

  const scrollMobileNext = useCallback(() => {
    const delta =
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
    mobileScrollRef.current?.scrollBy({
      top: delta,
      behavior: "smooth",
    });
  }, []);

  if (panels.length === 0) {
    return (
      <div className="workshop-pegboard-root workshop-wall not-prose w-full min-w-0">
        <div className="portal-frame">
          <div className="portal-inner flex min-h-[12rem] items-center justify-center">
            <p className="font-body text-sm text-slate-400">
              Nothing on the pegboard yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mobileBlocks: ReactNode[] = [];
  panels.forEach((panel, i) => {
    if (i > 0) {
      mobileBlocks.push(
        <div key={`seam-${i}`} className="slab-seam" aria-hidden>
          <span className="heavy-screw heavy-screw--left" />
          <span className="heavy-screw heavy-screw--right" />
        </div>
      );
    }
    const slabClass = [
      "workshop-panel--mobile",
      "workshop-panel--mobile-slab",
      i === 0 ? "workshop-panel--mobile-slab--first" : "",
      i === panels.length - 1 ? "workshop-panel--mobile-slab--last" : "",
    ]
      .filter(Boolean)
      .join(" ");
    mobileBlocks.push(
      <div key={`panel-${i}`} className={slabClass}>
        <PegboardPanelView
          key={panel.items.map(x => x.id).join("|")}
          items={panel.items}
          isMobile
          vw={vw}
          vh={vh}
          layoutWidth={layoutW}
          layoutHeight={layoutH}
        />
      </div>
    );
  });

  const atFirst = activePanelIndex <= 0;
  const atLast = activePanelIndex >= panels.length - 1;
  const navDisabledPrev = isMobile ? mobilePanelIdx === 0 : atFirst;
  const navDisabledNext = isMobile
    ? mobilePanelIdx === panels.length - 1
    : atLast;

  return (
    <div className="workshop-pegboard-root workshop-wall not-prose w-full min-w-0">
      <div className="portal-frame">
        <div ref={portalInnerRef} className="portal-inner">
          <div className="shadowbox-portal" aria-hidden />
          {!isMobile ? (
            <div
              ref={scrollRef}
              onScroll={syncScrollIndex}
              className="workshop-scroll--desktop-strip hide-scrollbar"
            >
              {panels.map((panel, i) => (
                <div key={`panel-${i}`} className="workshop-panel--desktop">
                  <PegboardPanelView
                    key={panel.items.map(x => x.id).join("|")}
                    items={panel.items}
                    isMobile={false}
                    vw={vw}
                    vh={vh}
                    layoutWidth={layoutW}
                    layoutHeight={layoutH}
                  />
                  {i < panels.length - 1 ? (
                    <>
                      <div
                        aria-hidden
                        className="metal-bracket--band"
                        style={{
                          width: sideGap + 80,
                          right: -(sideGap + 40),
                          top: 98,
                          transform: "translateY(-50%)",
                        }}
                      />
                      <div
                        aria-hidden
                        className="metal-bracket--band"
                        style={{
                          width: sideGap + 80,
                          right: -(sideGap + 40),
                          bottom: 98,
                          transform: "translateY(50%)",
                        }}
                      />
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={mobileScrollRef}
              onScroll={syncMobileScrollIndex}
              className="workshop-scroll--mobile hide-scrollbar"
            >
              {mobileBlocks}
            </div>
          )}
        </div>

        <div
          className={
            panels.length === 1
              ? "portal-bezel portal-bezel--solo"
              : "portal-bezel"
          }
        >
          <DymoLabel text="WORKSHOP" size="large" isInteractive={false} />
          {panels.length > 1 ? (
            <nav className="workshop-panel-nav" aria-label="Workshop panels">
              <button
                type="button"
                className="workshop-panel-nav__btn focus-outline"
                disabled={navDisabledPrev}
                aria-label={isMobile ? "Scroll up" : "Previous panel"}
                onClick={isMobile ? scrollMobilePrev : scrollPrev}
              >
                {isMobile ? (
                  <ChevronUpIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden />
                )}
              </button>
              <button
                type="button"
                className="workshop-panel-nav__btn focus-outline"
                disabled={navDisabledNext}
                aria-label={isMobile ? "Scroll down" : "Next panel"}
                onClick={isMobile ? scrollMobileNext : scrollNext}
              >
                {isMobile ? (
                  <ChevronDownIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" aria-hidden />
                )}
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
