# ADR-008: Riso board shell — all page chrome stays inside the inner `board` column

## Status

Accepted

## Date

2026-04-18

## Context

Pages that use `RisoBoardShell` present content on a **paper-like board** with padding and responsive gaps. Decorative treatments (for example **tape** along sheet edges) must read as **on the paper**, inside the same frame as navigation and main content. When art bleeds past that frame (especially at **narrow widths**), it breaks the metaphor and fails visual regression expectations for the work / design-pro style pages.

The **normative layout box** is the inner column that already wraps `RisoNav`, the main slot, and `Footer` — not the outer `board-page-outer` wrapper (which adds its own `p-4` / `max-sm:p-2` margin to the viewport).

## Decision

1. **No page-owned UI** (content, decoration, pseudo-elements, or positioned children that are part of the page design) may **visually extend outside** the inner board column in `RisoBoardShell.astro`.

2. **Canonical selector / classes** — That column is the `div` whose `class:list` includes, at minimum, the following Tailwind utilities (verbatim order in source may differ; **the file is source of truth**):

   `board relative flex flex-col gap-8 px-10 max-lg:py-6 lg:pb-10 lg:pt-8 max-sm:gap-5 max-sm:p-4`

   Optional additional classes on the same node (for example `min-h-0 flex-1` when `fillViewportChain` is true) do not change the rule: **everything meant to read as part of the board stays inside this node’s layout and overflow discipline**.

3. **Grain and blobs** — The absolutely positioned `inset-0` decoration layer with `overflow-hidden` is **intentionally** clipped to this same inner board; new decoration should follow the same **bounded** pattern unless explicitly re-decided.

4. **Implementation guidance** — If a treatment would overflow at small breakpoints, **scale down**, **inset**, or **clip** within the board column rather than expanding the board or letting tape/chrome spill into the outer wrapper’s padding zone.

## Alternatives Considered

### Allow decorative bleed into `board-page-outer` padding

- **Pros:** More room for dramatic tape/overlap effects toward the viewport edge.
- **Cons:** Inconsistent frame across pages; harder to reason about safe area; visual tests and “margin” language become ambiguous.
- **Rejected.**

### Define bounds only in pixels/Figma without tying to this DOM node

- **Pros:** Design-tool centric.
- **Cons:** Drifts from implementation; agents and engineers need a single DOM contract.
- **Rejected** in favor of anchoring to `RisoBoardShell`’s inner `board` column.

## Consequences

- **DOM contract:** `src/components/RisoBoardShell.astro` — the inner `div` with the `board` + flex column + padding classes above is the **maximum extent** for page-local visuals tied to the riso board metaphor. Changing that structure or overflow behavior requires revisiting this ADR.
- **New decoration:** Prefer children of that column (or its existing `overflow-hidden` overlay) so bounds stay obvious in the tree.
- **Visual regression:** Site-level captures that include this shell (for example `tests/visual/site-pages.spec.ts` **work-design-pro** viewports) should remain consistent with **no tape or sheet edge chrome** crossing outside that padded board frame.

## Follow-ups (TODO)

Current baselines still show **tape bleeding past the inner board frame** at narrow widths. After the layout/CSS fix lands, refresh Linux baselines with the repo’s Docker Playwright scripts (see `.cursor/rules/visual-regression-docker.mdc`).

- [ ] Fix implementation so tape stays inside the inner `board` column; then update snapshots:
  - `tests/visual/__screenshots__/site-pages.spec.ts/work-design-pro--w375.png`
  - `tests/visual/__screenshots__/site-pages.spec.ts/work-design-pro--w430.png`
  - `tests/visual/__screenshots__/site-pages.spec.ts/posts-index--w320.png`
