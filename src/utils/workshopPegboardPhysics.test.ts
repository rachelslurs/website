import { describe, expect, it } from "vitest";
import {
  hardwareDimsWithGrid,
  initialPackPositionsColumnFirstWithGrid,
  initialPackPositionsWithGrid,
  layoutValidWithGrid,
  orderPackItemsClipboardLast,
  packDesktopPanelAtGrid,
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
