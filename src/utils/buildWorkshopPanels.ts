import type { CollectionEntry } from "astro:content";

export type WorkshopPanelItem =
  | { kind: "work"; entry: CollectionEntry<"work"> }
  | { kind: "demos"; entry: CollectionEntry<"demos"> }
  | { kind: "links"; entry: CollectionEntry<"links"> };

export type WorkshopPanel = WorkshopPanelItem[];

type Tagged =
  | { kind: "work"; entry: CollectionEntry<"work"> }
  | { kind: "demos"; entry: CollectionEntry<"demos"> }
  | { kind: "links"; entry: CollectionEntry<"links"> };

function entryTime(
  entry:
    | CollectionEntry<"work">
    | CollectionEntry<"demos">
    | CollectionEntry<"links">
): number {
  return new Date(entry.data.modDatetime ?? entry.data.pubDatetime).getTime();
}

function sortWorkQueue(q: CollectionEntry<"work">[]) {
  q.sort((a, b) => entryTime(b) - entryTime(a));
}

function sortDemoQueue(q: CollectionEntry<"demos">[]) {
  q.sort((a, b) => entryTime(b) - entryTime(a));
}

function sortLinkQueue(q: CollectionEntry<"links">[]) {
  q.sort((a, b) => entryTime(b) - entryTime(a));
}

function sortAllQueues(
  workQ: CollectionEntry<"work">[],
  linkQ: CollectionEntry<"links">[],
  demoQ: CollectionEntry<"demos">[]
) {
  sortWorkQueue(workQ);
  sortLinkQueue(linkQ);
  sortDemoQueue(demoQ);
}

/**
 * Group work, links, and demos into panels of at most 3 items.
 * Per panel: next work → next link → up to 1 demo → global date backfill.
 */
export default function buildWorkshopPanels(
  work: CollectionEntry<"work">[],
  demos: CollectionEntry<"demos">[],
  links: CollectionEntry<"links">[]
): WorkshopPanel[] {
  const MAX_ITEMS_PER_PANEL = 3;
  const workQ = [...work];
  const linkQ = [...links];
  const demoQ = [...demos];
  sortAllQueues(workQ, linkQ, demoQ);

  const panels: WorkshopPanel[] = [];

  while (workQ.length || linkQ.length || demoQ.length) {
    const panel: WorkshopPanelItem[] = [];

    if (workQ.length) {
      panel.push({ kind: "work", entry: workQ.shift()! });
    }
    if (linkQ.length) {
      panel.push({ kind: "links", entry: linkQ.shift()! });
    }
    let demoSlots = Math.min(1, MAX_ITEMS_PER_PANEL - panel.length);
    while (demoSlots > 0 && demoQ.length) {
      panel.push({ kind: "demos", entry: demoQ.shift()! });
      demoSlots -= 1;
    }

    if (panel.length < MAX_ITEMS_PER_PANEL) {
      const pool: Tagged[] = [
        ...workQ.map(entry => ({ kind: "work" as const, entry })),
        ...linkQ.map(entry => ({ kind: "links" as const, entry })),
        ...demoQ.map(entry => ({ kind: "demos" as const, entry })),
      ];
      pool.sort((a, b) => entryTime(b.entry) - entryTime(a.entry));
      workQ.length = 0;
      linkQ.length = 0;
      demoQ.length = 0;

      while (panel.length < MAX_ITEMS_PER_PANEL && pool.length) {
        panel.push(pool.shift()!);
      }

      for (const w of pool) {
        if (w.kind === "work") workQ.push(w.entry);
        else if (w.kind === "links") linkQ.push(w.entry);
        else demoQ.push(w.entry);
      }
      sortAllQueues(workQ, linkQ, demoQ);
    }

    panels.push(panel);
  }

  return panels;
}
