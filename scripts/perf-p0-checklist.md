# P0 — Pre-flight gate (before P1 TOC refactor)

Use this once, save results, then tag git (`git tag perf-baseline-YYYYMMDD`).

## 1. Stable measurement environment

- [ ] **Production build:** `npm run build && npm run preview` (not `astro dev`).
- [ ] **Browser:** Incognito or clean profile; extensions off (ad blockers skew Network).
- [ ] **Repeat:** Run Lighthouse 2–3 times on the same URL; average or pick median.

## 2. Bundle reality check (automated)

- [ ] Run `npm run build && npm run perf:report` and paste or save the terminal output.
- [ ] If `tinacms build` fails (e.g. Tina dev server already on port 9000), use **`npx astro build && npm run perf:report`** for a JS bundle baseline only.
- [ ] Note largest `dist/_astro/*.js` names — these are candidates after P1/P2. Expect **`motion`**, **`index.*` (React)**, **`Features`**, **`Search`**, **`PortfolioBoard`** near the top.
- [ ] If “Total CSS files” is 0, that is normal here: styles are often **inlined** into HTML (`build.inlineStylesheets` in Astro config), not emitted as `.css` files.

## 3. Find the real bottleneck (manual)

On **`/`** and **one long post with TOC** (and optionally `/posts/`):

- [ ] **Lighthouse:** TBT, LCP, CLS — note which metric is worst.
- [ ] **Performance panel:** Record load; sum **Main** thread **Scripting** in the first ~3 s.
- [ ] **Network:** Filter **JS** — total transfer and request count.

If **LCP** is dominated by a **font** or **hero image**, expect P2/P3 to move that metric more than P1 TOC work alone.

## 4. Known issues baseline

- [ ] Note any existing **hydration warnings** in the console (don’t attribute them to future perf PRs until fixed or filed).
- [ ] Quick pass: **View Transitions** home ↔ posts ↔ work — anything already broken?

## 5. Must not break (smoke list for later PRs)

Check after each perf phase:

- [ ] `/` — hero readable; card **links** navigate (native `<a>`).
- [ ] Long **post** — TOC links and in-article anchors.
- [ ] `/search` — search works.
- [ ] One **MDX post** with interactive `client:*` demo — still mounts when expected.

## 6. Optional artifacts

- [ ] Export Lighthouse JSON (DevTools → Lighthouse → ⋮ → Save as JSON) for `/` and one post.
- [ ] Commit message or doc note with **commit SHA** at baseline.
