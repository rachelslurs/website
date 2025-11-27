---
title: The Missing Guide to Sentry Source Maps in Vite Web Workers
featured: true
author: Rachel Cantor
pubDatetime: 2025-11-27T05:00:00.000Z
tags:
  - web workers
  - vite
  - source maps
  - sentry
---

![](</uploads/Debug web workers.png>)

Note: this guide assumes you already have source maps set up [like so](https://docs.sentry.io/platforms/javascript/guides/react/) or I [wrote about it here](https://medium.com/p/634231732ef1).

I recently set up error tracking for [TidyText.cc](https://tidytext.cc/) and ran into a problem. My Sentry integration was working fine for the main app bundle, but my build logs kept showing warnings about my worker files:

\[sentry-vite-plugin] Debug: Could not determine debug ID from bundle.
This can happen if you did not clean your output folder before installing
the Sentry plugin. File will not be source mapped:
/dist/assets/markdown.worker-EjdtEtNQ.js

The same warning appeared for both my markdown and LaTeX workers. This meant that if errors occurred in my workers (which handle all the heavy lifting for converting markdown and rendering fractions), I’d get useless stack traces instead of meaningful debugging information.

### Why this happens

The issue stems from how Vite handles worker bundles versus your main application bundle. When you build a Vite app with workers, they’re compiled as separate bundles with their own build process. The Sentry plugin was only configured for the main bundle, so it had no idea these worker files existed.

My first instinct was to look at the Sentry plugin options, but the solution actually lives in Vite’s configuration. Workers in Vite have their own separate plugin pipeline.

### The solution

I needed to configure the Sentry plugin for both the main build and the worker builds. Here’s what my working configuration looks like:

// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => {
// (1) Load env vars properly in Vite
const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

// Skip Sentry in development and during Lighthouse runs
const shouldUseSentry = mode !== 'development' && !env.VITE\_LIGHTHOUSE;

const sentryPlugin = shouldUseSentry ? sentryVitePlugin({
org: env.VITE\_SENTRY\_ORG,
project: env.VITE\_SENTRY\_PROJECT,
authToken: env.SENTRY\_AUTH\_TOKEN,
}) : \[];

return {
plugins: \[
react(),
...sentryPlugin, // (5) Spread for main bundle
],
build: {
sourcemap: shouldUseSentry ? 'hidden' : false, // (3)
},
worker: { // (2)
plugins: () => \[...sentryPlugin], // (5) Spread for worker bundles
format: 'es',
rollupOptions: {
output: {
format: 'es', // (4)
},
},
},
};
});

A few things worth noting:

1. Use Vite’s loadEnv to properly load environment variables. The config function receives mode as a parameter, which you can use to conditionally enable Sentry.
2. The [worker](https://vite.dev/config/worker-options)[ property is part of Vite's config](https://vite.dev/config/worker-options), not a Sentry plugin option.
3. Use sourcemap: 'hidden' instead of true. This generates source maps and uploads them to Sentry, but doesn't expose them publicly via sourceMappingURL comments. Your source code stays private while Sentry can still use the maps for error tracking.
4. Workers must use ES module format. The default iife format will cause build errors because code-splitting builds require ES modules.
5. The plugin returns an array, which is why you need to spread it with ...sentryPlugin in both places.

### ☝️Don’t forget the worker integration

Getting the build configuration right is only half the battle. You also need to set up [Sentry’s web worker integration](https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/webworker/) in your code.

In the main application file, I defer Sentry loading until after the page loads to avoid blocking the critical rendering path:

// main.tsx

// I include Sentry in production, but not when running Lighthouse audits
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE\_LIGHTHOUSE) {
const loadSentry = () => {
import('@sentry/react').then((Sentry) => {
const webWorkerIntegration = Sentry.webWorkerIntegration({
worker: \[]  // intentionally left empty; we will add to this later
});

```
  Sentry.init({
    dsn: "your-dsn",
    integrations: \[
      Sentry.browserTracingIntegration(),
      webWorkerIntegration,
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: \["localhost", /^https:\\/\\/yourapp\\.com\\/.\*/],
  });
  
  // Store it globally so you can add workers later
  (window as any).\_\_sentryWebWorkerIntegration = webWorkerIntegration;
});
```

};

// Use requestIdleCallback for better performance
if (typeof window !== 'undefined') {
const win = window as Window & {
requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void
};
if (win.requestIdleCallback) {
win.requestIdleCallback(loadSentry, { timeout: 2000 });
} else {
win.addEventListener('load', () => {
setTimeout(loadSentry, 0);
});
}
}
}

Then when you create a worker:

// App.tsx

const worker = new Worker(new URL('./markdown.worker.ts', import.meta.url), {
type: 'module'
});

// I include Sentry in production, but not when running Lighthouse audits
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE\_LIGHTHOUSE) {
const integration = (window as any).\_\_sentryWebWorkerIntegration;
if (integration && typeof integration.addWorker === 'function') ) {
integration.addWorker(worker);
}
}

// after adding the worker to the Sentry integration,
// you can add your worker.onmessage, worker.onerror, etc.

And finally, in each worker file:

// markdown.worker.ts

/// \<reference lib="webworker" />

// I include Sentry in production, but not when running Lighthouse audits
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE\_LIGHTHOUSE) {
// Register Sentry as early as possible (before onmessage, onerror, etc. is set up)
// This ensures errors are captured from the start
import('@sentry/react').then((Sentry) => {
Sentry.registerWebWorker({ self });
}).catch(() => {
// If Sentry fails to load, continue without it (non-blocking)
});
}

self.onmessage = (e: MessageEvent\<{ content: string }>) => {
// etc.

// Rest of your worker code

The order matters here. Make sure to call registerWebWorker before setting up any message handlers, so Sentry can properly intercept worker messages.

### Respecting user privacy on TidyText

But here’s the thing about TidyText: people paste all kinds of content into it. Meeting notes, drafts, personal writing. I don’t want that showing up in my error logs. So I added a [beforeSend](https://docs.sentry.io/platforms/javascript/guides/react/configuration/filtering/)[ hook](https://docs.sentry.io/platforms/javascript/guides/react/configuration/filtering/) to strip out the actual content while keeping the information I need to debug:

Sentry.init({
dsn: "your-dsn",
beforeSend(event) {
// Strip user content from breadcrumbs and context
if (event.breadcrumbs) {
event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
if (breadcrumb.data?.input) {
breadcrumb.data.input = '\[REDACTED]';
}
return breadcrumb;
});
}
return event;
},
// ... other config
});

Now when errors occur, I can see which markdown tag caused the problem without seeing what someone was actually trying to convert. Privacy respected, debugging ability intact.

If you’re using web workers with Vite and Sentry, hopefully this saves you some debugging time. The official Sentry documentation is comprehensive, but the specifics for this use case are scattered across different pages.
