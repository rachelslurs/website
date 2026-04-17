import { describe, expect, it } from "vitest";
import {
  hardwareDimsWithGrid,
  initialPackPositionsWithGrid,
  layoutValidWithGrid,
  resolveLayoutAfterResizeWithGrid,
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

describe("workshop trio packing (sanity)", () => {
  it("finds a non-overlapping layout for clipboard + lcd + blueprint on a wide cork", () => {
    const items = [
      { id: "work", hardware: "clipboard" as const },
      { id: "link", hardware: "lcd" as const },
      { id: "demo", hardware: "blueprint" as const },
    ];
    const innerW = 1200;
    const innerH = 1000;
    for (const grid of [60, 54, 48, 42, 36, 30]) {
      const iw = Math.floor(innerW / grid) * grid;
      const ih = Math.floor(innerH / grid) * grid;
      const specs = specsFor(items, grid);
      const packed = initialPackPositionsWithGrid(items, iw, grid).positions;
      const resolved = resolveLayoutAfterResizeWithGrid(
        packed,
        specs,
        iw,
        ih,
        grid
      );
      const allFit = specs.every(s => {
        const p = resolved[s.id];
        return p && p.x >= 0 && p.y >= 0 && p.x + s.w <= iw && p.y + s.h <= ih;
      });
      if (allFit && layoutValidWithGrid(resolved, specs, iw, ih)) {
        expect(true).toBe(true);
        return;
      }
    }
    throw new Error("no grid produced a valid layout");
  });
});
