import { PlayIcon, TvIcon } from "@heroicons/react/24/outline";
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
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `pegClipSteel-${rawId}`;
  const ext = externalLinkProps(item.href);

  const stopPick = (e: MouseEvent | PointerEvent) => {
    e.stopPropagation();
  };

  const label = item.caseStudyLabel ?? "Case Study";
  const year = item.caseStudyYear ?? "—";

  return (
    <div
      className={`masonite-bg ${dragVisual ? "peg-clipboard--dragging" : ""}`}
    >
      <div className="peg-clipboard__clip-row" aria-hidden>
        <span className="straight-hook" />
        <svg
          className="peg-clipboard__svg-clip"
          viewBox="0 0 120 52"
          width={112}
          height={48}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="45%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${gradId})`}
            stroke="#1e293b"
            strokeWidth={1}
            d="M12 10 h96 a6 6 0 0 1 6 6 v26 a6 6 0 0 1 -6 6 H12 a6 6 0 0 1 -6 -6 V16 a6 6 0 0 1 6 -6z"
          />
          <ellipse
            cx="60"
            cy="31"
            rx="12"
            ry="8"
            fill="#0f172a"
            opacity={0.88}
          />
        </svg>
      </div>
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
          <a href={item.href} className="peg-clipboard-title" {...ext}>
            {item.title}
          </a>
          {item.description ? (
            <p className="peg-clipboard-desc">{item.description}</p>
          ) : null}
          <a
            href={item.href}
            className="polished-btn"
            {...ext}
            onPointerDown={stopPick}
            onClick={stopPick}
          >
            View case study
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

  const isClipboard = item.hardware === "clipboard";

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

  const hwClass =
    item.hardware === "lcd"
      ? "peg-hardware-lcd"
      : item.hardware === "blueprint"
        ? "peg-hardware-blueprint"
        : "";

  const cardInner =
    item.hardware === "clipboard" ? (
      <div
        className="peg-card__inner peg-card__inner--clipboard"
        style={{ width: w, height: h, position: "relative" }}
      >
        <CaseStudyClipboard item={item} dragVisual={clipboardDragVisual} />
      </div>
    ) : (
      <div
        className={`peg-card__inner ${hwClass}`}
        style={{ width: w, height: h, position: "relative" }}
      >
        {item.hardware === "lcd" ? (
          <div className="peg-card__screen">
            <a
              href={item.href}
              className="peg-card__title"
              {...externalLinkProps(item.href)}
            >
              {item.title}
            </a>
            {item.subtitle ? (
              <p className="peg-card__subtitle">{item.subtitle}</p>
            ) : null}
            <p className="peg-card__meta">{item.dateLabel}</p>
          </div>
        ) : (
          <div className="peg-card__body">
            <a
              href={item.href}
              className="peg-card__title"
              {...externalLinkProps(item.href)}
            >
              {item.title}
            </a>
            {item.subtitle ? (
              <p className="peg-card__subtitle">{item.subtitle}</p>
            ) : null}
            <p className="peg-card__meta">{item.dateLabel}</p>
          </div>
        )}
      </div>
    );

  const rootClass = `peg-card ${isClipboard ? "peg-card--clipboard" : ""} ${
    dragDisabled ? "peg-card--static" : "peg-card--drag"
  }`;

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
      whileDrag={
        isClipboard ? { scale: 1.01, zIndex: 50 } : { scale: 1, zIndex: 40 }
      }
      onDragStart={() => {
        draggingRef.current = true;
        dragOrigin.current = { x: rawX.get(), y: rawY.get() };
        if (isClipboard) setClipboardDragVisual(true);
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
}: {
  items: PegboardCardDTO[];
  isMobile: boolean;
  vw: number;
  vh: number;
}) {
  const innerW = isMobile ? mobileInnerW(vw) : desktopInnerW(vw);
  const viewportH = isMobile
    ? mobileViewportInnerH(vh)
    : desktopViewportInnerH(vh);

  const itemsKey = useMemo(() => items.map(i => i.id).join("|"), [items]);

  const specs: CardSpec[] = useMemo(() => {
    return items.map(it => {
      const { w, h } = hardwareDims(it.hardware);
      return { id: it.id, hardware: it.hardware, w, h };
    });
  }, [itemsKey, items]);

  /** Sync layout on SSR + first paint; effects alone left `positions` {} on the server. */
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
            screenWidth={vw}
            onDragCommit={onDragCommit}
          />
        );
      })}
    </div>
  );
}

export default function WorkshopPegboard({ panels }: WorkshopPegboardProps) {
  const { vw, vh, isMobile } = useViewportPegboard();

  if (panels.length === 0) {
    return (
      <div className="workshop-pegboard-root workshop-fullbleed workshop-wall px-4 py-8">
        <p className="text-center font-body text-sm text-slate-400">
          Nothing on the pegboard yet.
        </p>
      </div>
    );
  }

  const panelNodes = panels.map((panel, i) => (
    <div
      key={`panel-${i}`}
      className={
        isMobile ? "workshop-panel--mobile" : "workshop-panel--desktop"
      }
    >
      <PegboardPanelView
        key={panel.items.map(i => i.id).join("|")}
        items={panel.items}
        isMobile={isMobile}
        vw={vw}
        vh={vh}
      />
    </div>
  ));

  const mobileBlocks: ReactNode[] = [];
  panels.forEach((_, i) => {
    if (i > 0) {
      mobileBlocks.push(
        <div key={`seam-${i}`} className="slab-seam" aria-hidden>
          <span className="heavy-screw heavy-screw--left" />
          <span className="heavy-screw heavy-screw--right" />
        </div>
      );
    }
    mobileBlocks.push(panelNodes[i]);
  });

  return (
    <div className="workshop-pegboard-root workshop-fullbleed workshop-wall not-prose">
      <div className="workshop-scroll--desktop">
        {panels.flatMap((_, i) =>
          i < panels.length - 1
            ? [
                panelNodes[i],
                <div
                  key={`bracket-${i}`}
                  className="metal-bracket"
                  aria-hidden
                />,
              ]
            : [panelNodes[i]]
        )}
      </div>
      <div className="workshop-scroll--mobile">{mobileBlocks}</div>
    </div>
  );
}
