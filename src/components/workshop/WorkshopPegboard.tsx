import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
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
    item.hardware === "clipboard"
      ? "peg-hardware-clipboard"
      : item.hardware === "lcd"
        ? "peg-hardware-lcd"
        : "peg-hardware-blueprint";

  const cardInner = (
    <div
      className={`peg-card__inner ${hwClass}`}
      style={{ width: w, height: h, position: "relative" }}
    >
      {item.hardware === "clipboard" ? (
        <div className="peg-card__clip-bar" aria-hidden />
      ) : null}
      {item.hardware === "lcd" ? (
        <div className="peg-card__screen">
          <a
            href={item.href}
            className="peg-card__title"
            {...(item.href.startsWith("http")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
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
            {...(item.href.startsWith("http")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
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

  if (dragDisabled) {
    return (
      <div
        className="peg-card peg-card--static"
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
      className="peg-card peg-card--drag"
      style={{
        x: rawX,
        y: rawY,
        width: w,
        height: h,
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        draggingRef.current = true;
        dragOrigin.current = { x: rawX.get(), y: rawY.get() };
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
        if (hit) {
          void Promise.all([
            animate(rawX, ox, spring),
            animate(rawY, oy, spring),
          ]).then(() => {
            draggingRef.current = false;
          });
        } else {
          void Promise.all([
            animate(rawX, prop.x, spring),
            animate(rawY, prop.y, spring),
          ]).then(() => {
            draggingRef.current = false;
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

  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const [innerH, setInnerH] = useState(() => Math.max(viewportH, PEG_GRID * 8));

  useIsoLayoutEffect(() => {
    const { positions: packed, contentHeight } = initialPackPositions(
      items.map(i => ({ id: i.id, hardware: i.hardware })),
      innerW
    );
    const ih = Math.max(viewportH, contentHeight);
    setInnerH(ih);
    setPositions(prev => {
      const nextIds = new Set(specs.map(s => s.id));
      const prevKeys = Object.keys(prev);
      const sameSet =
        prevKeys.length === nextIds.size && prevKeys.every(k => nextIds.has(k));
      if (!sameSet) {
        return resolveLayoutAfterResize(packed, specs, innerW, ih);
      }
      return resolveLayoutAfterResize(prev, specs, innerW, ih);
    });
  }, [itemsKey, innerW, viewportH, specs, items]);

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
        items={panel.items}
        isMobile={isMobile}
        vw={vw}
        vh={vh}
      />
    </div>
  ));

  const mobileBlocks: React.ReactNode[] = [];
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
