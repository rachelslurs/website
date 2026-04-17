export type PegboardHardware = "clipboard" | "lcd" | "blueprint";

export const PEG_GRID = 60;

export function snapToGridWithGrid(val: number, grid: number): number {
  return Math.round(val / grid) * grid;
}

export function snapToGrid(val: number): number {
  return snapToGridWithGrid(val, PEG_GRID);
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

/**
 * Hitbox for **corner screws** (clipboard clip sits above the body — ignore that
 * band so we do not false-positive screw hits). **Card vs card** overlap uses full
 * `w×h` bounds in `collides` / `collidesWithGrid`.
 */
export function hitBoxForCollisionWithGrid(
  hardware: PegboardHardware,
  x: number,
  y: number,
  w: number,
  h: number,
  grid: number
): Rect {
  if (hardware === "clipboard") {
    const clip = Math.round(grid * 0.75);
    return { x, y: y + clip, w, h: Math.max(grid, h - clip) };
  }
  return { x, y, w, h };
}

export function hitBoxForCollision(
  hardware: PegboardHardware,
  x: number,
  y: number,
  w: number,
  h: number
): Rect {
  return hitBoxForCollisionWithGrid(hardware, x, y, w, h, PEG_GRID);
}

export function boardScrewRectsWithGrid(
  innerW: number,
  innerH: number,
  grid: number
): Rect[] {
  const s = 28;
  const inset = Math.max(0, Math.round(grid / 2 - s / 2));
  return [
    { x: inset, y: inset, w: s, h: s },
    { x: innerW - inset - s, y: inset, w: s, h: s },
    { x: inset, y: innerH - inset - s, w: s, h: s },
    { x: innerW - inset - s, y: innerH - inset - s, w: s, h: s },
  ];
}

export function boardScrewRects(innerW: number, innerH: number): Rect[] {
  return boardScrewRectsWithGrid(innerW, innerH, PEG_GRID);
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

/** Horizontal slack from one side of centered pegboard to viewport edge (panel has p-10). */
export function desktopPegboardSideGap(vw: number, innerW: number): number {
  const panelPadX = 80;
  return Math.max(0, (vw - panelPadX - innerW) / 2);
}

export function hardwareUnits(hardware: PegboardHardware): {
  wu: number;
  hu: number;
} {
  switch (hardware) {
    case "clipboard":
      return { wu: 5, hu: 8 };
    case "lcd":
      return { wu: 7, hu: 5 };
    case "blueprint":
      return { wu: 5, hu: 5 };
  }
}

export function hardwareDimsWithGrid(
  hardware: PegboardHardware,
  grid: number
): { w: number; h: number } {
  const { wu, hu } = hardwareUnits(hardware);
  return { w: wu * grid, h: hu * grid };
}

export function hardwareDims(hardware: PegboardHardware): {
  w: number;
  h: number;
} {
  return hardwareDimsWithGrid(hardware, PEG_GRID);
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
  return initialPackPositionsWithGrid(items, innerW, PEG_GRID);
}

export function initialPackPositionsWithGrid(
  items: PackItem[],
  innerW: number,
  grid: number
): {
  positions: Record<string, { x: number; y: number }>;
  contentHeight: number;
} {
  const positions: Record<string, { x: number; y: number }> = {};
  let x = grid;
  let y = grid;
  let rowH = 0;
  let maxBottom = grid;

  for (const it of items) {
    const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
    if (x + w > innerW - grid && x > grid) {
      x = grid;
      y += rowH + grid;
      rowH = 0;
    }
    positions[it.id] = { x, y };
    rowH = Math.max(rowH, h);
    maxBottom = Math.max(maxBottom, y + h);
    x += w + grid;
  }

  const contentHeight = Math.max(
    grid * 4,
    Math.ceil((maxBottom + grid) / grid) * grid
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

  const hitSelfForScrews = hitBoxForCollision(spec.hardware, x, y, w, h);
  for (const s of screws) {
    if (rectsOverlap(hitSelfForScrews, s)) return true;
  }

  const fullSelf: Rect = { x, y, w, h };
  for (const o of others) {
    if (o.id === selfId) continue;
    const p = positions[o.id];
    if (!p) continue;
    const fullO: Rect = { x: p.x, y: p.y, w: o.w, h: o.h };
    if (rectsOverlap(fullSelf, fullO)) return true;
  }
  return false;
}

function collidesWithGrid(
  selfId: string,
  x: number,
  y: number,
  spec: { id: string; hardware: PegboardHardware; w: number; h: number },
  screws: Rect[],
  others: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  positions: Record<string, { x: number; y: number }>,
  innerW: number,
  innerH: number,
  grid: number
): boolean {
  const { w, h } = spec;
  if (!cardInBoardBounds(x, y, w, h, innerW, innerH)) return true;

  const hitSelfForScrews = hitBoxForCollisionWithGrid(
    spec.hardware,
    x,
    y,
    w,
    h,
    grid
  );
  for (const s of screws) {
    if (rectsOverlap(hitSelfForScrews, s)) return true;
  }

  const fullSelf: Rect = { x, y, w, h };
  for (const o of others) {
    if (o.id === selfId) continue;
    const p = positions[o.id];
    if (!p) continue;
    const fullO: Rect = { x: p.x, y: p.y, w: o.w, h: o.h };
    if (rectsOverlap(fullSelf, fullO)) return true;
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

export function hasPlacementCollisionWithGrid(
  selfId: string,
  x: number,
  y: number,
  spec: { id: string; hardware: PegboardHardware; w: number; h: number },
  allSpecs: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  positions: Record<string, { x: number; y: number }>,
  innerW: number,
  innerH: number,
  grid: number
): boolean {
  const screws = boardScrewRectsWithGrid(innerW, innerH, grid);
  return collidesWithGrid(
    selfId,
    x,
    y,
    spec,
    screws,
    allSpecs,
    positions,
    innerW,
    innerH,
    grid
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
    const { h } = spec;

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

export function resolveLayoutAfterResizeWithGrid(
  positions: Record<string, { x: number; y: number }>,
  specs: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  innerW: number,
  innerH: number,
  grid: number
): Record<string, { x: number; y: number }> {
  const screws = boardScrewRectsWithGrid(innerW, innerH, grid);
  const next = { ...positions };
  const sorted = [...specs].sort((a, b) => {
    const pa = next[a.id] ?? { x: 0, y: 0 };
    const pb = next[b.id] ?? { x: 0, y: 0 };
    if (pa.y !== pb.y) return pa.y - pb.y;
    return pb.x - pa.x;
  });

  for (const spec of sorted) {
    let x = snapToGridWithGrid(next[spec.id]?.x ?? grid, grid);
    let y = snapToGridWithGrid(next[spec.id]?.y ?? grid, grid);
    const { h } = spec;

    let guard = 0;
    while (
      guard < 400 &&
      collidesWithGrid(
        spec.id,
        x,
        y,
        spec,
        screws,
        specs,
        next,
        innerW,
        innerH,
        grid
      )
    ) {
      guard += 1;
      y += grid;
      if (y + h > innerH - grid) {
        y = grid;
        x -= grid;
      }
      if (x < grid) {
        x = grid;
        y += grid;
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

export function proposedDragPositionWithGrid(
  originX: number,
  originY: number,
  offsetX: number,
  offsetY: number,
  w: number,
  h: number,
  innerW: number,
  innerH: number,
  grid: number
): { x: number; y: number } {
  let x = snapToGridWithGrid(originX + offsetX, grid);
  let y = snapToGridWithGrid(originY + offsetY, grid);
  x = Math.max(0, Math.min(x, innerW - w));
  y = Math.max(0, Math.min(y, innerH - h));
  return { x, y };
}
