import type { CollectionEntry } from "astro:content";
import { describe, expect, it } from "vitest";
import buildWorkshopPanels from "./buildWorkshopPanels";

function mockWork(id: string, pubDatetime: Date): CollectionEntry<"work"> {
  return {
    id,
    collection: "work",
    slug: id,
    body: "",
    render: async () => ({ Content: () => null }),
    data: {
      title: id,
      pubDatetime,
      summary: "",
    },
  } as unknown as CollectionEntry<"work">;
}

function mockDemo(id: string, pubDatetime: Date): CollectionEntry<"demos"> {
  return {
    id,
    collection: "demos",
    slug: id,
    body: "",
    render: async () => ({ Content: () => null }),
    data: {
      title: id,
      pubDatetime,
    },
  } as unknown as CollectionEntry<"demos">;
}

function mockLink(id: string, pubDatetime: Date): CollectionEntry<"links"> {
  return {
    id,
    collection: "links",
    slug: id,
    body: "",
    render: async () => ({ Content: () => null }),
    data: {
      title: id,
      pubDatetime,
      url: "https://example.com/",
    },
  } as unknown as CollectionEntry<"links">;
}

describe("buildWorkshopPanels", () => {
  it("allows at most one work per panel when backfilling", () => {
    const wNew = mockWork("w-new", new Date("2024-06-01"));
    const wOld = mockWork("w-old", new Date("2020-01-01"));
    const dNew = mockDemo("d-new", new Date("2023-06-01"));
    const dOld = mockDemo("d-old", new Date("2021-06-01"));

    const panels = buildWorkshopPanels([wNew, wOld], [dNew, dOld], []);

    const first = panels[0]!;
    expect(first.filter(i => i.kind === "work")).toHaveLength(1);
    expect(first.filter(i => i.kind === "demos")).toHaveLength(2);
    expect(first.map(i => i.entry.id)).toEqual([wNew.id, dNew.id, dOld.id]);
  });

  it("allows at most one links entry per panel when backfilling", () => {
    const l1 = mockLink("l1", new Date("2022-01-01"));
    const l2 = mockLink("l2", new Date("2023-01-01"));
    const d1 = mockDemo("d1", new Date("2024-01-01"));
    const d2 = mockDemo("d2", new Date("2021-01-01"));
    const d3 = mockDemo("d3", new Date("2020-01-01"));

    const panels = buildWorkshopPanels([], [d1, d2, d3], [l1, l2]);

    const first = panels[0]!;
    expect(first.filter(i => i.kind === "links")).toHaveLength(1);
    expect(first.filter(i => i.kind === "demos")).toHaveLength(2);
    expect(first.map(i => i.entry.id)).toEqual([l2.id, d1.id, d2.id]);
  });

  it("prefers links over demos in the pool when work slot is full", () => {
    const w = mockWork("w", new Date("2024-01-01"));
    const l = mockLink("l", new Date("2023-01-01"));
    const dNew = mockDemo("d-new", new Date("2025-01-01"));
    const dOld = mockDemo("d-old", new Date("2020-01-01"));

    const panels = buildWorkshopPanels([w], [dNew, dOld], [l]);
    const first = panels[0]!;

    expect(first.map(i => i.kind)).toEqual(["work", "links", "demos"]);
    expect(first.map(i => i.entry.id)).toEqual([w.id, l.id, dNew.id]);
  });

  it("stops backfill when the pool is only extra work; allows a partial panel (ADR-004 non-progress)", () => {
    const wNew = mockWork("w-new", new Date("2024-01-01"));
    const wOld = mockWork("w-old", new Date("2023-01-01"));
    const panels = buildWorkshopPanels([wNew, wOld], [], []);

    expect(panels[0]).toHaveLength(1);
    expect(panels[0]![0]!.kind).toBe("work");
    expect(panels[0]![0]!.entry.id).toBe(wNew.id);
    expect(panels[1]).toHaveLength(1);
    expect(panels[1]![0]!.entry.id).toBe(wOld.id);
  });

  it("stops backfill when the pool is only extra links; allows a partial panel (ADR-004 non-progress)", () => {
    const lNew = mockLink("l-new", new Date("2024-01-01"));
    const lOld = mockLink("l-old", new Date("2023-01-01"));
    const panels = buildWorkshopPanels([], [], [lNew, lOld]);

    expect(panels[0]).toHaveLength(1);
    expect(panels[0]![0]!.kind).toBe("links");
    expect(panels[0]![0]!.entry.id).toBe(lNew.id);
    expect(panels[1]).toHaveLength(1);
    expect(panels[1]![0]!.entry.id).toBe(lOld.id);
  });
});
