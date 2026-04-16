import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import {
  hardwareDimsWithGrid,
  initialPackPositions,
  initialPackPositionsWithGrid,
  PEG_GRID,
  resolveLayoutAfterResize,
  resolveLayoutAfterResizeWithGrid,
} from "@utils/workshopPegboardPhysics";
import {
  desktopInnerW,
  desktopPortalInnerH,
  mobileInnerW,
  PEGBOARD_BORDER_OUTSET,
} from "./pegboardDimensions";
import type {
  MobileScalePresentation,
  PegboardCardSpec,
} from "./pegboardTypes";
import PegCard from "./PegCard";

/** Minimum cork content height (grid rows) when the stack is nearly empty. */
const MOBILE_PEGBOARD_MIN_GRID_ROWS = 3;

function maxHardwareContentWidth(
  items: PegboardCardDTO[],
  grid: number
): number {
  if (items.length === 0) return grid * 4;
  return Math.max(
    ...items.map(it => hardwareDimsWithGrid(it.hardware, grid).w)
  );
}

function PegboardPanelMobile({
  items,
  vw,
  layoutWidth,
  mobileScalePresentation,
}: {
  items: PegboardCardDTO[];
  vw: number;
  layoutWidth?: number;
  mobileScalePresentation?: MobileScalePresentation;
}) {
  const w = layoutWidth ?? vw;
  const slotContentW = mobileScalePresentation?.slotContentW ?? mobileInnerW(w);
  const itemsKey = useMemo(() => items.map(i => i.id).join("|"), [items]);
  const maxCardW = useMemo(
    () => maxHardwareContentWidth(items, PEG_GRID),
    [items, itemsKey]
  );
  const designContentW = useMemo(() => {
    if (mobileScalePresentation) return mobileScalePresentation.designContentW;
    const raw = Math.max(slotContentW, maxCardW);
    return Math.ceil(raw / PEG_GRID) * PEG_GRID;
  }, [mobileScalePresentation, slotContentW, maxCardW]);

  const noopCommit = useCallback(() => {}, []);
  const emptySpecs = useMemo<PegboardCardSpec[]>(() => [], []);
  const emptyPositions = useMemo(() => ({}), []);
  const stackRef = useRef<HTMLDivElement>(null);
  const [snappedContentH, setSnappedContentH] = useState(
    MOBILE_PEGBOARD_MIN_GRID_ROWS * PEG_GRID
  );

  useLayoutEffect(() => {
    const el = stackRef.current;
    if (!el) return;

    const minH = MOBILE_PEGBOARD_MIN_GRID_ROWS * PEG_GRID;
    const snapFromBorderHeight = (h: number) =>
      Math.max(minH, Math.ceil(h / PEG_GRID) * PEG_GRID);

    const apply = (entry?: ResizeObserverEntry) => {
      const h = entry
        ? (entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
        : el.getBoundingClientRect().height;
      const snapped = snapFromBorderHeight(h);
      setSnappedContentH(prev => (prev === snapped ? prev : snapped));
    };

    apply();
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) apply(entry);
    });
    ro.observe(el, { box: "border-box" });
    return () => ro.disconnect();
  }, [itemsKey, designContentW]);

  const designOuterW = designContentW + PEGBOARD_BORDER_OUTSET;
  const designOuterH = snappedContentH + PEGBOARD_BORDER_OUTSET;
  const scale = useMemo(() => {
    if (mobileScalePresentation) return mobileScalePresentation.scale;
    return Math.min(1, slotContentW / designOuterW);
  }, [mobileScalePresentation, slotContentW, designOuterW]);

  const visW = designOuterW * scale;
  const visH = designOuterH * scale;

  return (
    <div
      className="pegboard-mobile-scale-slot"
      style={{
        width: visW,
        height: visH,
      }}
    >
      <div
        className="pegboard-mobile-scale-surface"
        style={{
          width: designOuterW,
          height: designOuterH,
          transform: `scale(${scale})`,
        }}
      >
        <div
          className="pegboard-bg pegboard-bg--mobile-flow"
          style={{
            width: designContentW,
            height: snappedContentH,
            ["--peg-grid-px" as never]: `${PEG_GRID}px`,
          }}
        >
          <span className="heavy-screw heavy-screw--tl" aria-hidden />
          <span className="heavy-screw heavy-screw--tr" aria-hidden />
          <span className="heavy-screw heavy-screw--bl" aria-hidden />
          <span className="heavy-screw heavy-screw--br" aria-hidden />
          <div ref={stackRef} className="pegboard-mobile-stack">
            {items.map(it => {
              const { w: cw, h } = hardwareDimsWithGrid(it.hardware, PEG_GRID);
              return (
                <PegCard
                  key={it.id}
                  item={it}
                  x={0}
                  y={0}
                  w={cw}
                  h={h}
                  innerW={designContentW}
                  innerH={0}
                  gridPx={PEG_GRID}
                  specs={emptySpecs}
                  positions={emptyPositions}
                  dragDisabled
                  availableWidth={designContentW}
                  mobileFlexStack
                  suppressMobileScale
                  onDragCommit={noopCommit}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PegboardPanelDesktop({
  items,
  vw,
  vh,
  layoutWidth,
  layoutHeight,
  desktopPanelPadY,
  desktopPanelPadX,
}: {
  items: PegboardCardDTO[];
  vw: number;
  vh: number;
  layoutWidth?: number;
  layoutHeight?: number;
  desktopPanelPadY?: number;
  desktopPanelPadX?: number;
}) {
  const w = layoutWidth ?? vw;
  const h = layoutHeight ?? vh;
  const innerW = desktopInnerW(w, desktopPanelPadX ?? 32);
  const viewportH = desktopPortalInnerH(h, desktopPanelPadY ?? 40);

  const itemsKey = useMemo(() => items.map(i => i.id).join("|"), [items]);

  const packedLayout = useMemo(() => {
    const grids = [60, 54, 48, 42];
    const pick = () => {
      for (const grid of grids) {
        const iw = Math.floor(innerW / grid) * grid;
        const ih = Math.floor(viewportH / grid) * grid;
        if (iw <= 0 || ih <= 0) continue;

        const specs: PegboardCardSpec[] = items.map(it => {
          const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
          return { id: it.id, hardware: it.hardware, w, h };
        });

        const { positions: packed } = initialPackPositionsWithGrid(
          items.map(i => ({ id: i.id, hardware: i.hardware })),
          iw,
          grid
        );
        const resolved = resolveLayoutAfterResizeWithGrid(
          packed,
          specs,
          iw,
          ih,
          grid
        );

        const allFit = specs.every(s => {
          const p = resolved[s.id];
          return (
            p && p.x >= 0 && p.y >= 0 && p.x + s.w <= iw && p.y + s.h <= ih
          );
        });
        if (allFit)
          return { grid, innerW: iw, innerH: ih, specs, positions: resolved };
      }
      const grid = 42;
      const iw = Math.floor(innerW / grid) * grid;
      const ih = Math.floor(viewportH / grid) * grid;
      const specs: PegboardCardSpec[] = items.map(it => {
        const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
        return { id: it.id, hardware: it.hardware, w, h };
      });
      const { positions: packed } = initialPackPositionsWithGrid(
        items.map(i => ({ id: i.id, hardware: i.hardware })),
        iw,
        grid
      );
      return {
        grid,
        innerW: iw,
        innerH: ih,
        specs,
        positions: resolveLayoutAfterResizeWithGrid(
          packed,
          specs,
          iw,
          ih,
          grid
        ),
      };
    };
    return pick();
  }, [itemsKey, items, innerW, viewportH]);

  const [positions, setPositions] = useState(packedLayout.positions);
  const innerH = packedLayout.innerH;
  const grid = packedLayout.grid;
  const specs = packedLayout.specs;
  const innerWFinal = packedLayout.innerW;

  useEffect(() => {
    setPositions(prev => {
      const nextIds = new Set(specs.map(s => s.id));
      const prevKeys = Object.keys(prev);
      const sameSet =
        prevKeys.length === nextIds.size && prevKeys.every(k => nextIds.has(k));
      if (!sameSet) {
        return packedLayout.positions;
      }
      return resolveLayoutAfterResizeWithGrid(
        prev,
        specs,
        innerWFinal,
        packedLayout.innerH,
        grid
      );
    });
  }, [packedLayout, itemsKey, innerWFinal, viewportH, specs, items, grid]);

  const onDragCommit = useCallback((id: string, nx: number, ny: number) => {
    setPositions(p => ({ ...p, [id]: { x: nx, y: ny } }));
  }, []);

  return (
    <div
      style={{
        width: innerWFinal + PEGBOARD_BORDER_OUTSET,
        height: innerH + PEGBOARD_BORDER_OUTSET,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="pegboard-bg"
        style={{
          width: innerWFinal,
          height: innerH,
          ["--peg-grid-px" as never]: `${grid}px`,
        }}
      >
        <span className="heavy-screw heavy-screw--tl" aria-hidden />
        <span className="heavy-screw heavy-screw--tr" aria-hidden />
        <span className="heavy-screw heavy-screw--bl" aria-hidden />
        <span className="heavy-screw heavy-screw--br" aria-hidden />
        {items.map(it => {
          const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
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
              innerW={innerWFinal}
              innerH={innerH}
              gridPx={grid}
              specs={specs}
              positions={positions}
              dragDisabled={false}
              availableWidth={innerWFinal}
              onDragCommit={onDragCommit}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PegboardPanelView({
  items,
  isMobile,
  vw,
  vh,
  layoutWidth,
  layoutHeight,
  desktopPanelPadY,
  desktopPanelPadX,
  mobileScalePresentation,
}: {
  items: PegboardCardDTO[];
  isMobile: boolean;
  vw: number;
  vh: number;
  layoutWidth?: number;
  layoutHeight?: number;
  desktopPanelPadY?: number;
  desktopPanelPadX?: number;
  mobileScalePresentation?: MobileScalePresentation;
}) {
  if (isMobile) {
    return (
      <PegboardPanelMobile
        items={items}
        vw={vw}
        layoutWidth={layoutWidth}
        mobileScalePresentation={mobileScalePresentation}
      />
    );
  }
  return (
    <PegboardPanelDesktop
      items={items}
      vw={vw}
      vh={vh}
      layoutWidth={layoutWidth}
      layoutHeight={layoutHeight}
      desktopPanelPadY={desktopPanelPadY}
      desktopPanelPadX={desktopPanelPadX}
    />
  );
}
