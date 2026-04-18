# ADR-006: Workshop LCD — 3D tilt of the faux module vs peg-hook alignment

## Status

Accepted

## Date

2026-04-16

## Context

The workshop **LCD** card is a layered mock: PCB, slate bezel, top chrome, headline, and screen read as one **physical module** hung on the cork. Product direction calls for **`perspective` / `rotateX`** on that module so it feels mounted in depth (same on mobile and desktop).

Separately, **peg cork holes** and **corner screws** sit on an **orthogonal** lattice (`--peg-grid-px` / `gridPx` from [ADR-005](005-workshop-desktop-cork-layout-acceptance.md)). Card **positions** from `workshopPegboardPhysics` are grid-snapped. Users expect **metal mount hooks** (the “into the board” hardware) to **line up with that lattice**, not appear skewed relative to visible holes.

A **single** `rotateX` on the entire card subtree would project **hooks** in 3D as well, so their **drawn** position would no longer match orthographic peg-hole centers even when layout math is correct.

## Decision

1. **Tilted subtree** — Apply **`perspective` + `rotateX`** (and matching shadow treatment) to the **faux LCD unit only**: everything inside the tilt wrapper (**PCB, slate frame, top chrome, headline, screen**). This is the “product” that reads as tipped on the wall.

2. **Peg-aligned hardware** — Keep **bottom mount hooks** (and any future elements that must read as **pegs into cork holes**) **outside** that tilt wrapper in the DOM, as **siblings** of the tilt layer under `.lcd-hardware`, positioned in **flat** (non-3D-transformed) space against the peg card.

3. **Accepted trade-off** — The **bezel / slate outline** of the tilted module may **not** coincide orthogonally with cork hole centers in screen space; that is **acceptable**. The **hooks** are the visual and semantic anchor to the **peg lattice**. Physics and collision still use the full card rectangle as today.

4. **Variable `gridPx`** — Insets and chrome that must track the cork pitch (including everything **inside** the tilt layer except purely decorative blur) use **`--peg-grid-px`** so the module scales with [ADR-005](005-workshop-desktop-cork-layout-acceptance.md) / [ADR-001](001-workshop-mobile-pegboard-contract.md) when the strip picks a coarser grid.

5. **Tilt box vs bottom J-hooks (vertical)** — `.lcd-hardware__tilt` and `.lcd-shadow-base` use a **`bottom` inset** that reserves at least **half a peg cell** for the flat mount hooks **plus** an extra **`4/60 * --peg-grid-px`** lift so the tipped module (especially the **screen**) sits **slightly above** the hook foot — between flush and a larger gap (was `8/60`; tuned down for a subtler read). Hooks stay on the lattice; only the tilted subtree’s bottom edge moves up.

## Alternatives Considered

### No tilt on desktop (flat module everywhere)

- **Pros:** Orthographic alignment of the whole card with cork; simpler screenshots vs holes.
- **Cons:** Loses the depth metaphor on desktop; inconsistent with mobile.
- **Rejected** for product reasons once hooks are split (§1–2).

### Tilt only the screen, flat PCB + bezel + chrome + headline

- **Pros:** Stronger “glass only” metaphor.
- **Cons:** User preference is for **one** tipped assembly (PCB through screen); split adds compositing and shadow edge cases.
- **Rejected** in favor of tilting the full inner module (§1).

### Tilt including hooks (single transform root)

- **Pros:** One transform; simplest CSS.
- **Cons:** Hooks visually disagree with peg holes; undermines workshop metaphor.
- **Rejected.**

## Consequences

- **DOM contract:** `src/components/workshop/PegboardHardwareCards.tsx` — `LinkLcdCard` keeps **`.lcd-mount-hook`** elements **after** `.lcd-hardware__tilt`, not inside it. Changing that structure requires revisiting this ADR.
- **Styles:** `src/styles/workshop-pegboard.css` — tilt and transition live on **`.lcd-hardware__tilt`** (and paired **`.lcd-shadow-base`**); hook rules do not apply `rotateX`. Shared **`bottom`** on tilt + shadow: `calc(0.5 * var(--peg-grid-px) + var(--peg-grid-px) * 4 / 60)` (§5).
- **Visual regression:** Playwright captures under `tests/visual/workshop-pegboard.spec.ts` may show bezel vs hole phase offset when tilt is on; **assert hooks and layout**, not pixel-perfect orthographic overlap of the slate border with cork dots.
- **Cross-links:** [ADR-005](005-workshop-desktop-cork-layout-acceptance.md) (shared `gridPx`, packing); [ADR-001](001-workshop-mobile-pegboard-contract.md) (mobile scale and lattice).
- **See also:** [ADR-007](007-workshop-peg-card-drag-scale-transform-origin.md) — drag-time `whileDrag` **scale** uses `transform-origin: top center` so hooks stay visually peg-aligned to the cork lattice while dragging (orthogonal to this ADR’s tilt vs hook **split**, which applies at rest).

**Implementation:** `src/styles/workshop-pegboard.css` — `.lcd-hardware__tilt` and `.lcd-shadow-base` share the same inset box (`top` / `right` / `left` as before, **`bottom`** per §5), same `perspective` / `rotateX` on all layouts; **`.lcd-mount-hook`** remains a sibling of `.lcd-hardware__tilt` in `PegboardHardwareCards.tsx`.
