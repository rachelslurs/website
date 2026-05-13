# Backlog / follow-ups

Optional work tracked from layout discussions (not required for correctness).

## Board shell and `Main.astro` unification

Today `SimplePage` and list-style pages compose `<Layout><Main>…</Main></Layout>`. Several places still use `RisoBoardShell` + a custom `<main>` because their DOM/classes differ on purpose.

- [ ] **`PostDetails.astro`**, **`WorkDetails.astro`**, **`DemoDetails.astro`** — Outer `<main>` uses `app-layout board-slot` only (no outer `prose`). To share `Main.astro`, add something like `prose={false}` (default `true`) and use `showBreadcrumbs={false}` so breadcrumbs are not introduced. Re-check typography (avoid double/nested `prose` against `.analog-prose` / post chrome).

- [ ] **`src/pages/index.astro`** — Uses `animateNav` on `RisoBoardShell` and `<main class="board-slot">` without `app-layout` / `prose`. Extend `Main` (or a tiny shell wrapper) to forward `animateNav` and allow a “homepage” `<main>` class variant if unifying.

- [ ] **`src/pages/404.astro`** — Custom scoped `#main-content` flex centering. Could move under `Main` with `showPageHeader={false}` and `showBreadcrumbs={false}`; verify `prose` and scoped styles still match intent.

- [ ] **Optional split** — If `Main.astro` props become unwieldy, extract `BoardMain.astro` (only `<main id="main-content" …>` + slot) with class variants, and keep `Main` as shell + breadcrumbs + optional header + `BoardMain`.
