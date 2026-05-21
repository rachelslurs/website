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

const MAX_ITEMS_PER_PANEL = 3;

function countKind(
  panel: WorkshopPanelItem[],
  kind: WorkshopPanelItem["kind"]
): number {
  return panel.filter(item => item.kind === kind).length;
}

function canAddToPanel(
  panel: WorkshopPanelItem[],
  kind: Tagged["kind"]
): boolean {
  if (panel.length >= MAX_ITEMS_PER_PANEL) return false;
  if (kind === "work" && countKind(panel, "work") >= 1) return false;
  if (kind === "links" && countKind(panel, "links") >= 1) return false;
  return true;
}

/** Lower sorts earlier in the pool (picked first). */
function kindPriority(kind: Tagged["kind"]): number {
  if (kind === "work") return 0;
  if (kind === "links") return 1;
  return 2;
}

function sortPoolByKindThenDate(pool: Tagged[]) {
  pool.sort((a, b) => {
    const byKind = kindPriority(a.kind) - kindPriority(b.kind);
    if (byKind !== 0) return byKind;
    return entryTime(b.entry) - entryTime(a.entry);
  });
}

/**
 * Group work, links, and demos into panels of at most 3 items.
 * Per panel: next work → next link → up to 1 demo → backfill with priority
 * work → links → demos (newest first within each kind). At most one work and
 * one links entry per panel; demos may fill remaining slots.
 *
 * @see `docs/decisions/004-workshop-panel-packing.md` (ADR-004) — normative rules and consequences.
 */
export default function buildWorkshopPanels(
  work: CollectionEntry<"work">[],
  demos: CollectionEntry<"demos">[],
  links: CollectionEntry<"links">[]
): WorkshopPanel[] {
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
      sortPoolByKindThenDate(pool);
      workQ.length = 0;
      linkQ.length = 0;
      demoQ.length = 0;

      while (panel.length < MAX_ITEMS_PER_PANEL && pool.length) {
        const idx = pool.findIndex(item => canAddToPanel(panel, item.kind));
        if (idx === -1) break;
        const [picked] = pool.splice(idx, 1);
        panel.push(picked);
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
