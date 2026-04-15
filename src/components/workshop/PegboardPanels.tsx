import { useCallback, useEffect, useMemo, useState } from "react";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import {
  hardwareDims,
  initialPackPositions,
  resolveLayoutAfterResize,
} from "@utils/workshopPegboardPhysics";
import {
  desktopInnerW,
  desktopPortalInnerH,
  mobileInnerW,
} from "./pegboardDimensions";
import type { PegboardCardSpec } from "./pegboardTypes";
import PegCard from "./PegCard";

function PegboardPanelMobile({
  items,
  vw,
  layoutWidth,
}: {
  items: PegboardCardDTO[];
  vw: number;
  layoutWidth?: number;
}) {
  const w = layoutWidth ?? vw;
  const innerW = mobileInnerW(w);
  const noopCommit = useCallback(() => {}, []);
  const emptySpecs = useMemo<PegboardCardSpec[]>(() => [], []);
  const emptyPositions = useMemo(() => ({}), []);

  return (
    <div
      className="pegboard-bg pegboard-bg--mobile-flow"
      style={{ width: innerW, minHeight: "8rem" }}
    >
      <span className="heavy-screw heavy-screw--tl" aria-hidden />
      <span className="heavy-screw heavy-screw--tr" aria-hidden />
      <span className="heavy-screw heavy-screw--bl" aria-hidden />
      <span className="heavy-screw heavy-screw--br" aria-hidden />
      <div className="pegboard-mobile-stack">
        {items.map(it => {
          const { w: cw, h } = hardwareDims(it.hardware);
          return (
            <PegCard
              key={it.id}
              item={it}
              x={0}
              y={0}
              w={cw}
              h={h}
              innerW={innerW}
              innerH={0}
              specs={emptySpecs}
              positions={emptyPositions}
              dragDisabled
              availableWidth={innerW}
              mobileFlexStack
              onDragCommit={noopCommit}
            />
          );
        })}
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
}: {
  items: PegboardCardDTO[];
  vw: number;
  vh: number;
  layoutWidth?: number;
  layoutHeight?: number;
  desktopPanelPadY?: number;
}) {
  const w = layoutWidth ?? vw;
  const h = layoutHeight ?? vh;
  const innerW = desktopInnerW(w);
  const viewportH = desktopPortalInnerH(h, desktopPanelPadY ?? 40);

  const itemsKey = useMemo(() => items.map(i => i.id).join("|"), [items]);

  const specs: PegboardCardSpec[] = useMemo(() => {
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
    const ih = contentHeight;
    const scale = ih > 0 ? Math.min(1, viewportH / ih) : 1;
    return {
      innerH: ih,
      scale,
      positions: resolveLayoutAfterResize(packed, specs, innerW, ih),
    };
  }, [itemsKey, innerW, viewportH, specs, items]);

  const [positions, setPositions] = useState(packedLayout.positions);
  const innerH = packedLayout.innerH;
  const scale = packedLayout.scale;

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
    <div
      style={{
        width: innerW,
        height: viewportH,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="pegboard-bg"
        style={{
          width: innerW,
          height: innerH,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
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
              dragDisabled={false}
              availableWidth={innerW}
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
}: {
  items: PegboardCardDTO[];
  isMobile: boolean;
  vw: number;
  vh: number;
  layoutWidth?: number;
  layoutHeight?: number;
  desktopPanelPadY?: number;
}) {
  if (isMobile) {
    return (
      <PegboardPanelMobile items={items} vw={vw} layoutWidth={layoutWidth} />
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
    />
  );
}
