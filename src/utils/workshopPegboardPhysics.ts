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
    const clip = grid * 0.75;
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

/**
 * Clipboard is **8 grid units tall**. The metal hook ring centre must sit **0.5 grid**
 * below the card’s top edge so, when the card’s top is grid-snapped on the cork, it
 * lines up with the first row of peg holes (`y = grid/2` in cork space for a card at
 * `y = 0`). Keep `workshop-pegboard.css` (`.peg-clipboard-mount`) in sync.
 */
export const CLIPBOARD_HOOK_RING_CENTER_Y_FRAC_OF_CARD_H = 0.5 / 8;

/**
 * Masonite starts where the clip band ends — same ratio as `hitBoxForCollisionWithGrid`
 * top inset (`0.75 * grid`). Keep `.masonite-plate` in sync.
 */
export const CLIPBOARD_MASONITE_TOP_FRAC_OF_CARD_H = 0.75 / 8;

/** Papers band (legacy mock); fraction of card height at the 60px-grid design point. */
export const CLIPBOARD_PAPERS_TOP_FRAC_OF_CARD_H = 85 / 480;

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

/**
 * Stable pack order: keep relative order among non-clipboard cards, then append
 * every clipboard (tallest hardware) last so column-first stacks shorter cards
 * above the case study clip.
 */
export function orderPackItemsClipboardLast(items: PackItem[]): PackItem[] {
  const non = items.filter(it => it.hardware !== "clipboard");
  const clipboards = items.filter(it => it.hardware === "clipboard");
  return [...non, ...clipboards];
}

/**
 * Clipboard(s) still last for column-first “stack above,” but **non-clipboard**
 * cards are iterated in **reverse panel order** so two shorts swap who sits
 * closer to the clip — varies layout across panels when paired with
 * `panelIndex` without row-major “clipboard on the right.”
 */
export function orderPackItemsClipboardLastReverseNonClipboard(
  items: PackItem[]
): PackItem[] {
  const non = items.filter(it => it.hardware !== "clipboard");
  const clipboards = items.filter(it => it.hardware === "clipboard");
  return [...non].reverse().concat(clipboards);
}

/**
 * Tallest card first, then stable tie-break by **original panel index** (input
 * `items` order). Used for a column-first seed so the case study clipboard can
 * anchor **column 1** instead of always being iterated last (which maps to the
 * last column in column-first, or the right side in row-major with clip-last
 * ordering).
 */
export function sortPackItemsByHeightDesc(
  items: PackItem[],
  grid: number
): PackItem[] {
  const idx = new Map(items.map((it, i) => [it.id, i]));
  return [...items].sort((a, b) => {
    const ha = hardwareDimsWithGrid(a.hardware, grid).h;
    const hb = hardwareDimsWithGrid(b.hardware, grid).h;
    if (hb !== ha) return hb - ha;
    return (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0);
  });
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

/**
 * Column-first seed: stack items vertically (same column) before starting a new
 * column to the right. Lets desktop use vertical stacks at the current `grid`
 * when a single horizontal row would not fit — tried before shrinking `gridPx`.
 *
 * **Vertical seam:** There is **no extra `grid` gap between stacked cards** in a
 * column — the next card starts at `y + h` (edges may touch; `rectsOverlap` treats
 * flush as non-overlap). Top/left still start at `grid`; columns still advance by
 * `colMaxW + grid`. Whether a placement clears corner screws is left to
 * `resolveLayoutAfterResizeWithGrid`.
 *
 * **Wrap rule:** A new column starts when the current card would not fit with
 * `y + h <= innerH` (same as `cardInBoardBounds`), not `innerH - grid`.
 */
export function initialPackPositionsColumnFirstWithGrid(
  items: PackItem[],
  innerW: number,
  innerH: number,
  grid: number
): {
  positions: Record<string, { x: number; y: number }>;
  contentHeight: number;
} {
  const positions: Record<string, { x: number; y: number }> = {};
  let x = grid;
  let y = grid;
  let colMaxW = 0;
  let maxBottom = grid;

  for (const it of items) {
    const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
    if (y + h > innerH && y > grid) {
      x += colMaxW + grid;
      y = grid;
      colMaxW = 0;
    }
    positions[it.id] = { x, y };
    colMaxW = Math.max(colMaxW, w);
    maxBottom = Math.max(maxBottom, y + h);
    y += h;
  }

  const contentHeight = Math.max(
    grid * 4,
    Math.ceil((maxBottom + grid) / grid) * grid
  );
  return { positions, contentHeight };
}

export type PegboardPackedSpec = {
  id: string;
  hardware: PegboardHardware;
  w: number;
  h: number;
};

/**
 * Try several deterministic pack seeds at the same `grid`. Order of seeds is
 * the priority when multiple layouts validate.
 *
 * Seeds (column-first pair + height-desc + row variants; see ADR-005) are each
 * resolved and validated. **Among every layout that passes**, the chosen layout
 * is the one with **smallest clipboard left edge `x`** (so the case study can sit
 * in the **left column** whenever any valid seed places it there). Ties use a
 * deterministic hash of **`panelIndex`**, cork size, and `grid` so adjacent panels
 * are not forced to pick the same seed when several ties on `x`.
 *
 * `innerW` / `innerH` should already be snapped to multiples of `grid`.
 */
export type PackDesktopPanelAtGridOptions = {
  /** When true, logs each grid attempt and per-seed outcome to the console. */
  debug?: boolean;
  /** Shown in log lines (e.g. panel item key). */
  debugLabel?: string;
  /** Desktop strip index — varies seed try-order so layouts differ per panel. */
  panelIndex?: number;
};

function samePackItemOrder(a: PackItem[], b: PackItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((it, i) => it.id === b[i]!.id);
}

function rotateSeeds<T>(arr: T[], offset: number): T[] {
  const n = arr.length;
  if (n === 0) return arr;
  const k = ((offset % n) + n) % n;
  return arr.slice(k).concat(arr.slice(0, k));
}

/** Deterministic tie-break for picking among several valid pack layouts. */
function packLayoutPickHash(
  panelIndex: number,
  itemsKey: string,
  innerW: number,
  innerH: number,
  grid: number,
  salt: number
): number {
  let h = 2166136261;
  for (const part of [panelIndex, itemsKey, innerW, innerH, grid, salt]) {
    const s = String(part);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return Math.abs(h);
}

/** Minimum `x` among clipboard cards (left edge); `0` if there is no clipboard. */
function clipboardMinXForPack(
  positions: Record<string, { x: number; y: number }>,
  items: PackItem[]
): number {
  const xs = items
    .filter(it => it.hardware === "clipboard")
    .map(it => positions[it.id]?.x)
    .filter((x): x is number => typeof x === "number");
  if (xs.length === 0) return 0;
  return Math.min(...xs);
}

function firstOverlappingPairIds(
  positions: Record<string, { x: number; y: number }>,
  specs: { id: string; w: number; h: number }[]
): { a: string; b: string } | undefined {
  for (let i = 0; i < specs.length; i += 1) {
    for (let j = i + 1; j < specs.length; j += 1) {
      const sa = specs[i]!;
      const sb = specs[j]!;
      const pa = positions[sa.id];
      const pb = positions[sb.id];
      if (!pa || !pb) continue;
      const ra: Rect = { x: pa.x, y: pa.y, w: sa.w, h: sa.h };
      const rb: Rect = { x: pb.x, y: pb.y, w: sb.w, h: sb.h };
      if (rectsOverlap(ra, rb)) return { a: sa.id, b: sb.id };
    }
  }
  return undefined;
}

function firstOutOfBoundsDetail(
  resolved: Record<string, { x: number; y: number }>,
  specs: { id: string; w: number; h: number }[],
  innerW: number,
  innerH: number
): string | undefined {
  for (const s of specs) {
    const p = resolved[s.id];
    if (!p) return `${s.id}:missing position`;
    if (p.x < 0 || p.y < 0 || p.x + s.w > innerW || p.y + s.h > innerH) {
      return `${s.id} rect (${p.x},${p.y}) ${s.w}×${s.h} exceeds cork ${innerW}×${innerH}`;
    }
  }
  return undefined;
}

export function packDesktopPanelAtGrid(
  items: PackItem[],
  innerW: number,
  innerH: number,
  grid: number,
  options?: PackDesktopPanelAtGridOptions
): {
  positions: Record<string, { x: number; y: number }>;
  specs: PegboardPackedSpec[];
} | null {
  if (innerW <= 0 || innerH <= 0) return null;

  const dbg = options?.debug === true;
  const tag = options?.debugLabel ?? "workshop";
  const panelIndex = options?.panelIndex ?? 0;

  const specs: PegboardPackedSpec[] = items.map(it => {
    const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
    return { id: it.id, hardware: it.hardware, w, h };
  });

  const ordered = orderPackItemsClipboardLast(items);
  const orderedNonClipRev =
    orderPackItemsClipboardLastReverseNonClipboard(items);
  const heightDesc = sortPackItemsByHeightDesc(items, grid);

  const columnFirstPair: {
    name: string;
    positions: Record<string, { x: number; y: number }>;
  }[] = samePackItemOrder(ordered, orderedNonClipRev)
    ? [
        {
          name: "columnFirst",
          positions: initialPackPositionsColumnFirstWithGrid(
            ordered,
            innerW,
            innerH,
            grid
          ).positions,
        },
      ]
    : panelIndex % 2 === 0
      ? [
          {
            name: "columnFirst",
            positions: initialPackPositionsColumnFirstWithGrid(
              ordered,
              innerW,
              innerH,
              grid
            ).positions,
          },
          {
            name: "columnFirstNonClipboardReversed",
            positions: initialPackPositionsColumnFirstWithGrid(
              orderedNonClipRev,
              innerW,
              innerH,
              grid
            ).positions,
          },
        ]
      : [
          {
            name: "columnFirstNonClipboardReversed",
            positions: initialPackPositionsColumnFirstWithGrid(
              orderedNonClipRev,
              innerW,
              innerH,
              grid
            ).positions,
          },
          {
            name: "columnFirst",
            positions: initialPackPositionsColumnFirstWithGrid(
              ordered,
              innerW,
              innerH,
              grid
            ).positions,
          },
        ];

  const rowSeeds: {
    name: string;
    positions: Record<string, { x: number; y: number }>;
  }[] = [
    {
      name: "columnFirstHeightDesc",
      positions: initialPackPositionsColumnFirstWithGrid(
        heightDesc,
        innerW,
        innerH,
        grid
      ).positions,
    },
    {
      name: "rowMajorPanelOrder",
      positions: initialPackPositionsWithGrid(items, innerW, grid).positions,
    },
    {
      name: "rowMajor",
      positions: initialPackPositionsWithGrid(ordered, innerW, grid).positions,
    },
    {
      name: "rowHeightAsc",
      positions: initialPackPositionsWithGrid(
        [...ordered].sort((a, b) => {
          const ha = hardwareDimsWithGrid(a.hardware, grid).h;
          const hb = hardwareDimsWithGrid(b.hardware, grid).h;
          return ha - hb;
        }),
        innerW,
        grid
      ).positions,
    },
  ];

  const seeds = columnFirstPair.concat(
    rotateSeeds(rowSeeds, Math.floor(panelIndex / 2))
  );

  if (dbg) {
    const heights = specs.map(s => ({ id: s.id, h: s.h }));
    const sumH = specs.reduce((acc, s) => acc + s.h, 0);
    const maxH = specs.length ? Math.max(...specs.map(s => s.h)) : 0;
    // eslint-disable-next-line no-console -- intentional debug aid (opt-in via URL/localStorage)
    console.log(`[workshop-pack:${tag}] try grid`, grid, {
      panelIndex,
      innerW,
      innerH,
      cols: Math.round(innerW / grid),
      rows: Math.round(innerH / grid),
      verticalBudgetHint: {
        perCardH: heights,
        maxH,
        sumH,
        innerH,
        necessaryMaxH: maxH <= innerH,
        /** Necessary only if every card shares one x-column (stacked); not sufficient for acceptance. */
        necessarySumHIfSingleColumn: sumH <= innerH,
      },
    });
  }

  const itemsKeyForPick = items.map(it => it.id).join("|");
  const winners: {
    name: string;
    positions: Record<string, { x: number; y: number }>;
  }[] = [];

  for (const { name: seedName, positions: packed } of seeds) {
    const resolved = resolveLayoutAfterResizeWithGrid(
      packed,
      specs,
      innerW,
      innerH,
      grid
    );
    const allFit = specs.every(s => {
      const p = resolved[s.id];
      return (
        p && p.x >= 0 && p.y >= 0 && p.x + s.w <= innerW && p.y + s.h <= innerH
      );
    });
    const layoutValid = layoutValidWithGrid(resolved, specs, innerW, innerH);
    if (dbg) {
      const oob = allFit
        ? undefined
        : firstOutOfBoundsDetail(resolved, specs, innerW, innerH);
      const overlapPair =
        allFit && !layoutValid
          ? firstOverlappingPairIds(resolved, specs)
          : undefined;
      // eslint-disable-next-line no-console -- intentional debug aid
      console.log(`[workshop-pack:${tag}] seed ${seedName}`, {
        allFit,
        layoutValid,
        ...(oob ? { outOfBounds: oob } : {}),
        ...(overlapPair ? { overlappingPair: overlapPair } : {}),
        ...(!allFit || !layoutValid
          ? {
              note: !allFit
                ? "At least one card’s full rect exceeds the cork after resolve (often screw-avoidance nudges in collidesWithGrid)."
                : "Two or more cards overlap on full w×h rects (layoutValidWithGrid); see ADR-005.",
            }
          : {}),
      });
    }
    if (allFit && layoutValid) {
      winners.push({ name: seedName, positions: resolved });
    }
  }

  if (winners.length > 0) {
    const clipXs = winners.map(w => clipboardMinXForPack(w.positions, items));
    const minClipX = Math.min(...clipXs);
    const shortlist = winners.filter(
      w => clipboardMinXForPack(w.positions, items) === minClipX
    );
    const pick =
      shortlist[
        packLayoutPickHash(
          panelIndex,
          itemsKeyForPick,
          innerW,
          innerH,
          grid,
          minClipX
        ) % shortlist.length
      ]!;
    if (dbg) {
      // eslint-disable-next-line no-console -- intentional debug aid
      console.log(`[workshop-pack:${tag}] chose among valid`, {
        grid,
        winnerCount: winners.length,
        shortlistCount: shortlist.length,
        minClipboardX: minClipX,
        seed: pick.name,
      });
    }
    return { positions: pick.positions, specs };
  }

  if (dbg) {
    // eslint-disable-next-line no-console -- intentional debug aid
    console.log(`[workshop-pack:${tag}] rejected grid`, grid, {
      innerW,
      innerH,
    });
  }
  return null;
}

/** Candidate `gridPx` for desktop cork packing (largest peg spacing first). */
export const DESKTOP_PACK_GRIDS: readonly number[] = [60, 54, 48, 42, 36, 30];

/**
 * One snapped cork size and **`gridPx` for every desktop panel** on the strip,
 * so `--peg-grid-px` (peg hole spacing) matches across boards. Chooses the
 * **coarsest** `grid` in `DESKTOP_PACK_GRIDS` for which `packDesktopPanelAtGrid`
 * succeeds for **all** panels; if none pass, falls back to **`30`** (panels may
 * use their local fallback resolve when strict pack still fails).
 */
export function pickSharedDesktopPackGrid(
  panels: { items: PackItem[] }[],
  layoutInnerW: number,
  viewportH: number,
  options?: PackDesktopPanelAtGridOptions
): { grid: number; innerW: number; innerH: number } {
  const silentOpts: PackDesktopPanelAtGridOptions | undefined = options?.debug
    ? { ...options, debug: false }
    : options;

  for (const grid of DESKTOP_PACK_GRIDS) {
    const innerW = Math.floor(layoutInnerW / grid) * grid;
    const innerH = Math.floor(viewportH / grid) * grid;
    if (innerW <= 0 || innerH <= 0) continue;
    let allPass = true;
    for (const p of panels) {
      if (!packDesktopPanelAtGrid(p.items, innerW, innerH, grid, silentOpts)) {
        allPass = false;
        break;
      }
    }
    if (allPass) {
      return { grid, innerW, innerH };
    }
  }
  const grid = 30;
  return {
    grid,
    innerW: Math.floor(layoutInnerW / grid) * grid,
    innerH: Math.floor(viewportH / grid) * grid,
  };
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

/**
 * True if every card’s full pegboard rectangle lies inside the cork and no two
 * cards’ rectangles intersect.
 *
 * Does **not** evaluate corner screws — those are enforced during
 * `resolveLayoutAfterResizeWithGrid` via `collidesWithGrid` (screw hit boxes +
 * card-card overlap). Screw pressure usually surfaces as failed **`allFit`**
 * (card pushed past the edge), not as `layoutValidWithGrid === false`. See
 * ADR-005.
 */
export function layoutValidWithGrid(
  positions: Record<string, { x: number; y: number }>,
  specs: { id: string; hardware: PegboardHardware; w: number; h: number }[],
  innerW: number,
  innerH: number
): boolean {
  for (const s of specs) {
    const p = positions[s.id];
    if (!p) return false;
    if (!cardInBoardBounds(p.x, p.y, s.w, s.h, innerW, innerH)) return false;
  }
  for (let i = 0; i < specs.length; i += 1) {
    for (let j = i + 1; j < specs.length; j += 1) {
      const a = specs[i]!;
      const b = specs[j]!;
      const pa = positions[a.id];
      const pb = positions[b.id];
      if (!pa || !pb) return false;
      const ra: Rect = { x: pa.x, y: pa.y, w: a.w, h: a.h };
      const rb: Rect = { x: pb.x, y: pb.y, w: b.w, h: b.h };
      if (rectsOverlap(ra, rb)) return false;
    }
  }
  return true;
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
