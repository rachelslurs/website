---
title: TidyText
description: >-
  A free web utility that converts LLM output into clean output for pasting into
  Google Docs and Microsoft Word.
summary: >-
  Solve the format friction between LLM tools and word processors by building a
  utility that parses, sanitizes, and renders LLM output into a clipboard
  payload that pastes cleanly into Google Docs and Microsoft Word.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2026-05-21T04:00:00.000Z
year: "2024"
tags:
  - TypeScript
  - React
  - Vite
  - Web Workers
  - MathJax
  - Canvas API
  - DOMPurify
  - TailwindCSS
  - Cloudflare Pages
---

## Client

[TidyText](https://tidytext.cc "TidyText.cc") is a self-founded free utility for anyone working with LLM output — writers, students, designers, researchers, and anyone moving text between AI tools and word processors. The web app is donation-based.

For background on the original build: [I built a copy paste tool for ChatGPT and Google Docs called TidyText.cc](/posts/i-built-a-clean-copy-tool-for-chatgpt-called-tidytextcc).

## Challenge

Pasting LLM output into Google Docs or Microsoft Word is a small problem that becomes a constant friction the more you do it. I identified the friction points worth solving:

- **Markdown round-trips badly:** Headings, lists, bold, and inline code all break when pasted directly from ChatGPT and similar tools into Google Docs or Word.
- **Fractions don't render:** LaTeX is how LLMs output math, and neither Google Docs nor Word renders LaTeX without add-ons.
- **Existing tools assume a different target:** Most markdown converters target Markdown-rendering surfaces (GitHub, Notion, blogs), not word processors specifically.

## Approach

I needed to make pasting from LLM output into Google Docs and Microsoft Word round-trip cleanly without users thinking about format conversion. That meant solving a rendering pipeline problem end-to-end: parse, sanitize, render, and produce a clipboard payload that survives the paste.

### Web Workers for processing isolation

Markdown parsing and HTML sanitization run in a Web Worker rather than on the main thread. The preview stays interactive, the input stays responsive, and the parse cost is invisible even on longer pastes. This was also a deliberate skill brush-up — Web Workers are easy to skip on a small app, but the architecture pays off the moment input size grows.

### MathJax → Canvas-scaled PNG pipeline for fractions

Google Docs and Word render LaTeX through add-ons only, and SVG doesn't paste cleanly into either one. The pipeline ends in PNG because that's what actually survives the clipboard handoff.

To keep the glyphs crisp, the SVG renders to canvas at 3x scale and then displays at 1x — the standard scale-up-and-down trick to avoid blurry raster output. A `dark:invert` Tailwind class flips the image color for users viewing TidyText in dark mode, while the underlying PNG stays black-on-transparent so it pastes correctly into Docs and Word regardless of the user's theme. I caught the dark-mode issue during testing — the fraction images were inverting wrong against a dark UI, and the fix needed to be visual-only so the copied artifact stayed correct.

Full walkthrough of the three attempts that got me there: [TidyText.cc, copy paste to Google Docs, now with support for fractions](/posts/tidytextcc-copy-paste-to-google-docs-now-with-support-for-fractions).

### DOMPurify on input, not just output

Pasted LLM output is untrusted by default. Sanitization runs before render, not just before copy, so the preview itself can't execute anything an upstream tool might have produced.

## Measuring what matters

TidyText's growth has been organic search and word-of-mouth — no paid acquisition, no launch campaign.

**Traffic growth:**

- \~11x traffic growth over 8 months, peaking at 4,901 active users and 13,364 sessions in a single month

**Engagement (Jan 2025 – May 2026, per Google Analytics):**

- **96.25% engagement rate.** Most sites consider 60–70% good. For a utility, this means people land on the tool and use it, not bounce.
- **3.1 sessions per user on average.** People come back.
- **8 minutes 11 seconds average session duration** across all users. Returning users average 9 minutes 52 seconds — 61% longer than new users, which suggests TidyText becomes more useful as it slots into someone's workflow.
- **Organic referral traffic from classwork.com and forum.figma.com** — students and designers sharing it inside their own communities, which is the strongest qualitative signal that the tool actually solves the problem.

The referral pattern and returning-user duration are the metrics I pay most attention to: people are sending it to people they work with, and the people who come back stay longer.

## Solution

A small, fast utility that converts LLM-formatted text into clean HTML that pastes cleanly into Google Docs and Microsoft Word, with a one-click copy and a preview that matches the result.

The production web app runs on Cloudflare Pages: React + Vite, Web Workers for processing, MathJax + Canvas for fraction rendering, DOMPurify for sanitization, TailwindCSS for theming, all TypeScript.

What the architecture buys:

1. A responsive UI even on long pastes, because parsing and sanitization stay off the main thread.
2. Correct rendering of edge cases LLMs actually produce — including LaTeX fractions that survive the clipboard into both Google Docs and Word.
