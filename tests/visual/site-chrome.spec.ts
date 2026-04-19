import { expect, test, type Page } from "@playwright/test";
import { typicalViewport, VISUAL_TEST_WIDTHS } from "./viewportPresets";

const WIDTHS = VISUAL_TEST_WIDTHS;

async function gotoWorkshopVisualFixture(page: Page) {
  await page.goto("/workshop/visual-test", { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts;
    return fonts?.status === "loaded";
  });
}

test.describe("Site header (main navigation)", () => {
  for (const width of WIDTHS) {
    test(`screenshot @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });

      await gotoWorkshopVisualFixture(page);

      const nav = page.getByRole("navigation", { name: "Main navigation" });
      await expect(nav).toBeVisible();

      await expect(nav).toHaveScreenshot(`header--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});

test.describe("Site footer", () => {
  for (const width of WIDTHS) {
    test(`screenshot @ ${width}px`, async ({ page }) => {
      await page.setViewportSize(typicalViewport(width));
      await page.emulateMedia({ reducedMotion: "reduce" });

      await gotoWorkshopVisualFixture(page);

      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();

      await expect(footer).toHaveScreenshot(`footer--w${width}.png`, {
        animations: "disabled",
        timeout: 15_000,
      });
    });
  }
});
