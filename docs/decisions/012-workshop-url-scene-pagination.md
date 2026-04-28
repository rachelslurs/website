# ADR-012: Workshop URL → durable scene (pagination)

## Status

Accepted

## Date

2026-04-20

## Context

[ADR-010 §2](010-site-wide-immersive-pegboard-shell.md) requires **durable** workshop arrangement to be **derivable from the URL** so bookmarks and shared links reproduce the same scene. The workshop index is built with Astro’s **`paginate()`** helper ([`src/pages/workshop/[...page].astro`](../../src/pages/workshop/[...page].astro)).

### Scope (Phase 8.2 pilot)

This ADR is the **first URL → scene** slice: **workshop list pagination** only. **Which cards appear on which page** of the workshop index is fully determined by **`/workshop`** and **`/workshop/{N}`**. Per §3, **in-panel** order, drag offsets, and other micro-state are **not** in the URL for v1. **Other routes** (home, posts index, work detail, demos) are **not** specified here; durable scenes for those surfaces are **future ADRs** or rollout work ([ADR-013](013-phase8-rollout-wave-2.md), [responsive plan Phase 8.7](../../.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md)) unless extended explicitly.

### Examples — cold load, refresh, share

| Step | URL | Expected durable scene |
|------|-----|---------------------------|
| 1. Cold load | `/workshop` | Static page for **page 1** from `getStaticPaths` + `paginate()`. |
| 2. Refresh | `/workshop/2` (if `lastPage` ≥ 2) | Same **page 2** slice after reload; no client-only hidden page index. |
| 3. Share link | Copy URL bar → open in new tab / private window | Same built route; recipient sees the **same pagination slice**. |

Client navigation via `<a href>` or View Transitions must land on the same scene as a direct request to that path (§2).

## Decision

1. **Canonical workshop URLs** — Pagination uses **path segments**, not query strings:
   - Page 1: **`/workshop`**
   - Page *N* &gt; 1: **`/workshop/{N}`** (e.g. `/workshop/2`)

2. **SSR and client** — `getStaticPaths` emits one static HTML document per page. **Cold load**, **refresh**, and **client navigation** (View Transitions + `<a href>`) all resolve the same `page` object from the matched route. **No client-only hidden state** is required for “which pagination slice” beyond what the URL already encodes.

3. **Out of scope for v1 (ephemeral URL state)** — Drag offsets, open/closed panel chrome, hover, and in-progress interactions **do not** appear in the URL unless a future ADR adds them.

4. **Link rot** — Renaming or resizing the underlying collection changes panel counts; **pagination URLs may 404** if a page number no longer exists after a deploy. Mitigation: treat content edits as normal static-site regeneration; optional future **redirect** from removed high page numbers to `/workshop` last page is not required for this ADR.

5. **Legacy `?page=`** — Not part of the canonical scheme. If introduced externally, behavior is **undefined**; prefer linking to `/workshop/{N}` only.

## Consequences

- **Pagination component** — Continues to use `page.url.prev` / `page.url.next` from Astro’s `Page` type (already path-based).
- **Testing** — Playwright and manual checks use **`/workshop`** and **`/workshop/2`** (etc.) as stable scene identifiers.

## Verification

- Open `/workshop` and `/workshop/2` (if `lastPage` &gt; 1); refresh; compare to direct navigation — same panels for that slice.
- `npm run check` after any change to pagination or workshop routing.

## See also

- [ADR-010](010-site-wide-immersive-pegboard-shell.md)
- [ADR-011: Immersive shell DOM contract](011-immersive-shell-dom-contract.md)
