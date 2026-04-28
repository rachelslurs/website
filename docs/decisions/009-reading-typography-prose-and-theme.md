# ADR-009: Reading typography — `@tailwindcss/typography`, `prose` boundaries, and theme vs CSS

## Status

Accepted

## Date

2026-04-16

## Context

Long-form pages (blog, work write-ups, demos, simple marketing copy) use **Tailwind Typography** (`prose`) with customization in [`tailwind.config.cjs`](../../tailwind.config.cjs) (`theme.extend.typography.DEFAULT` plus named **`analog`** in [`tailwind.typography-analog.cjs`](../../tailwind.typography-analog.cjs), consumed as **`prose prose-analog`**). Work-case-study pullquote/label rules remain in [`src/styles/riso.css`](../../src/styles/riso.css); looseleaf chrome stays there too. **Phase 6** of the [responsive workshop roadmap](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md) tightened **shell spacing only**; it did not unify typography.

Without a written contract, agents may:

- Wrap **workshop** or other flex-heavy routes in `prose`, conflicting with **[ADR-003](003-workshop-frame-chrome-initial-viewport.md)** (typography margins and width rules fighting **`fillViewportSlot` + `h-svh` + `min-height: 0`**).
- Add a fourth layer of ad hoc CSS instead of extending **`theme.extend.typography`** or **`prose-*:`** modifiers.
- Drift from the execution plan for **Phase 7** in the same roadmap (inventory → theme variant → layouts → dedupe → responsive density → verify).

## Decision

1. **Normative roadmap for implementation work** — **Phase 7** in [`.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md`](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md) is the **task list and acceptance shape** for reading typography refactors. This ADR records **invariants and ownership**; the plan records **ordered tasks and checkpoints**.

2. **Workshop vs reading (unchanged from ADR-003, reiterated here)**  
   - Workshop **`#main-content` must not** use the `prose` class.  
   - [`WorkshopPegboard`](../../src/components/workshop/WorkshopPegboard.tsx) remains **`not-prose`** at the pegboard root.  
   - Rationale remains ADR-003: **bounded-height flex** for frame chrome; `prose` descendant styles must not destabilize that chain.

3. **Where `prose` belongs**  
   - Apply **`prose`** (plus optional named variant, e.g. `prose-analog` once implemented) to a **single bounded reading root** per page — typically the MDX/article column (`PostDetails`, `WorkDetails`, `SimplePage` patterns), not the entire `RisoBoardShell` or arbitrary app UI.

4. **Customization surface (Tailwind Typography best practice)**  
   - Prefer **`theme.extend.typography`** (named variants + shared `css` objects) and **`prose-*:`** element modifiers for reading rhythm, fonts, link colors, code blocks, and task lists.  
   - Reserve **`riso.css`** (and similar) for **editorial chrome** that the typography plugin cannot express cleanly (stamped titles outside the prose column, cork/looseleaf metaphors). Document in code comments at boundaries: **theme = reading rhythm**, **riso = editorial chrome**.

5. **`not-prose` islands**  
   - Interactive MDX demos and non-article widgets inside a prose column continue to use **`not-prose`** (or live outside the prose root) so component typography is not overridden by article defaults.

6. **Verification**  
   - Non-workshop reading pages: Docker Playwright per [`.cursor/rules/visual-regression-docker.mdc`](../../.cursor/rules/visual-regression-docker.mdc), including [`tests/visual/site-pages.spec.ts`](../../tests/visual/site-pages.spec.ts) when layouts change.  
   - Workshop: keep **[ADR-003](003-workshop-frame-chrome-initial-viewport.md)** Playwright coverage in [`tests/visual/workshop-pegboard.spec.ts`](../../tests/visual/workshop-pegboard.spec.ts) green after any shell or global CSS change.

## Alternatives Considered

### Keep all editorial typography only in global CSS (`riso.css`)

- **Pros:** One file to grep for “blog look.”
- **Cons:** Duplicates what `@tailwindcss/typography` is designed for; harder to use `prose-sm` / variants; fights Tailwind’s design-token story.
- **Rejected** as the primary approach; limited retention for chrome only.

### Apply `prose` at `RisoBoardShell` / `main` for every route

- **Pros:** One wrapper.
- **Cons:** Breaks ADR-003 workshop layout; styles nav, footers, and components as if they were article bodies.
- **Rejected.**

## Consequences

- **Phase 7** tasks in the responsive plan should reference this ADR when updating README or closing YAML items. **Execution status (2026-04-20):** **7d** — reading roots on `Main` and `SimplePage` use **`max-sm:prose-sm`** for slightly tighter long-form on narrow widths while **`md:` `html` font-size 125%** still applies. **7e** — run Docker **`site-pages`** (and related) visual suites whenever reading or shell chrome changes; batch with Phase 8 VR when the outer shell moves again ([ADR-011](011-immersive-shell-dom-contract.md)).
- **New typography ADRs** are unnecessary unless this decision is superseded; amend ADR-009 or add a **new numbered ADR** if the split between theme and `riso.css` changes materially. (Shell/layout direction lives in [ADR-010](010-site-wide-immersive-pegboard-shell.md); it does not replace this typography contract unless explicitly revised here.)
- **README** Architecture section should link ADR-009 alongside ADR-003 for anyone touching `prose` or workshop layout.

## References

- [ADR-003: Workshop frame chrome in the initial viewport](003-workshop-frame-chrome-initial-viewport.md)  
- [Tailwind Typography plugin](https://github.com/tailwindlabs/tailwindcss-typography) — customization and `not-prose`  
- Responsive plan **Phase 7** — [`.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md`](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md)
