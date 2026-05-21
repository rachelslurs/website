import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    // Slight tolerance for subpixel rendering differences.
    toHaveScreenshot: { maxDiffPixelRatio: 0.005 },
  },
  use: {
    baseURL: "http://localhost:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 768, height: 900 },
  },
  webServer: {
    // Avoid Tina dev server in tests; only need Astro routes.
    command: "astro dev --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

