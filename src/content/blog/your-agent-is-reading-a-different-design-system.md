---
title: "Your Agent Is Reading a Different Design System"
description: >-
  An agent reads your design system through the Storybook components manifest, and the manifest is a lossy copy. Oversight is an addon that lints it and tells you what never made it in.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2026-07-14T04:00:00.000Z
tags:
  - storybook mcp
  - storybook
  - design systems
  - how i work
  - mcp
  - ai
---

When an agent tried to build two components from scratch instead of referencing what I thought was my well-documented design system, I went looking for the point where the MCP had stopped seeing my docs. The guidance was sitting in a field the Storybook MCP manifest never reads, so as far as the agent was concerned it had never been written.

[I fixed it](https://rachel.fyi/posts/storybook-mcp-reads-your-manifest-not-your-docs-tab). What stayed with me was that I only caught it because I happened to be looking. Nothing in the pipeline flagged anything. It built cleanly, served a manifest, and answered the agent's question with a confident, incomplete answer. It would have done the same thing the next time. And I had no way to know how many components were already invisible to it.

So I built a Storybook addon that checks each component for the gaps that leave an agent guessing. It's called Oversight. The [source is on GitHub](https://github.com/rachelslurs/storybook-addon-oversight), and there's a [live demo](https://rachelslurs.github.io/storybook-addon-oversight).

> **TL;DR**: Oversight is a Storybook addon that lints the components manifest, the file `get-documentation` reads to answer your agent. It flags failed docgen extraction, the wrong docgen extractor, undocumented required props, missing component descriptions, and dangling redirect links. Findings show up per component while you work. It does not write your docs for you. It tells you when the pipeline dropped them.

## What the agent actually reads

Your Storybook dev server generates a JSON file at [`/manifests/components.json`](https://storybook.js.org/docs/ai/manifests), built from your stories and your component source. That file is the only thing the MCP server reads. When an agent asks [`get-documentation`](https://storybook.js.org/docs/ai/mcp/overview) about your Button, the answer is assembled from the manifest. Not from your source. Not from your Docs tab.

So the first question about any component's documentation is whether the manifest has it.

The manifest is a preview feature, and Storybook is explicit that its schema is not a public API. Which is the argument for checking your manifest instead of trusting it. Everything here was tested against Storybook 10.5 in July 2026.

## Why the guidance has to be prose

Selection guidance matters more to an agent than usage guidance. An agent that can't tell which component to reach for builds a new one. I wanted a structured way to hand it that judgment, so I started designing a custom JSDoc tag to hold it. Something greppable. Something a lint rule could validate.

Then I checked what `get-documentation` actually returns. Component-level JSDoc tags aren't in it. Not a custom tag, not `@deprecated`, not anything. The description it hands the agent is tag-stripped prose, under both extractors.

Which means every component you have ever deprecated is, as far as your agent knows, current. The tag is right there in the manifest. It just never makes it into the answer.

So a custom tag would have been exactly as invisible to the agent as `parameters.docs.description.component` had been.

What `get-documentation` does return, verbatim, is the component description. So the guidance has to live there, as a plain sentence with a real link in it:

```ts
/**
 * A committed-selection box: tick one or more items and submit them together,
 * rather than applying each change the moment it flips.
 *
 * For a setting that applies the moment it flips, use
 * [Toggle](?path=/docs/forms-toggle--docs) instead.
 */
```

That's a redirect: a markdown link inside a component's description that points at a different component's docs page. Its target is a manifest ID, which means it can rot. A redirect that points at a component you renamed six weeks ago is worse than no redirect, because it reads like an answer.

## What it checks

Oversight lints the documentation the MCP consumes, and the pipeline that decides whether the MCP ever sees it.

Most of what goes wrong goes wrong in the extractor, more commonly called a documentation generator, or docgen. It reads your component's TypeScript and turns your props and JSDoc into the structured data the manifest is built from. Storybook ships two of them, and they do not agree.

**docgen-missing** (error): the manifest entry has no docgen payload at all. Extraction failed outright, and your agent is looking at a component with no props.

**extractor-drift** (warning): `react-docgen` is the default. It reads the source file directly and never runs the type checker, which makes it fast and means it can only see what's written in front of it. A prop type assembled out of other types, declared elsewhere, is a name it can't resolve. That's exactly what my design system's Button uses, so `react-docgen` returns nothing rather than guessing and every prop description comes back blank. `react-docgen-typescript` runs the real TypeScript compiler and resolves those types the same way your editor does. So I set [`reactDocgen: 'react-docgen-typescript'`](https://storybook.js.org/docs/api/main-config/main-config-typescript) in `.storybook/main.ts` and moved on.

The problem is that a setting can change without anyone noticing it changed. Someone edits `main.ts`. Storybook falls back. The prop descriptions stop reaching the agent, and nothing turns red, because from the pipeline's point of view nothing failed. The manifest records which extractor produced it, in `meta.docgen`, so Oversight compares that against the one you expect and tells you when they disagree.

**component-description-missing** and **prop-descriptions-missing** (warnings): the description or the prop docs are empty. **required-prop-undocumented** (error): a required prop with no description is the one an agent is most likely to guess at.

**docs-link-dangling** (error): a redirect points at a manifest ID that no longer exists.

**deprecated-tag** (info): the component is marked `@deprecated`, which the agent will never see. Repeat it in the description, with a redirect.

Plus **story-extraction-error** (warning) and **unknown-ignore-rule**, which fires when you typo your own ignore.

All of it surfaces per component, in a panel next to the story you already have open. A broken Checkbox redirect surfaces in a CI report three days after you broke it, and in the panel while Checkbox is still open.

## Why `@oversightIgnore` isn't `!manifest`

I just spent a section stating that a custom JSDoc tag can't carry anything to an agent, and then I shipped a custom JSDoc tag.

The difference is who it's for. A selection tag failed because it was documentation, and documentation has to reach the agent. `@oversightIgnore` is a directive for the linter, and it needs to stay out of the agent's way. Component-level tags don't reach the agent, so it doesn't. It sits in the manifest's docgen payload, where Oversight reads it and nothing else does.

It goes in the component's JSDoc. Bare, it exempts the component from every rule. Given a comma-separated list of rule names, it exempts it from those:

```ts
/**
 * An internal token catalog. Coverage rules don't apply.
 *
 * @oversightIgnore docgen-missing, story-extraction-error
 */
```

It does not remove the component from the manifest. The agent still sees its docs. Oversight just stops checking them. Typo a rule name and `unknown-ignore-rule` fires, rather than the list silently exempting nothing.

The load-bearing decision is that `@oversightIgnore` is not Storybook's `!manifest` tag, and reusing `!manifest` would have been less code.

`!manifest` removes a component from the manifest. The component disappears from the agent's view entirely. So if I had wired the linter to `!manifest`, the way to make Oversight stop complaining about a component's missing documentation would have been to delete that component's documentation from the agent. The linter would go quiet, the failure would get worse, and the two would look identical from the outside.

Use `!manifest` to hide a component. Use `@oversightIgnore` to exempt one.

## What the manifest debugger can't catch

Storybook serves a manifest debugger at `manifests/components.html`. It renders the raw manifest as a grid of cards so you can read what's actually in there. Oversight links to it.

So no, I did not rebuild the debugger. The debugger is a viewer: it shows you the manifest. Oversight is a linter: it reads the manifest for you and tells you what's wrong with it. A viewer needs you to already suspect something, go open the page, find the right card, and know what a healthy entry is supposed to look like.

Three of Oversight's rules could not be a viewer at all.

`extractor-drift` has nothing to display. It's a comparison. The manifest looks fine on its own. It's only wrong relative to the extractor you expected.

`docs-link-dangling` needs every other entry's ID to know that a redirect points at nothing. One card on screen can't tell you that.

`required-prop-undocumented` and `prop-descriptions-missing` look identical in a raw view. Every blank description renders the same way. Oversight knows an undocumented required prop is the one an agent will guess at, so that one is an error and a missing optional description is a warning.

## What it does not do

It's a linter, not a transform. It will not move your Docs tab prose into the component description. It will not write your prop comments. It has no opinion about whether your documentation is any good.

## Go read your own manifest

Your Storybook serves it at `/manifests/components.json`, and the debugger renders it at `manifests/components.html`. Pick a component you documented carefully. Read what the agent actually gets back.

I built Oversight because I didn't want to do that by hand, once per component, forever. The [source is on GitHub](https://github.com/rachelslurs/storybook-addon-oversight), and the [demo Storybook](https://rachelslurs.github.io/storybook-addon-oversight) ships components rigged to trip every rule.
