# ADR-010: Site-wide immersive pegboard — persistent stage, URL-driven scenes, full-field board

## Status

Accepted

## Date

2026-04-20

## Context

### Problem statement (How might we)

**How might we** present the whole site as **one continuous pegboard experience**—visual and structural (light, shadow, stacked depth)—so the board feels **immersive at large viewports** instead of shrinking inside a **centered max-width shell**, while route changes feel like **objects animating on the same wall** rather than a different pegboard per page?

Today, workshop and other board pages are wrapped in patterns such as **`board-page-outer mx-auto w-full max-w-[1200px] …`** ([`RisoBoardShell.astro`](../../src/components/RisoBoardShell.astro)). That **caps the field** the peg metaphor can occupy as width grows, which works against immersion and makes the pegboard feel **smaller** as the screen gets wider.

Separately, **[ADR-008](008-riso-board-inner-content-bounds.md)** defines the **inner `board` column** as the normative box for page chrome and decoration so tape and sheet edges stay coherent. **[ADR-003](003-workshop-frame-chrome-initial-viewport.md)** and **[ADR-001](001-workshop-mobile-pegboard-contract.md)** govern workshop **viewport height**, **scroll ownership**, and **mobile peg lattice**. **[ADR-009](009-reading-typography-prose-and-theme.md)** keeps **`prose`** on **reading roots**, not on flex-heavy workshop shells.

None of the above yet states a **product-level** rule for: **viewport-wide peg field**, **URL as authoritative durable board state**, or **cross-route shell persistence**.

### Success (from product discussion)

- **Cohesion** — One site reads as one workshop wall, not unrelated templates.
- **Fewer layout hacks** — One shell contract instead of per-route max-width exceptions.
- **Extensibility** — New routes “hang new items” instead of reinventing frame math.
- **Shareability** — **URL encodes durable scene state** (see Decision §2), not only which top-level page loaded.

### Tension to resolve with prior ADRs

- **ADR-008** optimizes for a **paper column** as the maximum extent of page-local visuals. A **full-bleed pegboard** goal may **replace or split** that contract (e.g. **viewport = peg field**, **inner column = reading measure only**). This ADR does not silently repeal ADR-008; **implementation planning must explicitly amend or supersede** its bounds once the new DOM/lighting contract is chosen.
- **ADR-003** invariants (frame chrome visible without outer scroll on first paint) remain **non-negotiable for workshop-like chrome** unless a follow-up ADR changes workshop structure.

## Decision

Engineering and design work should align to the following **normative** rules:

1. **Persistent pegboard stage** — Users experience **one stable pegboard “wall”** (holes, lighting, depth grammar) across routes. **Background and peg field** may extend **to the viewport**; the site should not rely on **`max-w-[1200px]`** (or equivalent) on the **outermost board shell** as the primary way to create intentionality at wide widths.

2. **URL-driven durable scenes** — **Durable** board arrangement (active stack, open panel, primary “front” object, project slug, etc.) is **derived from the URL** (path segments and/or stable query keys). **Bookmarks and shared links** reproduce the **same scene**. **Ephemeral** UI (hover, in-progress drag) need not appear in the URL unless we later choose to.

3. **Route transitions = item layer** — When navigating, **prefer animating the item/content layer** (mount/unmount or cross-fade of keyed subtrees) over **replacing the entire pegboard chrome** as if each route were a different skin.

4. **Reading measure inside full width** — Long-form content follows **[ADR-009](009-reading-typography-prose-and-theme.md)**: **`prose`** (or equivalent measure) on a **bounded reading root inside** the immersive shell—not `prose` on the full viewport chain—so line length stays intentional while the **scene** stays wide.

5. **Scope** — **Literally every route** participates in the immersive pegboard experience **as the default**; workshop density and interaction vocabulary are **allowed to converge** with the homepage and other key surfaces over time.

6. **Scroll and flex discipline** — Site-wide adoption **must** preserve explicit **scroll ownership** and **`min-height: 0` flex chains** where the shell uses viewport height (per ADR-003 patterns). “Immersive” must not reintroduce **double outer scroll** or **chrome pushed below the fold** on first paint for framed experiences.

## Alternatives Considered

### Keep a global max-width outer shell (`board-page-outer`)

- **Pros:** Cheap intentionality; familiar; matches current ADR-008 mental model.
- **Cons:** Pegboard stays visually **capped** as monitors widen; conflicts with immersion and “same wall” goal.
- **Rejected** as the **long-term** primary constraint for the peg field (may remain temporarily during migration).

### URL = route only (no durable peg state in the address bar)

- **Pros:** Simpler routing; fewer edge cases on refresh.
- **Cons:** Weak shareability; “items on the wall” feel disconnected from links.
- **Rejected** for **durable** arrangement; see Decision §2.

### Two visual systems (“board pages” vs “reader pages”)

- **Pros:** Less risk on dense text pages.
- **Cons:** Duplicated layout logic; fights “one wall” and “same density everywhere.”
- **Rejected** in favor of **one shell** + **reading islands** (Decision §4).

## Consequences

- **Planning gate** — Before implementation tasks: produce an **amendment or successor** to ADR-008 that defines the new **DOM contract** for (a) **peg field extent** vs (b) **reading column** vs (c) **decorative overflow** (tape, grain) under viewport-wide boards.
- **`RisoBoardShell` / layout files** — Expect structural changes: outer max-width removal or relegation to non-peg routes only during transition; possible **new wrapper** for “persistent stage” vs “route item slot.”
- **Routing and data** — URL schemes for workshop (and other peg surfaces) must be **designed and documented** alongside animation so **SSR/first paint** and **client navigation** agree on scene state.
- **Visual regression** — Treat Phase 8 as a **baseline redo pass**, not a handful of spot updates: viewport-wide shell, nav/footer position, and workshop framing will change enough that **`site-pages`**, **`site-chrome`**, and **`workshop-pegboard`** suites (see [`tests/visual/`](../../tests/visual/)) should expect **large committed PNG diffs** and intentional `test:visual:update:docker` (or equivalent) after the shell stabilizes. Follow [`.cursor/rules/visual-regression-docker.mdc`](../../.cursor/rules/visual-regression-docker.mdc); review every diff—do not rubber-stamp.
- **Motion/accessibility** — Prefer **respecting `prefers-reduced-motion`** for item-layer transitions unless a follow-up spec says otherwise.

## Key assumptions to validate before build

- [ ] **Intentionality without max-width** can be achieved with **grid/keylines, anchored focal elements, and a single light/shadow system**—not with a single centered clamp.
- [ ] **One persistent shell** is compatible with **Astro + React islands** as currently structured (or we accept a **layout refactor** cost).
- [ ] **Every route** can adopt the shell without breaking **ADR-003**-class invariants for any route that keeps **TV-style frame chrome**.
- [ ] **URL ↔ scene** mapping stays **stable** across refactors (no mass link rot).

## MVP scope (first shippable slice — planning input only)

- **In:** Documented URL → scene mapping for **one** high-traffic surface (likely workshop or home); **viewport-wide peg field** for that slice; **one** transition pattern for item layer; **prose** unchanged per ADR-009 on reading roots.
- **Out (initially):** Encoding every micro-interaction in the URL; redesigning all content types in one pass; changing legal/error page copy requirements without review.

## Not doing (until explicitly re-scoped)

- **Throwing away** mobile peg lattice rules (**ADR-001**) or workshop chrome visibility (**ADR-003**) in the name of immersion.
- **Applying `prose` to the full shell** — still rejected per **ADR-009**.
- **Implicitly repealing ADR-008** without a written replacement contract for where tape, grain, and “paper” edges may live.

## Open questions (for planning / follow-up ADRs)

- Exact **URL schema** for workshop stacks vs portfolio vs posts (naming, nesting, defaults for `/workshop` with no subpath).
- Whether **non-framed** routes use the same **portal** metaphor or a **flatter** peg layer while sharing lighting/CSS tokens.
- How **footer and global nav** sit in the z-stack relative to the peg field at full bleed (new ADR or extension of shell ADRs).

## Related ADRs — alignment guide (per [documentation-and-adrs skill](../../.cursor/skills/documentation-and-adrs/SKILL.md))

**Do not delete** prior ADRs; **amend**, **supersede with a new ADR**, or add **short cross-links** only.

| ADR | Topic | Typical alignment |
|-----|--------|-------------------|
| [001](001-workshop-mobile-pegboard-contract.md) | Mobile lattice, portal width, scroll vs drag | **Keep.** “Portal truth” still applies wherever a **TV portal** exists; if the outer site becomes full-bleed peg, ensure **portal inner box** is still the layout authority for workshop cards (may be a **clarifying amendment** to §Context only). |
| [003](003-workshop-frame-chrome-initial-viewport.md) | Frame chrome in viewport, flex/`min-height: 0` | **Keep.** ADR-010 explicitly inherits these invariants for framed experiences. |
| [004](004-workshop-panel-packing.md) | Which cards share a panel | **Keep** (workshop data shape, not shell width). |
| [005](005-workshop-desktop-cork-layout-acceptance.md) | Desktop cork packing | **Keep** (geometry inside cork). Wider viewport may change **available cork area**; packing rules unchanged unless physics contract changes. |
| [006](006-workshop-lcd-tilt-vs-peg-hook-alignment.md), [007](007-workshop-peg-card-drag-scale-transform-origin.md) | Card tilt, drag transform-origin | **Keep** (component-level). |
| [008](008-riso-board-inner-content-bounds.md) | Inner `board` column = max extent for page chrome | **Revise or supersede** — This is the **main tension**. Write **ADR-011** (or amend 008) with a new DOM contract: **peg field** (viewport?), **reading measure** (inner column / `prose` root), **decorative tape/grain** (which box clips them). **Next step:** schedule ADR-011 (see [responsive plan Phase 8](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md#phase-8-site-wide-immersive-pegboard-adr-010)). |
| [009](009-reading-typography-prose-and-theme.md) | `prose` on reading roots, not workshop shell | **Keep**; ADR-010 Decision §4 already defers here. Optional: add one **Consequences** bullet that immersive shell + reading islands remain the pattern. |

**New ADRs worth writing next (names are suggestions):**

- **Shell / DOM contract** — Successor to the “bounds” story of 008: z-index of global nav/footer vs peg layer; optional `prefers-reduced-motion` for route item transitions.
- **URL → scene** — Stable path/query conventions, defaults, SSR + client agreement, redirect policy for renamed scenes.

## Follow-ups

- [x] Team review: **Accepted** (2026-04-20).
- [ ] Write **ADR-011** (or amend ADR-008) — peg field vs reading column vs decorative bounds.
- [x] Linked from [responsive plan Phase 8](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md#phase-8-site-wide-immersive-pegboard-adr-010) (shell / routing work).
