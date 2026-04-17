# rachel.fyi

This site is a modified version of [AstroPaper](https://github.com/satnaing/astro-paper). It uses [TypeScript](https://www.typescriptlang.org), [ReactJS](https://reactjs.org) for components, [TailwindCSS](https://tailwindcss.com) for styling, and Markdown for blog/work content. It relies on the framework [Astro](https://astro.build) and uses [Fuse.js](https://www.fusejs.io) for search. CMS is [Tina](https://tina.io).

## Development

```bash
npm ci
npm run dev
```

## Workshop pegboard visual regression tests

The workshop pegboard has alignment invariants (peg holes ↔ screws ↔ border/content-box ↔ scaling) that are easy to regress with small CSS/JS changes. We use Playwright screenshots to catch drift.

### Fixture page

Use the deterministic fixture at:

- `/workshop/visual-test`

### Run locally (macOS)

One-time browser install:

```bash
npx playwright install chromium
```

Run tests:

```bash
npm run test:visual
```

Update baselines (writes to `tests/visual/__screenshots__/`):

```bash
npm run test:visual:update
```

### Run locally in Linux (recommended; matches CI baselines)

Baselines in CI are rendered on Linux (Playwright container), so generating/updating baselines via Docker avoids macOS ↔ Linux pixel diffs.

```bash
docker compose run --rm playwright
docker compose run --rm playwright-update
```

The compose file pins the official Playwright image to the same major line as `@playwright/test` so the preinstalled browser build matches what the test runner expects.

The compose services also install a small build toolchain (`make`, `g++`) as a fallback when a native module needs to compile from source during `npm ci`.

### Faster local Docker runs (optional)

The `playwright` services above install build deps via `apt-get` on every run for CI parity. If you run visuals frequently, use the `*-fast` services which bake build deps into a local image (`Dockerfile.playwright`).

```bash
# Fast Linux run (no apt-get on each run)
docker compose run --rm playwright-fast

# Fast Linux baseline update
docker compose run --rm playwright-update-fast
```

**Baseline policy:** treat **Linux (Docker/CI)** as the source of truth for committed screenshots. macOS runs are useful for quick iteration but may show small pixel diffs due to font/rendering differences.

### CI behavior

- GitHub Actions runs visual tests on every PR.
- On failure it uploads:
  - the Playwright HTML report
  - screenshot `*-diff.png` and `*-actual.png` images

## Architecture decisions

Design rationale for larger choices lives in **Architecture Decision Records** under [`docs/decisions/`](docs/decisions/) (for example [ADR-001: Workshop mobile pegboard layout contract](docs/decisions/001-workshop-mobile-pegboard-contract.md), [ADR-002: Visual regression CI favors speed over native build toolchain](docs/decisions/002-visual-regression-ci-speed-vs-native-builds.md), [ADR-003: Workshop frame chrome in the initial viewport](docs/decisions/003-workshop-frame-chrome-initial-viewport.md), and [ADR-004: Workshop panel packing](docs/decisions/004-workshop-panel-packing.md)).

Projects

- [TidyText: Clean ChatGPT Text for Google Docs and Microsoft Word](https://tidytext.cc)
