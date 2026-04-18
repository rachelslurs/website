# rachel.fyi

This site is a modified version of [AstroPaper](https://github.com/satnaing/astro-paper). It uses [TypeScript](https://www.typescriptlang.org), [ReactJS](https://reactjs.org) for components, [TailwindCSS](https://tailwindcss.com) for styling, and Markdown for blog/work content. It relies on the framework [Astro](https://astro.build) and uses [Fuse.js](https://www.fusejs.io) for search. CMS is [Tina](https://tina.io).

## Development

```bash
npm ci
npm run dev
```

## Workshop pegboard visual regression tests

The workshop pegboard has alignment invariants (peg holes ↔ screws ↔ border/content-box ↔ scaling) that are easy to regress with small CSS/JS changes. We use Playwright screenshots to catch drift.

**Baseline policy:** treat **Linux (Docker/CI)** as the source of truth for committed screenshots. **Always** use the Docker npm scripts below to run or update visual tests (including scoped specs); host Playwright can diverge (fonts, subpixel). Cursor agents follow `.cursor/rules/visual-regression-docker.mdc`.

### Fixture page

Use the deterministic fixture at:

- `/workshop/visual-test`

### Run in Docker (default; matches CI)

Wrappers (same as `docker compose run --rm playwright-fast` / `playwright-update-fast`):

```bash
npm run test:visual:docker
npm run test:visual:update:docker
```

Site pages shell screenshots only (`tests/visual/site-pages.spec.ts`):

```bash
npm run test:visual:site-pages:docker
npm run test:visual:site-pages:update:docker
```

Lower-level compose (official image; runs `apt-get` for a native build toolchain on each invocation — slower but closer to a cold CI machine):

```bash
docker compose run --rm playwright
docker compose run --rm playwright-update
```

The compose file pins the official Playwright image to the same major line as `@playwright/test` so the preinstalled browser build matches what the test runner expects.

### Faster Docker runs (optional)

The `playwright` services above install build deps via `apt-get` on every run. For day-to-day work, the default npm scripts use `*-fast` services, which bake build deps into a local image (`Dockerfile.playwright`).

```bash
docker compose run --rm playwright-fast
docker compose run --rm playwright-update-fast
```

### Run on the host (macOS / quick iteration only)

Host runs can diverge from Linux baselines (fonts, subpixel rasterization). Use only for quick debugging, not for updating committed PNGs.

One-time browser install:

```bash
npx playwright install chromium
```

```bash
npm run test:visual
npm run test:visual:update
```

### CI behavior

- GitHub Actions runs visual tests on every PR.
- On failure it uploads:
  - the Playwright HTML report
  - screenshot `*-diff.png` and `*-actual.png` images

## Architecture decisions

Design rationale for larger choices lives in **Architecture Decision Records** under [`docs/decisions/`](docs/decisions/) (for example [ADR-001: Workshop mobile pegboard layout contract](docs/decisions/001-workshop-mobile-pegboard-contract.md), [ADR-002: Visual regression CI favors speed over native build toolchain](docs/decisions/002-visual-regression-ci-speed-vs-native-builds.md), [ADR-003: Workshop frame chrome in the initial viewport](docs/decisions/003-workshop-frame-chrome-initial-viewport.md), and [ADR-004: Workshop panel packing](docs/decisions/004-workshop-panel-packing.md)).

**Workshop roadmap (phases + YAML todos):** [`.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md`](.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md) — pegboard responsive work, ADR-003/004 alignment, and Phase 6 site shell / `site-pages` visuals.

Projects

- [TidyText: Clean ChatGPT Text for Google Docs and Microsoft Word](https://tidytext.cc)
