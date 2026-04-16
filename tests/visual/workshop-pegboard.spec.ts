import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [320, 375, 430, 768, 1024, 1280] as const;

/** Viewports where portal uses mobile slab stack (matches `data-pegboard-layout="mobile"`). */
const MOBILE_PORTAL_WIDTHS = [320, 375, 430, 768] as const;

function nameFor(width: number, slabIndex1: number) {
  return `pegboard-bg--slab${slabIndex1}--w${width}.png`;
}

function namePortalFrame(width: number) {
  return `portal-frame--w${width}.png`;
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
      await page.setViewportSize({ width, height: 900 });
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
      await page.setViewportSize({ width, height: 900 });
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
      await page.setViewportSize({ width, height: 900 });
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
      await page.setViewportSize({ width, height: 900 });
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
