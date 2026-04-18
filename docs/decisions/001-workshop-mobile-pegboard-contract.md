# ADR-001: Workshop mobile pegboard layout contract

## Status

Accepted

## Date

2026-04-15

## Context

The workshop pegboard uses a different presentation on narrow portals than on desktop: a fixed design grid, optional uniform downscaling, and dimensions shared across all mobile slabs. Without a written contract, refactors (for example consolidating scale to one owner or simplifying physics) risk silently breaking alignment, drag math, or cross-panel consistency—mistakes that are expensive to reverse and that visual tests alone may not fully describe.

Requirements that drove this decision:

- **One lattice everywhere on mobile** — Navigating between slabs must not change grid pitch or card geometry in incompatible ways.
- **Portal truth, not viewport truth** — Layout breakpoints and slot width must follow the **portal inner box** (what the user sees inside the TV frame), not `window.innerWidth`, so nested layouts and future shells do not drift.
- **Predictable physics** — Card positions and collisions are computed in design space; any `scale` applied for display must stay reconciled with that model.
- **Discoverability** — Humans and agents need a single place to read intent and rejected alternatives so the same debate is not re-opened ad hoc.

## Decision

We treat the mobile pegboard as governed by an explicit **layout contract**: shared `MobileScalePresentation`, portal-based widths, `scale` capped at 1, height snapped to the peg grid with a minimum row count, design-space interaction rules, and coordinated vertical scroll vs drag. The normative rules are listed below; code should match them unless this ADR is superseded.

### Contract (normative)

1. **Layout mode** — Mobile pegboard UI is active when the workshop root is in `data-pegboard-layout="mobile"` (portal inner width ≤ 768px, rounded from `ResizeObserver`). Width and scale logic use **portal inner width** (`layoutWidth` / `portalLayout.w`), not raw `window.innerWidth`, unless a requirement explicitly refers to the full viewport.

2. **Width budget** — **Slot width** is the horizontal space available to the scaled pegboard in the mobile column (`MobileScalePresentation.slotContentW` from `WorkshopPegboard`, otherwise `mobileInnerW(layoutWidth)`). **Design cork width** (`designContentW`) is at least `max(slotContentW, max card width across all panels)`, snapped **up** to `PEG_GRID` (60px) steps, plus `PEGBOARD_BORDER_OUTSET` (16px) for framed outer width. **All slabs** in a session share the same `slotContentW`, `designContentW`, and `scale` so the lattice never disagrees between panels.

3. **Scale** — `scale = min(1, slotContentW / designOuterW)` where `designOuterW = designContentW + PEGBOARD_BORDER_OUTSET`. There is **no upscaling** above 1. There must remain **one authoritative `scale`** for the mobile stack (current implementation: `WorkshopPegboard` computes `MobileScalePresentation`; `.pegboard-mobile-scale-surface` applies `transform: scale(...)`).

4. **Height** — Cork content height follows stacked cards on `.pegboard-mobile-stack`, snapped **up** to `PEG_GRID` rows, with a floor of `MOBILE_PEGBOARD_MIN_GRID_ROWS * PEG_GRID` (3×60px). Visual slot height is `(snappedContentH + PEGBOARD_BORDER_OUTSET) * scale`.

5. **Interaction** — Drag, commit, and collision run in **design space** (unscaled grid coordinates). The user sees the scaled surface; pointer or motion input must map to design coordinates (or explicitly compensate for `scale`). If `scale < 1`, do not silently shrink effective hit targets below what physics assumes without a documented rule (for example minimum scale or an inverse-scaled interaction layer).

6. **Scroll vs drag** — The mobile scroll strip uses `touch-action: pan-y` so vertical scroll wins; peg drag must not break that without an explicit exception documented in code or a follow-up ADR.

7. **Frame chrome vs inner scroll (see ADR-003)** — §6 applies to **gesture handling on the pegboard column**, not to hiding **workshop frame** controls. Bottom **slab navigation** (arrows) must remain **visible in the initial viewport** without scrolling the document; when the peg stack is taller than the middle region, **that region** scrolls. Normative detail: [ADR-003: Workshop frame chrome in the initial viewport](003-workshop-frame-chrome-initial-viewport.md).

8. **Case study clipboard metal clamp** — The case-study card’s **metal clamp** (spec SVG), masonite band, and peg-hook mock are part of the **same design-space card** as the papers (`5×PEG_GRID` × `8×PEG_GRID` before any mobile `scale`). The clamp must **never** use a fixed pixel width/height that outruns the card body: lateral scale tracks the card (historically **80%** of card width for the spec art—240px on a 300px-wide clipboard at 60px grid—so the clamp stays subordinate to the board, not edge-to-edge). Vertical chrome stays tied to `--peg-grid-px`. When §3 applies `transform: scale(...)` on the mobile surface, the whole card—including the clamp—scales together. Desktop uses a variable strip `gridPx`; the same “clamp tracks card + lattice” rule is normative there too ([ADR-005](005-workshop-desktop-cork-layout-acceptance.md) §5).

## Alternatives Considered

### Per-slab independent `designContentW` and `scale`

- **Pros:** Each slab could tune to its own card set only.
- **Cons:** Different slabs would disagree on grid pitch and card sizes when the user moves between panels; shared `MobileScalePresentation` would no longer hold.
- **Rejected:** Inconsistent with a single workshop “floor” and would complicate or break shared physics and visual continuity.

### Upscale when the slot is wider than the design board (`scale > 1`)

- **Pros:** Could fill horizontal space on large phones without letterboxing the cork.
- **Cons:** Blurs the “design board” reference, makes physics and hit targets depend on viewport in harder-to-test ways, and interacts poorly with fixed `PEG_GRID` tooling.
- **Rejected:** We cap `scale` at 1 to keep a stable design reference and predictable behavior.

## Consequences

- Visual regression and manual QA should cover mobile at and below the portal breakpoint, including narrow slots where `scale < 1`.
- Refactors that move where `scale` is applied must preserve this contract or **supersede** it with a new ADR that references this number. **Do not delete** superseded ADRs; they keep historical context.
- **Implementation touchpoints:** `WorkshopPegboard.tsx` (`mobileScalePresentation`, portal layout), `PegboardPanels.tsx` (`PegboardPanelMobile`, scale slot/surface), `pegboardDimensions.ts`, `pegboardTypes.ts`, `workshop-pegboard.css` (mobile scale + clipboard clamp §8), `PegboardHardwareCards.tsx`.
- **Types:** `MobileScalePresentation` references this ADR in JSDoc so the contract stays discoverable from the type definition.
- **Frame chrome:** Vertical layout must also satisfy [ADR-003](003-workshop-frame-chrome-initial-viewport.md) (arrows visible without outer scroll); ADR-001 §7 cross-references it.
