# ADR-005: Workshop desktop cork — layout acceptance vs screws

## Status

Accepted

## Date

2026-04-16

## Context

Desktop panels pick a **snapped cork** size (`innerW` × `innerH`, multiples of `gridPx`) and run deterministic pack seeds, then a **resolver** that nudges cards so they do not intersect **corner screw hit regions** or each other’s **full card rectangles**. When debugging (`?workshopDebugCork=1`), engineers see messages about **bounds**, **overlap**, and **“full card rect”**; without a written contract it is easy to assume `layoutValidWithGrid` also checks screws, or to treat **Σ card heights** as a sufficient vertical budget (it is not, except in a **single-column** layout).

The workshop can show **several horizontal panels** in one strip. A **product** goal is that those panels must **not all read as the same template** (e.g. case study / clipboard always in the **rightmost** column because a single greedy seed always won first). Layout choice is therefore not only “first seed that fits” but includes **cross-panel diversity** and **left bias for the clipboard** when multiple layouts are physically valid at the same `gridPx`.

**Peg spacing:** The **distance between peg holes** (`--peg-grid-px` / `gridPx`) must **not change from one desktop board to the next** in the same strip — one **shared** `gridPx` (and matching snapped cork size) is chosen from all panels’ packing feasibility so every `.pegboard-bg--desktop-cork` uses the same lattice.

## Decision

1. **Pipeline (normative)** — For desktop, **`gridPx` and snapped `innerW` × `innerH` are chosen once per strip** (`pickSharedDesktopPackGrid`): the **coarsest** candidate in `DESKTOP_PACK_GRIDS` for which **every** panel passes strict `packDesktopPanelAtGrid`; otherwise fall back to **`30`** for all. Each panel then runs seed selection / clipboard-`x` preference **only at that shared triple** (see JSDoc on `packDesktopPanelAtGrid`). **Mobile** keeps a fixed `PEG_GRID` lattice (ADR-001); this shared rule is **desktop strip** only.

   For a candidate `(gridPx, innerW, innerH)` **per panel** at that shared triple:
   - Build several **seed** layouts (column-first with clipboard last in two non-clipboard orders — `panelIndex` swaps try order; column-first tallest-first; row-major variants with `panelIndex` rotating fallback order). Column-first seeds stack within a column at **`y + h`** (no extra vertical `grid` seam); a new column starts when **`y + h > innerH`**. Row-major seeds use horizontal/row gutters as implemented in `initialPackPositionsWithGrid`.
   - For **each** seed, run **`resolveLayoutAfterResizeWithGrid`**, then require **`allFit`** and **`layoutValidWithGrid`** (see below). **Every** seed that passes is a **candidate** layout.
   - **Choose one candidate** (do not stop at the first passing seed):
     - Compute the **minimum `x`** of all **clipboard** cards (left edge on the cork) for each candidate.
     - Prefer candidates with **globally smallest** clipboard `x` so the case study can appear in the **left column** whenever *any* valid seed places it further left than a clipboard-last column that only fit by opening new columns to the right.
     - Among candidates tied on that minimum `x`, pick using a **deterministic hash** of **`desktopPanelIndex`**, cork dimensions, `gridPx`, and item ids so **adjacent panels are not forced to look identical** when several layouts are equally “leftmost.”
   - **Why clipboard was stuck on the right** (prior behavior): **Clipboard-last column-first** walks non-clipboard cards first, then the case study. When each card needs its **own column** (tight `innerH`), the clipboard is **iterated last** → **rightmost column**. **Clipboard-last row-major** walks left-to-right → **rightmost horizontal slot**. Without considering **other** passing seeds, the layout looked the same on every panel. **Selection among all valid seeds** fixes that when a seed exists with a smaller clipboard `x`.

2. **`layoutValidWithGrid` scope** — It asserts only:
   - Each card’s **full pegboard rectangle** lies inside `innerW` × `innerH`.
   - **No two cards’ full rectangles overlap** (axis-aligned intersection).

   It does **not** re-evaluate screw holes. Screw feasibility is enforced **during** resolve via `collidesWithGrid`. If the resolver cannot clear screws without pushing a card past the cork, **`allFit` is false** (typically the symptom in logs: `outOfBounds` on one id).

3. **When `allFit` is true but `layoutValidWithGrid` is false** — This means **at least two cards still overlap on their full `w×h` rects** after resolve (unexpected if resolve is sound, but the check is the backstop). It is **not** described as “screw collision” in the acceptance layer; screws are handled earlier in `collidesWithGrid`.

4. **Vertical space intuition (necessary conditions, not sufficient)** — Let `hᵢ` be each card’s snapped height at the current `gridPx`, and `innerH` the cork height in px.
   - **Any** layout needs **`maxᵢ(hᵢ) ≤ innerH`** (tallest card must fit).
   - A **single vertical column** (no side-by-side cards) additionally needs **`Σᵢ hᵢ ≤ innerH`** (stacked heights must fit). This matches the **`columnFirst`** seed when it succeeds without horizontal packing.
   - **Row-major** or mixed layouts need **2D** feasibility: widths must fit per row as well (`innerW` budget). There is no single scalar like Σh that proves a row+column arrangement fits; the code’s truth is the seed + resolve + `allFit` + `layoutValidWithGrid` checks above.

5. **Case study clipboard clamp vs `gridPx`** — The strip may pick a **coarser** `gridPx` than 60px, so clipboard **card** width/height shrink. The metal **clamp** (spec SVG), masonite plate, and peg-hook mock must **scale down by the same amount as the clipboard body**—no legacy fixed-size artboard (for example 240×100px) that stays large while the card shrinks. Normative approach: SVG uses a fixed `viewBox` only and a **constant fraction of card width** (currently **80%**—the original 240px art on a 300px-wide `5×60` card), with `height: auto`; vertical offsets and hook size use **`calc(... * var(--peg-grid-px))`** so chrome stays on the **same lattice** as cork holes. **`CLIPBOARD_HOOK_RING_CENTER_Y_FRAC_OF_CARD_H`**, **`CLIPBOARD_MASONITE_TOP_FRAC_OF_CARD_H`**, and related layout in `workshopPegboardPhysics.ts` stay in sync with `hitBoxForCollisionWithGrid`; Vitest in `workshopPegboardPhysics.test.ts` guards drift. **Mobile** inherits the same product rule via design-space dimensions plus uniform surface scale ([ADR-001](001-workshop-mobile-pegboard-contract.md) §8).

## Alternatives Considered

### Fold screw checks into `layoutValidWithGrid`

- **Pros:** One function names “valid.”
- **Cons:** Duplicates geometry already in `collidesWithGrid`; easy to drift.
- **Rejected.**

### Reject panels using only `Σ hᵢ ≤ innerH`

- **Pros:** Simple mental model.
- **Cons:** False positives (side-by-side cards use width, not sum of heights) and false negatives (column stack can fail for screw nudges even when Σh barely fits).
- **Rejected** as the acceptance rule; kept only as **debug intuition** (see `workshopDebugCork` logs).

### “First valid seed wins” only

- **Pros:** Slightly less CPU; trivial to read.
- **Cons:** Clipboard and shorts **always** follow one template whenever that seed validates first (e.g. clipboard **always** right column / right slot across the strip).
- **Rejected** in favor of **evaluating all seeds** and **preferring smaller clipboard `x`** plus hashed tie-breaks for strip diversity.

## Consequences

- **Implementation:** `src/utils/workshopPegboardPhysics.ts` — `resolveLayoutAfterResizeWithGrid`, `collidesWithGrid`, `packDesktopPanelAtGrid` (multi-seed + **clipboard-`x` preference** + hashed tie-break), `layoutValidWithGrid`. **`desktopPanelIndex`** is passed from `WorkshopPegboard` → `PegboardPanelView` for the hash.
- **Cork size / height budget:** Still governed by [ADR-003](003-workshop-frame-chrome-initial-viewport.md) (viewport + portal padding); this ADR documents **what “fits” means** once `innerH` is chosen.
- **Debug:** Opt-in logs (`?workshopDebugCork=1` or `localStorage.workshopDebugCork = "1"`) may include `verticalBudgetHint` (max/sum of `h`, `innerH`) and `overlappingPair` when overlap is the failure mode.
- **Tests:** Extend `workshopPegboardPhysics.test.ts` when changing acceptance or resolver semantics (includes **clipboard hardware vs peg lattice** tests for §5).
