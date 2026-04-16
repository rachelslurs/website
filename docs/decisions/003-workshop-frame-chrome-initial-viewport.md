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
- **Manual QA:** At **320, 375, 430, 768, 1024, 1280** (or the project’s standard set), confirm arrows visible **without** outer scroll on load.
- **ADR-001** should be read together with this ADR for mobile: lattice rules (001) + chrome visibility (003).
- Supersede or amend this ADR if the workshop shell changes materially (e.g. arrows move to a different region).
