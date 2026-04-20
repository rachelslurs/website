# ADR-013: Phase 8 rollout — wave 2+ (remaining routes)

## Status

Proposed (umbrella; ship in reviewable PRs per layout family)

## Date

2026-04-20

## Context

[ADR-011](011-immersive-shell-dom-contract.md) introduces an **opt-in** `immersivePegStage` on `RisoBoardShell`, first wired for **workshop** (`Main` when `fillViewportSlot` is true). [ADR-010](010-site-wide-immersive-pegboard-shell.md) eventually expects **most routes** on the same persistent stage.

## Decision

1. **Wave 2+** — After the pilot is stable and baselines are refreshed ([responsive plan](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md) Task 8.6), opt additional layout families into **`immersivePegStage`** in **separate PRs** (indexes, detail pages, marketing, errors).

2. **Per-route checklist** — Each PR must: preserve **ADR-003** on any route that keeps TV-style frame chrome; keep **`prose`** only on **reading roots** per **ADR-009**; run **`npm run check`**; refresh **Docker** visuals for affected pages.

3. **Do not** enable `immersivePegStage` on a route until reading measure and flex chains are validated at 320 / 768 / 1280.

## Verification

- PR description lists routes touched + VR evidence (Docker preferred).

## See also

- [ADR-010](010-site-wide-immersive-pegboard-shell.md)  
- [ADR-011](011-immersive-shell-dom-contract.md)
