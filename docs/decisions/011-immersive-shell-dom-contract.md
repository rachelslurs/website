# ADR-011: Immersive shell — DOM contract for peg field, reading column, and decorative layers

## Status

Accepted

## Date

2026-04-20

## Context

[ADR-010](010-site-wide-immersive-pegboard-shell.md) calls for a **viewport-wide peg field** and **reading measure inside full width**, while [ADR-009](009-reading-typography-prose-and-theme.md) keeps **`prose` off workshop flex shells** and on **reading roots** for long-form pages.

[ADR-008](008-riso-board-inner-content-bounds.md) previously named the **inner `board` column** as the maximum extent for page-owned chrome and clipped decoration (grain, blobs). That rule **still applies to tape, sheet edges, and nav/footer chrome**: those remain **inside the inner `board` column** unless a future amendment explicitly moves them.

ADR-010’s tension (“viewport peg field” vs “inner board only”) is resolved here by **splitting layers**:

1. **Peg field (outer shell)** — The outer `board-page-outer` wrapper may span the **full content width of the viewport** (no `max-w-[1200px]` cap) on routes that opt into the **immersive peg stage** (pilot: workshop). It continues to own **outer padding** (`p-board-outer` / responsive variants) so cork and hardware are not flush against the physical screen edge unless we deliberately remove padding in a later iteration.

2. **Reading column** — Long-form pages keep **`prose` / `prose-analog`** on `#main-content` (or nested reading roots) per ADR-009. The immersive outer shell does **not** add `prose` to the flex chain.

3. **Decorative overflow (grain, blobs)** — Remain on the **existing** absolutely positioned, `overflow-hidden` layer **inside the inner `board` column** (same node as today in `RisoBoardShell.astro`), so they stay clipped with nav and footer. **Tape** and other page-owned art must still obey ADR-008’s inner-column rule until a dedicated design moves them.

## Decision

1. **Opt-in immersive peg stage** — `RisoBoardShell` accepts an explicit prop (e.g. **`immersivePegStage`**) set by `Main` for **pilot routes only** (initially `/workshop` and paginated `/workshop/*`). When true, the outer wrapper **drops `mx-auto max-w-[1200px]`** and uses **`w-full max-w-none`** so the peg metaphor can use **wide monitors** without an artificial 1200px cap.

2. **Non-pilot routes** — Default remains **centered max-width** outer shell (ADR-008-friendly) until a later rollout wave ([responsive plan Phase 8.7](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md)) opts them in.

3. **Z-order (nav, footer, peg stack)** — Unchanged from current implementation: **global nav** and **footer** sit in the inner board column’s flex stack above the main slot; the **grain/blob overlay** uses `z-[100]` with `pointer-events-none`; the **content stack** uses `z-[110]`. The **workshop pegboard** slab chrome and portal obey [ADR-003](003-workshop-frame-chrome-initial-viewport.md) and [ADR-001](001-workshop-mobile-pegboard-contract.md) for scroll ownership and mobile lattice.

4. **`transition:persist` on decoration** — The existing `transition:persist="riso-board-decoration"` scope stays **grain + blobs only** (inline comment in shell). Full-shell persistence is **not** required for ADR-011 and remains off to avoid breaking in-page navigation.

## Relationship to prior ADRs

| ADR | Change under ADR-011 |
|-----|----------------------|
| **008** | **Amended in scope:** outer `board-page-outer` max-width rule is **relaxed only when `immersivePegStage` is true**. Inner `board` column remains the bound for tape, grain, blobs, and nav/footer chrome. |
| **003 / 001** | **No change** — workshop `fillViewportChain` + `h-svh` + inner scroll remain mandatory where the TV frame applies. |
| **009** | **No change** — workshop `main` stays **`not-prose`** (`workshop-viewport-slot`). |

## Consequences

- **Pilot flag** — Workshop (and future immersive routes) must set **`immersivePegStage`** explicitly; accidental full-bleed on dense reading pages is avoided.
- **Visual regression** — Expect **wide-viewport** screenshot diffs for workshop when baselines were captured at capped width; refresh per [visual-regression-docker.mdc](../../.cursor/rules/visual-regression-docker.mdc).
- **Rollout** — Other routes adopt the same prop in a **separate wave** after pilot verification (see plan Task 8.7).

## Verification

- Grep `immersivePegStage` and `board-page-outer` in `RisoBoardShell.astro` / `Main.astro`.
- Manual: `/workshop` at **≥1280px** width shows board content using **full width** (no 1200px cap); narrow widths still show outer padding.
- Workshop: bottom frame nav remains **in first paint** without document scroll (ADR-003 Playwright coverage).

## See also

- [ADR-010: Site-wide immersive pegboard](010-site-wide-immersive-pegboard-shell.md)
- [ADR-012: Workshop URL → scene (pagination)](012-workshop-url-scene-pagination.md)
