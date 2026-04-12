export type PegboardHardware = "clipboard" | "lcd" | "blueprint";

export const PEG_GRID = 60;

export function snapToGrid(val: number): number {
  return Math.round(val / PEG_GRID) * PEG_GRID;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

/** Collision hitbox: clipboard clip hangs above — body box starts lower. */
export function hitBoxForCollision(
  hardware: PegboardHardware,
  x: number,
  y: number,
  w: number,
  h: number
): Rect {
  if (hardware === "clipboard") {
    const clip = 45;
    return { x, y: y + clip, w, h: Math.max(PEG_GRID, h - clip) };
  }
  return { x, y, w, h };
}

export function boardScrewRects(innerW: number, innerH: number): Rect[] {
  const s = 28;
  const inset = 16;
  return [
    { x: inset, y: inset, w: s, h: s },
    { x: innerW - inset - s, y: inset, w: s, h: s },
    { x: inset, y: innerH - inset - s, w: s, h: s },
    { x: innerW - inset - s, y: innerH - inset - s, w: s, h: s },
  ];
}

export function cardInBoardBounds(
  x: number,
  y: number,
  w: number,
  h: number,
  innerW: number,
  innerH: number
): boolean {
  return x >= 0 && y >= 0 && x + w <= innerW && y + h <= innerH;
}

export function hardwareDims(hardware: PegboardHardware): {
  w: number;
  h: number;
} {
  switch (hardware) {
    case "clipboard":
      return { w: 300, h: 360 };
    case "lcd":
      return { w: 240, h: 180 };
    case "blueprint":
      return { w: 360, h: 240 };
  }
}

export interface PackItem {
  id: string;
  hardware: PegboardHardware;
}

/** Row-major pack with PEG_GRID gutters; returns positions and content height. */
export function initialPackPositions(
  items: PackItem[],
  innerW: number
): {
  positions: Record<string, { x: number; y: number }>;
  contentHeight: number;
} {
  const positions: Record<string, { x: number; y: number }> = {};
  let x = PEG_GRID;
  let y = PEG_GRID;
  let rowH = 0;
  let maxBottom = PEG_GRID;

  for (const it of items) {
    const { w, h } = hardwareDims(it.hardware);
    if (x + w > innerW - PEG_GRID && x > PEG_GRID) {
      x = PEG_GRID;
      y += rowH + PEG_GRID;
      rowH = 0;
    }
    positions[it.id] = { x, y };
    rowH = Math.max(rowH, h);
    maxBottom = Math.max(maxBottom, y + h);
    x += w + PEG_GRID;
  }

  const contentHeight = Math.max(
    PEG_GRID * 8,
    Math.ceil((maxBottom + PEG_GRID) / PEG_GRID) * PEG_GRID
  );
  return { positions, contentHeight };
}

function collides(
  selfId: string,
  x: number,
  y: number,
  spec: { id: string; hardware: PegboardHardware; w: number; h: number },
  screws: Rect[],
  others: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  positions: Record<string, { x: number; y: number }>,
  innerW: number,
  innerH: number
): boolean {
  const { w, h } = spec;
  if (!cardInBoardBounds(x, y, w, h, innerW, innerH)) return true;

  const hitSelf = hitBoxForCollision(spec.hardware, x, y, w, h);
  for (const s of screws) {
    if (rectsOverlap(hitSelf, s)) return true;
  }

  for (const o of others) {
    if (o.id === selfId) continue;
    const p = positions[o.id];
    if (!p) continue;
    const hitO = hitBoxForCollision(o.hardware, p.x, p.y, o.w, o.h);
    if (rectsOverlap(hitSelf, hitO)) return true;
  }
  return false;
}

/** True if placing `selfId` at (x,y) collides with bounds, corner screws, or other cards. */
export function hasPlacementCollision(
  selfId: string,
  x: number,
  y: number,
  spec: { id: string; hardware: PegboardHardware; w: number; h: number },
  allSpecs: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  positions: Record<string, { x: number; y: number }>,
  innerW: number,
  innerH: number
): boolean {
  const screws = boardScrewRects(innerW, innerH);
  return collides(
    selfId,
    x,
    y,
    spec,
    screws,
    allSpecs,
    positions,
    innerW,
    innerH
  );
}

/**
 * After resize: resolve overlaps per spec (top row first, then right-to-left on x).
 */
export function resolveLayoutAfterResize(
  positions: Record<string, { x: number; y: number }>,
  specs: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  innerW: number,
  innerH: number
): Record<string, { x: number; y: number }> {
  const screws = boardScrewRects(innerW, innerH);
  const next = { ...positions };
  const sorted = [...specs].sort((a, b) => {
    const pa = next[a.id] ?? { x: 0, y: 0 };
    const pb = next[b.id] ?? { x: 0, y: 0 };
    if (pa.y !== pb.y) return pa.y - pb.y;
    return pb.x - pa.x;
  });

  for (const spec of sorted) {
    let x = snapToGrid(next[spec.id]?.x ?? PEG_GRID);
    let y = snapToGrid(next[spec.id]?.y ?? PEG_GRID);
    const { w, h } = spec;

    let guard = 0;
    while (
      guard < 400 &&
      collides(spec.id, x, y, spec, screws, specs, next, innerW, innerH)
    ) {
      guard += 1;
      y += PEG_GRID;
      if (y + h > innerH - PEG_GRID) {
        y = PEG_GRID;
        x -= PEG_GRID;
      }
      if (x < PEG_GRID) {
        x = PEG_GRID;
        y += PEG_GRID;
      }
    }
    next[spec.id] = { x, y };
  }
  return next;
}

export function proposedDragPosition(
  originX: number,
  originY: number,
  offsetX: number,
  offsetY: number,
  w: number,
  h: number,
  innerW: number,
  innerH: number
): { x: number; y: number } {
  let x = snapToGrid(originX + offsetX);
  let y = snapToGrid(originY + offsetY);
  x = Math.max(0, Math.min(x, innerW - w));
  y = Math.max(0, Math.min(y, innerH - h));
  return { x, y };
}
