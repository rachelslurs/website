# ADR-003: Workshop frame chrome in the initial viewport

## Status

Accepted

## Date

2026-04-16

## Context

The workshop is presented inside a **TV-style frame** (bezel, title area, and **bottom navigation** with slab arrows). Engineers and users reported that, between **~320px and 768px** portal widths—and similarly at **wider breakpoints**—the **bottom arrows** sit **below the first paint**, so the **page or outer scroll** must move before navigation is visible.

That conflicts with basic **discoverability** and **orientation**: navigation is part of the product chrome, not optional content you “scroll into.” It is also easy to confuse with ADR-001’s **scroll-primary** rule (vertical pan wins over card drag on the **pegboard stack**). Scroll-primary governs **gesture arbitration inside the cork column**; it does **not** mean the **entire workshop** should grow until the **frame** is pushed off-screen.

Without a written rule, layout refactors (height snapping, min rows, padding) risk reintroducing “pegboard eats the viewport” regressions that visual tests keyed to `.pegboard-bg` alone may not catch.

## Decision

We adopt an explicit **frame chrome visibility** invariant for the workshop route:

1. **Initial viewport** — On first paint at common workshop widths (**320–768px** portal inner width per ADR-001, and **desktop** widths used in QA such as **1024px / 1280px**), the user must **not** need to scroll the **document** (or the workshop’s outer scroll owner, if not `document`) to see the **bottom frame navigation** (slab prev/next arrows and their container).

2. **Scroll ownership** — **Pegboard / slab content** may scroll **inside** a bounded region (middle of the layout) when content is taller than the available space. The **frame** (bezel + bottom bar) stays **within the visible viewport** via layout (for example **column flex** with `min-height: 0` on the scrollable middle, **sticky** bottom chrome, or an equivalent pattern). Exact implementation is not mandated by this ADR; the invariant is **chrome visible without outer scroll**.

3. **Relationship to ADR-001** — ADR-001 remains the source of truth for **mobile peg lattice**, **portal width**, **uniform scale**, and **touch-action: pan-y** on the pegboard strip. This ADR adds a **vertical budget** rule: the mobile stack’s **height** must be reconciled with the **frame** so that **ADR-001 §6** applies to **inner** scrolling, not to hiding **frame** controls below the fold.

## Alternatives Considered

### Rely on users to scroll the page to reach arrows

- **Pros:** Simplest layout; no flex/min-height discipline.
- **Cons:** Poor discoverability; breaks expectation that TV chrome is always present; conflicts with workshop metaphor.
- **Rejected.**

### Pin only the bottom bar with `position: fixed`

- **Pros:** Arrows always on screen regardless of content height.
- **Cons:** Must handle safe areas, overlap with content, and z-index; can fight existing frame styling.
- **Accepted as one possible implementation**, not required if column flex already keeps chrome in view.

### Assert this only with full-page screenshots in CI

- **Pros:** Strong regression signal.
- **Cons:** More flake (fonts, chrome pixels); higher maintenance than locator-only pegboard shots.
- **Deferred:** Prefer manual + targeted visual checks until a stable full-portal capture strategy exists (see plan Phase 4).

## Consequences

- Layout work on `Workshop*` / workshop CSS must treat **frame + scrollable body** as a **bounded-height** problem, not “content defines page height.”
- **Implementation (2026-04-16, amended 2026-04-20):** Workshop routes use `Main` **`fillViewportSlot`** (omit **`prose`** on `#main-content` so typography `prose` rules do not fight flex sizing) → `RisoBoardShell` **`fillViewportChain`** (**`h-svh`** + column flex — `min-h-dvh` alone can leave flex descendants with an indefinite height in WebKit) → `#main-content.workshop-viewport-slot` + `.workshop-page-stack` **`flex: 1 1 auto; min-height: 0`** so `WorkshopPegboard`’s **`.workshop-scroll--*`** peg scrollport receives a definite height and **inner** vertical / horizontal scroll wins. **Bottom slab nav / wood `portal-frame` / `portal-bezel` were removed**; multi-panel navigation is **scroll / swipe only** unless a future ADR reintroduces explicit controls.
- **`.workshop-pegboard-root` must be `display: flex; flex-direction: column; min-height: 0`** so the scroll strip’s **`flex: 1; min-height: 0`** is meaningful. A **block** root lets the peg region grow with content after hydration (`client:only`), restoring document scroll past the intended viewport.
- **Site chrome vertical budget:** Global padding and gaps on `RisoBoardShell` / `RisoNav` / `Footer` are tuned with **shared Tailwind spacing tokens** derived from `var(--spacing)` (see `tailwind.config.cjs` shell keys). Adjusting those tokens is an allowed way to reclaim height for the workshop column without one-off per-page padding.
- **Reading typography (non-workshop):** Where `prose` is allowed and how it relates to `theme.extend.typography` vs `riso.css` is documented in [ADR-009](009-reading-typography-prose-and-theme.md); it **reiterates** this ADR’s workshop **`prose` exclusion** so layout and editorial typography stay decoupled.
- **Regression tests:** `tests/visual/workshop-pegboard.spec.ts` — describe **Workshop peg viewport (ADR-003)** asserts `toBeInViewport` on the peg **scroll strip** and the first `.pegboard-bg` at standard widths, plus a **375×500** short-viewport smoke; describe **Workshop page with site chrome (viewport)** asserts main nav + `contentinfo` footer are in view and captures **`workshop-page-with-chrome--w*.png`** (full viewport: site chrome + workshop). Run `npm run test:visual`.
- **Manual QA:** At **320, 375, 430, 768, 1024, 1280** (or the project’s standard set), confirm the **peg scroll region** and first slab read correctly **without** outer document scroll on load.
- **ADR-001** should be read together with this ADR for mobile: lattice rules (001) + chrome visibility (003).
- **Desktop cork “fits”** (bounds, overlap, screws during resolve) is documented in [ADR-005](005-workshop-desktop-cork-layout-acceptance.md).
- Supersede or amend this ADR if the workshop shell changes materially (e.g. dedicated panel controls return).
