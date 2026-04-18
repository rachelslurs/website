/**
 * Playwright viewports for `/workshop/visual-test` (pegboard + site chrome).
 *
 * **Run / update screenshots:** always use Docker — `npm run test:visual:docker` /
 * `npm run test:visual:update:docker` (see `.cursor/rules/visual-regression-docker.mdc`).
 *
 * **Widths** match common breakpoints and device classes. **Heights** pair each
 * width with a typical real-world viewport (not every aspect ratio — odd sizes
 * still work in production; tests anchor common pairs so cork height / ADR-003
 * layout budgets stay representative).
 *
 * Wide desktop pairs (`1024`, `1280`) use **taller** viewports than legacy
 * “768-wide laptop” tropes: `portal-inner` height is much smaller than
 * `window.innerHeight` (site chrome + portal frame + bezel), so short `vh`
 * snapshots collapsed cork to ~5×30px — not representative of desktop use.
 *
 * **Fixture panels:** `visual-test.astro` uses **one card per panel** (clipboard,
 * LCD, blueprint) on purpose — each slab screenshot isolates one hardware type.
 * Multi-card packing and collisions are covered in `workshopPegboardPhysics.test.ts`;
 * add a dedicated route or extra panels here if we need multi-card *visual* baselines.
 */
export const VISUAL_TEST_WIDTHS = [320, 375, 430, 768, 1024, 1280] as const;

export type VisualTestWidth = (typeof VISUAL_TEST_WIDTHS)[number];

/** Portal uses mobile slab stack at these inner widths (see `WorkshopPegboard`). */
export const MOBILE_PORTAL_WIDTHS = [320, 375, 430, 768] as const;

/** Typical height (px) for each snapshot width. */
export const TYPICAL_VIEWPORT_HEIGHT_PX: Record<VisualTestWidth, number> = {
  320: 568,
  375: 667,
  430: 844,
  768: 1024,
  1024: 900,
  1280: 900,
};

export function typicalViewport(
  width: VisualTestWidth
): { width: number; height: number } {
  return { width, height: TYPICAL_VIEWPORT_HEIGHT_PX[width] };
}
