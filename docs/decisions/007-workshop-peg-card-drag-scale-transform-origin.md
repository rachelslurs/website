# ADR-007: Workshop peg cards — drag `scale` uses top-center `transform-origin`

## Status

Accepted

## Date

2026-04-16

## Context

Workshop **hardware peg cards** (clipboard, LCD, blueprint) use Framer Motion on `PegCard`: `whileDrag` applies a slight **`scale`** lift (clipboard `1.01`, LCD `1.05`, blueprint `1.02`) on the same `motion.div` that carries **`x` / `y`** grid position and drag. That reads as “picked up” feedback.

With the **browser default** `transform-origin` (`50% 50%`), growth is **symmetric around the card’s geometric center**: the **top** of the card (where **hooks** and **top-edge hardware** sit) moves **up** as much as the bottom moves down. During drag, that made the **metal / hooks** feel **decoupled** from the **orthogonal cork peg lattice** behind the card, even though layout math and [ADR-006](006-workshop-lcd-tilt-vs-peg-hook-alignment.md) keep hooks peg-correct when idle.

Product intent: while dragging, the card should still read as **hung from the peg row**; scale is decorative, not a reinterpretation of where the piece meets the board.

## Decision

Set **`transform-origin: top center`** on **`.peg-card--drag`** in `src/styles/workshop-pegboard.css` so `whileDrag` **scale** expands **downward from the top edge midpoint** of the card box. Hooks and top chrome stay visually **anchored** to the peg row; the lower portion of the card absorbs most of the size change.

`whileDrag` values and drag behavior stay in **`src/components/workshop/PegCard.tsx`**; only the **origin** of the composed transform is fixed in CSS.

## Alternatives Considered

### Keep default center origin (`50% 50%`)

- **Pros:** No extra rule; mathematically “neutral” scale.
- **Cons:** Top edge (hooks) shifts in screen space relative to cork holes during drag; undermines the workshop metaphor.
- **Rejected** after visual review.

### Origin at each hole (per-card `%` / `px` from `gridPx`)

- **Pros:** Maximum fidelity to a single peg point.
- **Cons:** Clipboard has a side clip, not symmetric top holes; multiple hardware shapes would need branching or custom properties.
- **Deferred:** Top center is a single rule for all three hardware types and matched the desired look.

### Inner `motion.div` scales, outer only translates

- **Pros:** Explicit separation of drag translation vs lift scale.
- **Cons:** More DOM / style wiring for marginal gain if top-center on the outer node suffices.
- **Rejected** for now; can revisit if nested transforms (e.g. LCD tilt) ever fight with drag scale.

## Consequences

- **Styles:** `src/styles/workshop-pegboard.css` — `.peg-card--drag` includes `transform-origin: top center` and a short comment tying it to Framer `whileDrag` scale.
- **Behavior:** Only **draggable** cards use `.peg-card--drag`; static / mobile-stack-only paths are unchanged.
- **Cross-links:** [ADR-006](006-workshop-lcd-tilt-vs-peg-hook-alignment.md) (hooks vs tilt); [ADR-005](005-workshop-desktop-cork-layout-acceptance.md) (grid / cork); [ADR-001](001-workshop-mobile-pegboard-contract.md) (mobile contract). Drag scale does not change **physics** or **snap** math in `workshopPegboardPhysics`.
- **Visual regression:** Mid-drag scale is not asserted in static Playwright shots; manual drag check remains the primary verification.

**Implementation:** `PegCard.tsx` — `whileDrag` scale unchanged. `workshop-pegboard.css` — `.peg-card--drag { transform-origin: top center; }`.
