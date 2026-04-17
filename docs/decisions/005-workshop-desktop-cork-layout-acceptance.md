# ADR-005: Workshop desktop cork — layout acceptance vs screws

## Status

Accepted

## Date

2026-04-16

## Context

Desktop panels pick a **snapped cork** size (`innerW` × `innerH`, multiples of `gridPx`) and run deterministic pack seeds, then a **resolver** that nudges cards so they do not intersect **corner screw hit regions** or each other’s **full card rectangles**. When debugging (`?workshopDebugCork=1`), engineers see messages about **bounds**, **overlap**, and **“full card rect”**; without a written contract it is easy to assume `layoutValidWithGrid` also checks screws, or to treat **Σ card heights** as a sufficient vertical budget (it is not, except in a **single-column** layout).

## Decision

1. **Pipeline (normative)** — For a candidate `(gridPx, innerW, innerH)`:
   - Seed **grid-snapped** `(x, y)` via several deterministic orderings in `packDesktopPanelAtGrid` (see JSDoc there): notably **`columnFirstHeightDesc`** (tallest first, so a work **clipboard** can anchor column 1 instead of always being iterated last), **`columnFirst`** with clipboard last (shorts stacked above the case study when that column fits), **`rowMajorPanelOrder`** (panel input order so work can sit **left**), then clip-last row-major and row-height variants. The **`columnFirst`** seed stacks the next card at **`y + h`** of the previous (no extra vertical `grid` seam between cards in the same column); a new column starts when **`y + h > innerH`** for the next placement. Row-major seeds still use horizontal/row gutters as before.
   - Run **`resolveLayoutAfterResizeWithGrid`**, which repeatedly shifts a card while `collidesWithGrid` is true. That predicate is true if the placement is **out of cork bounds**, overlaps a **corner screw hit box** (`hitBoxForCollisionWithGrid` vs `boardScrewRectsWithGrid`), or overlaps another card’s **full `w×h` rectangle**.
   - Accept the seed only if **`allFit`** (every resolved position keeps the card’s full rect inside the cork) **and** **`layoutValidWithGrid`** (see below).

2. **`layoutValidWithGrid` scope** — It asserts only:
   - Each card’s **full pegboard rectangle** lies inside `innerW` × `innerH`.
   - **No two cards’ full rectangles overlap** (axis-aligned intersection).

   It does **not** re-evaluate screw holes. Screw feasibility is enforced **during** resolve via `collidesWithGrid`. If the resolver cannot clear screws without pushing a card past the cork, **`allFit` is false** (typically the symptom in logs: `outOfBounds` on one id).

3. **When `allFit` is true but `layoutValidWithGrid` is false** — This means **at least two cards still overlap on their full `w×h` rects** after resolve (unexpected if resolve is sound, but the check is the backstop). It is **not** described as “screw collision” in the acceptance layer; screws are handled earlier in `collidesWithGrid`.

4. **Vertical space intuition (necessary conditions, not sufficient)** — Let `hᵢ` be each card’s snapped height at the current `gridPx`, and `innerH` the cork height in px.
   - **Any** layout needs **`maxᵢ(hᵢ) ≤ innerH`** (tallest card must fit).
   - A **single vertical column** (no side-by-side cards) additionally needs **`Σᵢ hᵢ ≤ innerH`** (stacked heights must fit). This matches the **`columnFirst`** seed when it succeeds without horizontal packing.
   - **Row-major** or mixed layouts need **2D** feasibility: widths must fit per row as well (`innerW` budget). There is no single scalar like Σh that proves a row+column arrangement fits; the code’s truth is the seed + resolve + `allFit` + `layoutValidWithGrid` checks above.

## Alternatives Considered

### Fold screw checks into `layoutValidWithGrid`

- **Pros:** One function names “valid.”
- **Cons:** Duplicates geometry already in `collidesWithGrid`; easy to drift.
- **Rejected.**

### Reject panels using only `Σ hᵢ ≤ innerH`

- **Pros:** Simple mental model.
- **Cons:** False positives (side-by-side cards use width, not sum of heights) and false negatives (column stack can fail for screw nudges even when Σh barely fits).
- **Rejected** as the acceptance rule; kept only as **debug intuition** (see `workshopDebugCork` logs).

## Consequences

- **Implementation:** `src/utils/workshopPegboardPhysics.ts` — `resolveLayoutAfterResizeWithGrid`, `collidesWithGrid`, `packDesktopPanelAtGrid`, `layoutValidWithGrid`.
- **Cork size / height budget:** Still governed by [ADR-003](003-workshop-frame-chrome-initial-viewport.md) (viewport + portal padding); this ADR documents **what “fits” means** once `innerH` is chosen.
- **Debug:** Opt-in logs (`?workshopDebugCork=1` or `localStorage.workshopDebugCork = "1"`) may include `verticalBudgetHint` (max/sum of `h`, `innerH`) and `overlappingPair` when overlap is the failure mode.
- **Tests:** Extend `workshopPegboardPhysics.test.ts` when changing acceptance or resolver semantics.
