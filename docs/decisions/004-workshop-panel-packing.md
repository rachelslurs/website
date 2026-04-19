# ADR-004: Workshop panel packing (work / links / demos)

## Status

Accepted

## Date

2026-04-16

## Context

The workshop pegboard renders **horizontal panels** of up to three cards. **Visual density** (scale, grid, overflow) is governed by layout and prior ADRs (notably [ADR-001](001-workshop-mobile-pegboard-contract.md) and [ADR-003](003-workshop-frame-chrome-initial-viewport.md)). **Which entries share a panel** is a separate concern: it is decided in code when building the ordered list of panels, not by viewport breakpoints alone.

Without explicit rules, a naive “fill empty slots by global recency” backfill can place **multiple work cards or multiple link cards on the same panel**, which reads as cluttered on the LCD-style cards and fights the mental model of “one featured work / one link slot per shelf.”

## Decision

We encode panel construction in `src/utils/buildWorkshopPanels.ts` with the following invariants:

1. **Panel size** — At most **three** items per panel.

2. **Per-kind caps** — At most **one** `work` entry and at most **one** `links` entry per panel. **`demos`** may occupy any remaining slots (no per-panel cap beyond the panel size of three).

3. **Primary placement (per panel, in order)** — Take the next item from the **work** queue (if any), then the next from **links** (if any), then at most **one** from **demos**, each time respecting the panel size cap. Queues are ordered **newest first** by `modDatetime` when set, otherwise `pubDatetime`.

4. **Backfill** — If the panel still has fewer than three items, merge everything left in the three queues into a **single pool**, then repeatedly pick the **first** item that **fits** the caps above. The pool is sorted by:
   - **Kind priority:** `work`, then `links`, then `demos`.
   - **Within the same kind:** **newest first** (same timestamp rule as the queues).

5. **Non-progress** — If no pool item can legally be added (for example, only extra `work` entries remain but the panel already has a work card), backfill **stops** for that panel; leftovers return to the queues for subsequent panels.

## Alternatives Considered

### Pure global recency backfill (no per-kind caps)

- **Pros:** Maximally “fresh” panels; simpler comparator.
- **Cons:** Duplicate work or links on one panel; worse scannability.
- **Rejected.**

### Hard-require three items per panel before advancing

- **Pros:** Uniform panel width in the data layer.
- **Cons:** Can deadlock or force awkward merges when caps block all remaining pool items.
- **Rejected** in favor of partial panels when necessary.

## Consequences

- **Implementation:** `buildWorkshopPanels` is the normative source; changes to packing rules should update this ADR or supersede it.
- **Tests:** `src/utils/buildWorkshopPanels.test.ts` locks caps and representative ordering; extend it when behavior changes.
- **Layout ADRs:** ADR-001 and ADR-003 remain authoritative for **how** panels render; [ADR-005](005-workshop-desktop-cork-layout-acceptance.md) documents **desktop cork acceptance** (bounds, resolve, overlap). This ADR is authoritative for **what** is grouped into a panel.
