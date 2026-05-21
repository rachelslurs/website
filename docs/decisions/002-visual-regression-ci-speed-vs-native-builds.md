# ADR-002: Visual regression CI favors speed over native build toolchain

## Status

Accepted

## Date

2026-04-16

## Context

The workshop pegboard visual regression suite runs in a Linux Playwright container so screenshot baselines match CI rendering. Some Node dependencies (notably `better-sqlite3`, via Tina) may compile native code when prebuilt binaries are unavailable.

We tested installing build dependencies (`g++`, `make`, `python3`) inside the CI workflow to ensure native compilation succeeds. This improved robustness but made CI materially slower and more variable because `apt-get update && apt-get install …` depends on Ubuntu mirror speed and runner network conditions.

Observed behavior (representative):

- With `apt-get` toolchain install in the workflow, the visual job runtime increased significantly (e.g. ~1.5 minutes → 4+ minutes), dominated by package index downloads and toolchain install.
- Without the toolchain step, the job is much faster, but risks failing if a native module must compile.

## Decision

Default to **fast** visual regression CI by **not** installing a native build toolchain on every run.

- CI uses the official Playwright image and runs `npm ci` + `npm run test:visual` without an extra `apt-get` toolchain step.
- Linux (Docker/CI) remains the source of truth for committed screenshot baselines.

## Alternatives Considered

### Install build toolchain on every CI run (`apt-get install g++ make python3`)

- **Pros:** Native modules can compile reliably; fewer “node-gyp / toolchain missing” failures.
- **Cons:** Adds minutes and variability to every CI run; can become the dominant CI cost when mirrors are slow.
- **Rejected:** Too expensive for the common case where prebuilt binaries are available.

### Cache apt packages/lists in CI

- **Pros:** Can reduce `apt-get` time while keeping compilation available.
- **Cons:** Adds complexity; caching in containerized jobs can be brittle and requires maintenance.
- **Rejected (for now):** Complexity outweighs benefit at current scale.

### Use a custom CI container image with toolchain preinstalled

- **Pros:** Fast CI runs with native build support; avoids apt mirror variability at runtime.
- **Cons:** Requires building/publishing and maintaining a custom image.
- **Deferred:** Revisit if native compilation failures become frequent.

## Consequences

- **CI is faster** in the normal case.
- **Risk:** If a native module must compile and prebuilt binaries are unavailable, CI may fail.

### Playbook if CI starts failing on native compilation

If visual CI fails with errors like “`g++: not found`”, “`make: not found`”, Python/toolchain missing, or `node-gyp` build failures:

1. Re-enable the toolchain install step for the visual workflow as a stopgap.
2. If failures are frequent, consider switching to the custom image approach (Alternative 3).

