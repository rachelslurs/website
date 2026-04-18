import { describe, expect, it } from "vitest";
import {
  CLIPBOARD_HOOK_RING_CENTER_Y_FRAC_OF_CARD_H,
  CLIPBOARD_MASONITE_TOP_FRAC_OF_CARD_H,
  CLIPBOARD_PAPERS_TOP_FRAC_OF_CARD_H,
  DESKTOP_PACK_GRIDS,
  hardwareDimsWithGrid,
  hitBoxForCollisionWithGrid,
  initialPackPositionsColumnFirstWithGrid,
  initialPackPositionsWithGrid,
  layoutValidWithGrid,
  orderPackItemsClipboardLast,
  orderPackItemsClipboardLastReverseNonClipboard,
  packDesktopPanelAtGrid,
  pickSharedDesktopPackGrid,
  resolveLayoutAfterResizeWithGrid,
  sortPackItemsByHeightDesc,
} from "./workshopPegboardPhysics";

function specsFor(
  items: { id: string; hardware: "clipboard" | "lcd" | "blueprint" }[],
  grid: number
) {
  return items.map(it => {
    const { w, h } = hardwareDimsWithGrid(it.hardware, grid);
    return { id: it.id, hardware: it.hardware, w, h };
  });
}

describe("layoutValidWithGrid", () => {
  it("accepts non-overlapping packed layout", () => {
    const items = [
      { id: "a", hardware: "blueprint" as const },
      { id: "b", hardware: "blueprint" as const },
    ];
    const grid = 60;
    const innerW = 960;
    const innerH = 720;
    const specs = specsFor(items, grid);
    const packed = initialPackPositionsWithGrid(items, innerW, grid).positions;
    const resolved = resolveLayoutAfterResizeWithGrid(
      packed,
      specs,
      innerW,
      innerH,
      grid
    );
    expect(layoutValidWithGrid(resolved, specs, innerW, innerH)).toBe(true);
  });

  it("rejects overlapping rects", () => {
    const specs = [
      { id: "a", hardware: "blueprint" as const, w: 120, h: 120 },
      { id: "b", hardware: "blueprint" as const, w: 120, h: 120 },
    ];
    const positions = {
      a: { x: 60, y: 60 },
      b: { x: 60, y: 60 },
    };
    expect(layoutValidWithGrid(positions, specs, 480, 360)).toBe(false);
  });
});

describe("sortPackItemsByHeightDesc", () => {
  it("orders tallest hardware first with input order among equal heights", () => {
    const items = [
      { id: "demo", hardware: "lcd" as const },
      { id: "link", hardware: "lcd" as const },
      { id: "work", hardware: "clipboard" as const },
    ];
    expect(sortPackItemsByHeightDesc(items, 60).map(x => x.id)).toEqual([
      "work",
      "demo",
      "link",
    ]);
  });
});

describe("orderPackItemsClipboardLastReverseNonClipboard", () => {
  it("reverses non-clipboard sequence and keeps clipboards last", () => {
    const items = [
      { id: "link", hardware: "lcd" as const },
      { id: "demo", hardware: "lcd" as const },
      { id: "work", hardware: "clipboard" as const },
    ];
    expect(
      orderPackItemsClipboardLastReverseNonClipboard(items).map(x => x.id)
    ).toEqual(["demo", "link", "work"]);
  });
});

describe("orderPackItemsClipboardLast", () => {
  it("keeps non-clipboard order and moves clipboard(s) to the end", () => {
    const items = [
      { id: "w", hardware: "clipboard" as const },
      { id: "l", hardware: "lcd" as const },
      { id: "d", hardware: "blueprint" as const },
    ];
    expect(orderPackItemsClipboardLast(items).map(x => x.id)).toEqual([
      "l",
      "d",
      "w",
    ]);
  });
});

describe("initialPackPositionsColumnFirstWithGrid", () => {
  it("stacks items vertically in one column before advancing x", () => {
    const items = [
      { id: "a", hardware: "blueprint" as const },
      { id: "b", hardware: "blueprint" as const },
    ];
    const grid = 60;
    const iw = 360;
    const ih = 900;
    const { positions } = initialPackPositionsColumnFirstWithGrid(
      items,
      iw,
      ih,
      grid
    );
    expect(positions.a!.x).toBe(positions.b!.x);
    expect(positions.b!.y).toBeGreaterThan(positions.a!.y);
  });

  it("places the second lcd flush under the first when innerH fits both (no vertical grid seam)", () => {
    const items = [
      { id: "a", hardware: "lcd" as const },
      { id: "b", hardware: "lcd" as const },
    ];
    const grid = 60;
    const { h } = hardwareDimsWithGrid("lcd", grid);
    const ih = 660;
    const { positions } = initialPackPositionsColumnFirstWithGrid(
      items,
      840,
      ih,
      grid
    );
    expect(positions.a).toEqual({ x: 60, y: 60 });
    expect(positions.b).toEqual({ x: 60, y: 60 + h });
  });
});

describe("pickSharedDesktopPackGrid", () => {
  it("returns the same coarsest grid for every panel when all fit at that grid", () => {
    const trio = [
      { id: "work", hardware: "clipboard" as const },
      { id: "link", hardware: "lcd" as const },
      { id: "demo", hardware: "blueprint" as const },
    ];
    const panels = [{ items: trio }, { items: trio }];
    const r = pickSharedDesktopPackGrid(panels, 1200, 1000);
    expect(r.grid).toBe(60);
    expect(r.innerW).toBe(Math.floor(1200 / 60) * 60);
    expect(r.innerH).toBe(Math.floor(1000 / 60) * 60);
  });

  it("uses a smaller shared grid when one panel cannot pack at 60", () => {
    const trio = [
      { id: "work", hardware: "clipboard" as const },
      { id: "link", hardware: "lcd" as const },
      { id: "demo", hardware: "blueprint" as const },
    ];
    const easy = [{ items: trio }];
    const tight = [{ items: trio }, { items: trio }];
    const easyGrid = pickSharedDesktopPackGrid(easy, 1200, 1000).grid;
    const sharedTight = pickSharedDesktopPackGrid(tight, 520, 520).grid;
    expect(easyGrid).toBeGreaterThanOrEqual(sharedTight);
  });
});

describe("packDesktopPanelAtGrid", () => {
  it("packs workshop trio on a large cork at 60px grid", () => {
    const items = [
      { id: "work", hardware: "clipboard" as const },
      { id: "link", hardware: "lcd" as const },
      { id: "demo", hardware: "blueprint" as const },
    ];
    const iw = 1200;
    const ih = 1000;
    const r = packDesktopPanelAtGrid(items, iw, ih, 60);
    expect(r).not.toBeNull();
    expect(layoutValidWithGrid(r!.positions, r!.specs, iw, ih)).toBe(true);
  });
});

describe("clipboard hardware vs peg lattice", () => {
  it("keeps hook ring centre and masonite top on-grid (CSS + hitBox must stay aligned)", () => {
    for (const grid of DESKTOP_PACK_GRIDS) {
      const { w, h } = hardwareDimsWithGrid("clipboard", grid);
      expect(CLIPBOARD_HOOK_RING_CENTER_Y_FRAC_OF_CARD_H * h).toBeCloseTo(
        0.5 * grid,
        10
      );
      expect(CLIPBOARD_MASONITE_TOP_FRAC_OF_CARD_H * h).toBeCloseTo(
        0.75 * grid,
        10
      );
      const box = hitBoxForCollisionWithGrid("clipboard", 0, 0, w, h, grid);
      expect(box.y).toBeCloseTo(0.75 * grid, 10);
    }
  });

  it("documents papers band offset at the reference grid (change CSS together)", () => {
    expect(CLIPBOARD_PAPERS_TOP_FRAC_OF_CARD_H).toBeCloseTo(85 / 480, 12);
  });
});
