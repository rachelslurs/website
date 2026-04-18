/**
 * Phase 6a — Site shell in context on real routes (not `/workshop/visual-test` only).
 *
 * Each test is a **single viewport-sized** `page` screenshot: header, top of the
 * page, and as much of the main column + footer as fit in `typicalViewport` — not
 * a full-page capture of all scrollable main content.
 *
 * Pinned slugs must match committed `src/content` entries (non-draft). If you
 * rename or remove a file, update constants below and refresh baselines **in
 * Docker** — see `.cursor/rules/visual-regression-docker.mdc`.
 *
 * Run / update baselines (Docker only — do not use host `npx playwright` for PNGs):
 * `npm run test:visual:site-pages:docker`
 * `npm run test:visual:site-pages:update:docker`
 *
 * @see `.cursor/plans/responsive_pegcards_sizing_085cd05b.plan.md` Phase 6a
 */
import { expect, test, type Page } from "@playwright/test";
import { typicalViewport, VISUAL_TEST_WIDTHS } from "./viewportPresets";

const WIDTHS = VISUAL_TEST_WIDTHS;

/** Stable blog slug (`src/content/blog/how-i-use-cursor-to-plan-and-ship.md`). */
const BLOG_POST_SLUG = "how-i-use-cursor-to-plan-and-ship";

/** Stable work slug (`src/content/work/design-pro.md`). */
const WORK_SLUG = "design-pro";

/** Stable demo slug (`src/content/demos/optimistic.mdx`). */
const DEMO_SLUG = "optimistic";

async function gotoReadyForScreenshot(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts;
    return fonts?.status === "loaded";
  });
}

async function expectShellInViewport(page: Page) {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeVisible();
  await expect(nav).toBeInViewport();
  await expect(page.locator("#main-content")).toBeVisible();
}

test.describe("Site pages — viewport shell chrome (Phase 6a)", () => {
  for (const width of WIDTHS) {
    test(`homepage / @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoReadyForScreenshot(page, "/");
      await expectShellInViewport(page);
      await expect(page.getByRole("contentinfo")).toBeAttached();

      await expect(page).toHaveScreenshot(`homepage--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });

    test(`posts index @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoReadyForScreenshot(page, "/posts");
      await expectShellInViewport(page);
      await expect(page.getByRole("contentinfo")).toBeAttached();

      await expect(page).toHaveScreenshot(`posts-index--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });

    test(`blog post /posts/${BLOG_POST_SLUG} @ ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoReadyForScreenshot(page, `/posts/${BLOG_POST_SLUG}`);
      await expectShellInViewport(page);

      await expect(page).toHaveScreenshot(
        `post-${BLOG_POST_SLUG}--w${width}.png`,
        {
          animations: "disabled",
          timeout: 15_000,
        }
      );
    });

    test(`work /work/${WORK_SLUG} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoReadyForScreenshot(page, `/work/${WORK_SLUG}`);
      await expectShellInViewport(page);

      await expect(page).toHaveScreenshot(`work-${WORK_SLUG}--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });

    test(`demo /demos/${DEMO_SLUG} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoReadyForScreenshot(page, `/demos/${DEMO_SLUG}`);
      await expectShellInViewport(page);
      await expect(page.getByRole("contentinfo")).toBeAttached();

      await expect(page).toHaveScreenshot(`demo-${DEMO_SLUG}--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});
