import DemoBlueprintCard from "@components/workshop/DemoBlueprintCard";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PegboardCardDTO } from "@utils/serializeWorkshopPegboard";
import {
  hasPlacementCollision,
  proposedDragPosition,
  snapToGrid,
} from "@utils/workshopPegboardPhysics";
import type { PegboardCardSpec } from "./pegboardTypes";
import { CaseStudyClipboard, LinkLcdCard } from "./PegboardHardwareCards";

const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

export default function PegCard({
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
  availableWidth,
  mobileFlexStack,
  onDragCommit,
}: {
  item: PegboardCardDTO;
  x: number;
  y: number;
  w: number;
  h: number;
  innerW: number;
  innerH: number;
  specs: PegboardCardSpec[];
  positions: Record<string, { x: number; y: number }>;
  dragDisabled: boolean;
  /** Portal / container width for shrink-to-fit (not hardware width). */
  availableWidth: number;
  /** Mobile column: flex stack without absolute grid. */
  mobileFlexStack?: boolean;
  onDragCommit: (id: string, nx: number, ny: number) => void;
}) {
  const rawX = useMotionValue(x);
  const rawY = useMotionValue(y);
  const snapOffsetX = useTransform(rawX, v => snapToGrid(v) - v);
  const snapOffsetY = useTransform(rawY, v => snapToGrid(v) - v);
  const draggingRef = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const [clipboardDragVisual, setClipboardDragVisual] = useState(false);
  const [lcdDragVisual, setLcdDragVisual] = useState(false);
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

  const spec: PegboardCardSpec = useMemo(
    () => ({ id: item.id, hardware: item.hardware, w, h }),
    [item.id, item.hardware, w, h]
  );

  const padding = 32;
  const scaleFactor =
    dragDisabled && availableWidth < w + padding
      ? (availableWidth - padding) / w
      : 1;

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
        <LinkLcdCard item={item} dragVisual={lcdDragVisual} />
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
    const stack = mobileFlexStack === true;
    return (
      <div
        className={[rootClass, stack ? "peg-card--mobile-stack" : ""]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: w,
          height: h,
          transform: stack
            ? `scale(${scaleFactor})`
            : `translate(${x}px, ${y}px) scale(${scaleFactor})`,
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
        if (isLcd) setLcdDragVisual(true);
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
          if (isLcd) setLcdDragVisual(false);
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
