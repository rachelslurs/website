---
title: I built a clean copy tool for ChatGPT called TidyText.cc
description: >-
  After working with ChatGPT and other AI tools, I realized that copying and
  pasting responses into Google Docs often messed up the formatting.
featured: true
author: Rachel Cantor
pubDatetime: 2024-09-24T04:00:00.000Z
tags:
  - Google Docs
  - ChatGPT
  - Web Workers
  - TailwindCSS
  - Vite
  - TypeScript
  - React
---

### I built a clean copy tool for ChatGPT called TidyText.cc

After working with ChatGPT and other AI tools, I realized that copying and pasting responses into Google Docs often messed up the formatting. Markdown is great for structured content, but dealing with the formatting cleanup? Not so much. 😅

![](/uploads/introducing-tidytext.png)

### Features

1. You can paste any text from ChatGPT (or elsewhere).
2. It instantly converts the content into HTML that’s compatible with Google Docs.
3. It provides a clean preview and lets you copy the result directly to your clipboard with one click.

I built it using React, Vite, Web Workers (to handle processing of the markdown in the background), and DOMPurify for sanitizing input. I used TailwindCSS for the styling and everything is using TypeScript. It’s hosted using Cloudflare Pages.

### 🔧 Why build this?

* I saw a simple problem I could solve for myself and make it simple and delightful.
* I love a good mini app as a way of trying out something new (like Vite) and brushing up on my Web Workers skills.
* Also I want to get more contracting clients.

### 💡 What’s next?

There’s Google Docs integration coming soon, so you’ll be able to generate and open documents directly in Google Docs without the extra step of copying.

If you’re using ChatGPT or any AI tool and need to quickly format content for Google Docs, [TidyText](https://tidytext.cc) is the tool for you! 🤖 🎉
