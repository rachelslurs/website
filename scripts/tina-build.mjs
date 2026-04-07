import { spawnSync } from "node:child_process";

const hasTinaClientId = Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID);
const hasTinaToken = Boolean(process.env.TINA_TOKEN);

// Vercel preview builds and local CI often don't have Tina Cloud credentials.
// We want `astro build` to still work in those contexts.
const shouldSkip =
  process.env.SKIP_TINA_BUILD === "1" ||
  (!hasTinaClientId || !hasTinaToken) ||
  process.env.VERCEL_ENV === "preview";

if (shouldSkip) {
  const reason =
    process.env.SKIP_TINA_BUILD === "1"
      ? "SKIP_TINA_BUILD=1"
      : process.env.VERCEL_ENV === "preview"
        ? "VERCEL_ENV=preview"
        : "missing NEXT_PUBLIC_TINA_CLIENT_ID and/or TINA_TOKEN";

  console.log(`[tina-build] Skipping Tina build (${reason}).`);
  process.exit(0);
}

console.log("[tina-build] Running Tina build.");
const result = spawnSync("npx", ["tinacms", "build"], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
