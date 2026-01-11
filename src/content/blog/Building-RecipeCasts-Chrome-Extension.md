---
title: Building RecipeCast's Chrome Extension
description: >-
  There are plenty of Chrome extensions that extract recipes from websites. So
  why build another one?
featured: true
author: Rachel Cantor
pubDatetime: 2026-01-11T05:00:00.000Z
tags:
  - Chrome Extension
  - RecipeCast
---

There are plenty of Chrome extensions that extract recipes from websites. So why build another one?

Most Chrome extensions that remove the ads to give you just the recipe will either:

* Request permission to read every website you visit, constantly monitoring in the background
* Only work on a predefined list of popular recipe sites
* Don’t work on websites with hard paywalls

For RecipeCast, I took a different approach: the extension only detects recipes when you click the icon in your browser toolbar. No background scanning. No monitoring your browsing. And it works on any recipe site, including paywalled ones.

### Making RecipeCast Easier to Use

The other reason I built this: to streamline the RecipeCast workflow.

Previously, if you wanted to cast a recipe to your TV, you had to copy the URL and paste it into [recipecast.app](https://recipecast.app). Now, you click the extension icon, hit the “RecipeCast…” button, and the URL is already loaded in.

!['RecipeCast demo showing a laptop using RecipeCast to view a recipe on a smart display'](</uploads/RecipeCast Extension Marquee (1400 x 560 px) 2.png>)

I didn’t build casting directly into the extension (though I could have, since [I recently added OAuth-style authentication to the web app](https://medium.com/@rachelcantor/building-external-client-authentication-with-wasp-fa6de95acde1)). I wanted to keep it simple and validate that people actually wanted this workflow first.

Another reason to build it: making it easier for users to use RecipeCast to cast recipes to a smart display or TV. Before, you needed to copy and paste the recipe URL to the website to be able to view it. Now, you can just click on the extension icon, select the “RecipeCast…” button, and you have the URL already loaded in.

Here’s a video preview of the extension in action:

[https://www.youtube.com/watch?v=8QR3hi\_c24s](https://www.youtube.com/watch?v=8QR3hi_c24s)

### The Result

A Chrome extension that:

* Only scans for recipes when you want it to
* Works on any recipe site (not just a predefined list)
* Works on paywalled sites without requiring you to sign in
* Removes ads, life stories, and signup pressure
* Makes it effortless to get recipes onto your TV or smart display

Try it out and let me know what you think: [https://chromewebstore.google.com/detail/recipecast/jfblflmgkepdkfkkjdefbihembacdfog](https://chromewebstore.google.com/detail/recipecast/jfblflmgkepdkfkkjdefbihembacdfog?authuser=0\&hl=en)
