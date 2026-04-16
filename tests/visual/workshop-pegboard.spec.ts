import { expect, test } from "@playwright/test";

const WIDTHS = [320, 375, 430, 768, 1024, 1280] as const;

function nameFor(width: number, slabIndex1: number) {
  return `pegboard-bg--slab${slabIndex1}--w${width}.png`;
}

test.describe("Workshop pegboard alignment", () => {
  for (const width of WIDTHS) {
    test(`pegboard-bg slabs @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });

      await page.goto("/workshop/visual-test", { waitUntil: "networkidle" });

      // Font/layout settling helps reduce flake in CI.
      await page.waitForFunction(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (document as any).fonts;
        return fonts?.status === "loaded";
      });

      const boards = page.locator(".pegboard-bg");
      await expect(boards).toHaveCount(3);

      for (let i = 0; i < 3; i += 1) {
        const slabIndex1 = i + 1;
        await expect(boards.nth(i)).toHaveScreenshot(
          nameFor(width, slabIndex1),
          {
            // Capture screw edges; avoid accidental crop cuts.
            animations: "disabled",
          }
        );
      }
    });
  }

  for (const width of [375, 768] as const) {
    test(`slab seam + frame @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });

      await page.goto("/workshop/visual-test", { waitUntil: "networkidle" });
      await page.waitForFunction(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (document as any).fonts;
        return fonts?.status === "loaded";
      });

      const scroller = page.locator(".workshop-scroll--mobile");
      const seam = page.locator(".slab-seam").first();
      await expect(seam).toHaveCount(1);

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
      });
    });
  }
});

