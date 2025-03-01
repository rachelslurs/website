---
title: "Setting Up Sentry with Vite and Source\_Maps"
author: Rachel Cantor
pubDatetime: 2025-03-01T05:00:00.000Z
tags:
  - react
  - vite
  - sentry
---

After deploying the landing page for my Recipe Cast app at [recipecast.app](https://recipecast.app), I wanted to make sure I had proper visibility into any potential issues users might encounter when joining the waiting list. If you’re building with Vite and want meaningful error traces instead of minified gibberish, this guide is for you.

When you build your Vite app with this setup:

1. Vite generates the sourcemaps alongside your bundled code
2. The Sentry plugin uploads these sourcemaps to Sentry’s servers
3. When an error occurs in production, Sentry uses these sourcemaps to show you which line in your original code caused the error
4. You now get meaningful error reports instead of Some cryptic error happened line 1, column 38921 of main.js.

### How to add Sentry to your Vite project with source map support

1\. Install the necessary packages

npm i @sentry/react --save
npm i @sentry/vite-plugin --save-dev

2\. Create an instrumentation file

I’m using TypeScript, but the code is the same for JS. This will initialize Sentry with your configuration.

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  // debug: true <= useful if you run into any issues needing more info
  dsn: "{{your dsn here}}", // Replace with your actual DSN from Sentry
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  tracesSampleRate: 1.0,

  // Make sure to edit to any endpoints including localhost if you test locally
  tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

You can get your own DSN from the Sentry dashboard when you create a new project, or [from the docs](https://docs.sentry.io/platforms/javascript/guides/react/#configure) when you’re logged in.

3\. Import the instrumentation file in your entry point

Add this import to your main entry file (usually src/main.tsx or src/main.jsx):

import './instrument

4\. Configure the Vite plugin for source maps in your Vite config

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your sentry org",  // Your Sentry organization slug
      project: "your sentry project name",  // Your Sentry project name
      authToken: process.env.SENTRY_AUTH_TOKEN,  // Auth token from environment
    })
  ],
  base: '/',  // Changed from './' to '/' for Cloudflare Pages
  build: {
    outDir: 'dist',
    sourcemap: true  // This is crucial for the source maps to be generated
  }
});
```

5\. Optional: If using TypeScript, you should create/edit a file vite-env.d.ts to include the environment variable types:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Try uploading sourcemaps locally

1. Add .env to your .gitignore (if it isn’t there already)
2. Create/edit a local .env file with your SENTRY\_AUTH\_TOKEN
3. Run npm run build

If running on a CI of some kind (whether it be Cloudflare pages, Github actions, etc), you will need to add your environment variable SENTRY\_AUTH\_TOKEN as a secret to the CI running your build.

### One final thing if you’re silly like me:

Don’t forget to turn off any ad blocker to test this. 🤪
