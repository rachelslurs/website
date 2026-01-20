---
title: Building an AI Code Reviewer in 2 Days
description: >-
  Tired of playing code review whack-a-mole on solo projects? I built an AI tool
  that handles the systematic stuff (security, performance, TypeScript issues)
  so you can focus elsewhere.
featured: false
draft: false
author: Rachel Cantor
pubDatetime: 2025-09-09T04:00:00.000Z
tags:
  - gemini
  - claude
  - bun
  - agents
  - ai
---

I've been job searching lately ([reach out if you're hiring](https://linkedin.com/in/rachelcantor "reach out if you're hiring!")! 👋), and kept getting frustrated with overall maintenance tasks on personal projects. As a solo developer, I have to wear many hats beyond my usual frontend work — security auditing, performance optimization, keeping my TypeScript warning and error free — and it was turning into code review whack-a-mole.

Then I stumbled across [this egghead lesson](https://egghead.io/courses/claude-code-automation-cookbook-recipes-for-ai-agents~tsilh "this egghead lesson") about creating AI agents with Bun and realized: what if I could build something that keeps my focus where it's actually needed?

So over the weekend, I took a break from the job hunt to work on Code Reviewer— an AI-powered CLI tool that handles the systematic stuff so I can focus on the problems that actually require my active concern.

Most code reviews aren't about your entire codebase — they're about what changed. I built a caching system that only reviews modified files, using template-specific caching so the same file reviewed for security vs performance gets cached separately. This turns 10-minute reviews into 30-second ones.

I knew that certain models were better suited for different tasks. When one model hits rate limits, it automatically switches to the next best model.

But here's what I'm still figuring out: as models evolve, I want to make it easier to configure which model handles what. Right now it's based on review type, but some models are better with large codebases while others excel at individual files. I'm thinking about building a weighting system so you can easily configure "Claude Sonnet for multi-file context, Gemini Flash for individual files" without hardcoding assumptions.

If anyone has ideas on how to design this kind of adaptive model selection, I'd welcome PRs. The goal is making it flexible enough that when a new model drops, you can easily configure which tasks they're best at. I created [a fun little landing page](https://rachelslurs.github.io/code-reviewer/ "a fun little landing page") and the code is open-sourced at [https://github.com/rachelslurs/code-reviewer](https://github.com/rachelslurs/code-reviewer.).

If you're tired of maintenance tasks eating into your actual feature development time, give it a try!
