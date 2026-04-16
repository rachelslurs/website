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

### CI behavior

- GitHub Actions runs visual tests on every PR.
- On failure it uploads:
  - the Playwright HTML report
  - screenshot `*-diff.png` and `*-actual.png` images

Projects

- [TidyText: Clean ChatGPT Text for Google Docs and Microsoft Word](https://tidytext.cc)
