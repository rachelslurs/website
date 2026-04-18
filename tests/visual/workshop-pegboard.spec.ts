import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_PORTAL_WIDTHS,
  typicalViewport,
  VISUAL_TEST_WIDTHS,
} from "./viewportPresets";

const WIDTHS = VISUAL_TEST_WIDTHS;

function nameFor(width: number, slabIndex1: number) {
  return `pegboard-bg--slab${slabIndex1}--w${width}.png`;
}

function namePortalFrame(width: number) {
  return `portal-frame--w${width}.png`;
}

function namePageWithChrome(width: number) {
  return `workshop-page-with-chrome--w${width}.png`;
}

async function gotoWorkshopVisualFixture(page: Page) {
  await page.goto("/workshop/visual-test", { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts;
    return fonts?.status === "loaded";
  });
}

test.describe("Workshop pegboard alignment", () => {
  for (const width of WIDTHS) {
    test(`pegboard-bg slabs @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });

      await gotoWorkshopVisualFixture(page);

      const boards = page.locator(".pegboard-bg");
      await expect(boards).toHaveCount(3);

      for (let i = 0; i < 3; i += 1) {
        const slabIndex1 = i + 1;
        await expect(boards.nth(i)).toHaveScreenshot(
          nameFor(width, slabIndex1),
          {
            // Capture screw edges; avoid accidental crop cuts.
            animations: "disabled",
            // Docker runs can take longer to reach a stable layout (fonts, ResizeObserver, etc.).
            timeout: 15_000,
          }
        );
      }
    });
  }

  for (const width of [375, 768] as const) {
    test(`slab seam + frame @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });

      await gotoWorkshopVisualFixture(page);

      const scroller = page.locator(".workshop-scroll--mobile");
      const seam = page.locator(".slab-seam").first();
      await expect(page.locator(".slab-seam")).toHaveCount(2);

      // Capture seam + adjacent slabs in one crop.
      const seamRect = await seam.boundingBox();
      const scrollerRect = await scroller.boundingBox();
      if (!seamRect || !scrollerRect) throw new Error("Missing seam bounds");

      // Tight crop around seam; include a little of slabs on both sides.
      const padding = 40;
      const clip = {
        x: Math.max(scrollerRect.x, seamRect.x - padding),
        y: Math.max(scrollerRect.y, seamRect.y - 120),
        width: Math.min(
          scrollerRect.width,
          seamRect.width + padding * 2
        ),
        height: 240,
      };

      await expect(page).toHaveScreenshot(`slab-seam-and-frame--w${width}.png`, {
        clip,
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});

/**
 * ADR-003: slab nav + cork stay in the first viewport without document scroll;
 * `fillViewportSlot` / `h-svh` flex chain + `.portal-frame` bounds.
 */
test.describe("Workshop frame chrome (ADR-003)", () => {
  for (const width of WIDTHS) {
    test(`slab nav + first pegboard in viewport @ ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoWorkshopVisualFixture(page);

      const nav = page.locator(".workshop-panel-nav");
      await expect(nav).toBeVisible();
      await expect(nav).toBeInViewport();

      const firstBoard = page.locator(".pegboard-bg").first();
      await expect(firstBoard).toBeVisible();
      await expect(firstBoard).toBeInViewport({ ratio: 0.15 });
    });
  }

  for (const width of [...MOBILE_PORTAL_WIDTHS, 1024, 1280] as const) {
    test(`portal-frame screenshot @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoWorkshopVisualFixture(page);

      const frame = page.locator(".workshop-pegboard-root .portal-frame");
      await expect(frame).toBeVisible();

      await expect(frame).toHaveScreenshot(namePortalFrame(width), {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }

  /** Deliberately short height (not in `typicalViewport`) — ADR-003 stress case. */
  test("short viewport: nav + pegboard still in view @ 375×500", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 500 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoWorkshopVisualFixture(page);

    const nav = page.locator(".workshop-panel-nav");
    await expect(nav).toBeInViewport();
    await expect(page.locator(".pegboard-bg").first()).toBeInViewport({
      ratio: 0.1,
    });
  });
});

/**
 * Entire first paint: `RisoBoardShell` main nav + workshop + `Footer` inside the
 * `h-svh` board shell. Default `page` screenshot is viewport-sized (not `fullPage`),
 * so this matches what users see without scrolling the document.
 */
/**
 * `portal-inner` holds the scroll region + absolutely positioned `.shadowbox-portal`
 * vignette. Separate from `.portal-frame` screenshots so mobile shadow strength and
 * peg stack stay guarded when the outer wood chrome is unchanged.
 */
test.describe("Workshop portal-inner (mobile vignette + inner chrome)", () => {
  for (const width of MOBILE_PORTAL_WIDTHS) {
    test(`portal-inner @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoWorkshopVisualFixture(page);

      const root = page.locator(".workshop-pegboard-root");
      await expect(root).toHaveAttribute("data-pegboard-layout", "mobile");

      const inner = root.locator(".portal-inner").first();
      await expect(inner).toHaveScreenshot(`portal-inner--mobile--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});

test.describe("Workshop portal-inner (desktop)", () => {
  test("portal-inner @ 1280px", async ({ page }) => {
    await page.setViewportSize(typicalViewport(1280));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoWorkshopVisualFixture(page);

    const root = page.locator(".workshop-pegboard-root");
    await expect(root).toHaveAttribute("data-pegboard-layout", "desktop");

    const inner = root.locator(".portal-inner").first();
    await expect(inner).toHaveScreenshot("portal-inner--desktop--w1280.png", {
      animations: "disabled",
      timeout: 15_000,
    });
  });
});

/**
 * LCD-only slab: mobile stack padding + centering + clip (narrow width stress).
 */
test.describe("Workshop mobile LCD slab (layout)", () => {
  test("LCD pegboard slab @ 375px", async ({ page }) => {
    await page.setViewportSize(typicalViewport(375));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoWorkshopVisualFixture(page);

    await expect(page.locator(".workshop-pegboard-root")).toHaveAttribute(
      "data-pegboard-layout",
      "mobile"
    );

    const boards = page.locator(".pegboard-bg");
    await expect(boards).toHaveCount(3);
    await expect(boards.nth(1)).toHaveScreenshot(
      "pegboard-bg--slab2-lcd-mobile-layout--w375.png",
      {
        animations: "disabled",
        timeout: 15_000,
      }
    );
  });
});

test.describe("Workshop page with site chrome (viewport)", () => {
  for (const width of WIDTHS) {
    test(`viewport screenshot @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoWorkshopVisualFixture(page);

      await expect(
        page.getByRole("navigation", { name: "Main navigation" })
      ).toBeInViewport();
      await expect(page.getByRole("contentinfo")).toBeInViewport();

      await expect(page).toHaveScreenshot(namePageWithChrome(width), {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});
