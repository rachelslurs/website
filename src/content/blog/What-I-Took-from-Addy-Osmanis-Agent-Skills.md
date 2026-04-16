---
title: What I Took from Addy Osmani's Agent Skills
description: >-
  Four skills from the agent-skills repo that changed how I plan, build, and
  document work with AI coding agents.
featured: true
author: Rachel Cantor
pubDatetime: 2026-04-16T04:00:00.000Z
tags:
  - skills
  - ai
  - cursor
  - how i work
---

I've written before about [setting up Cursor rules](https://rachel.ai/posts/say-less-with-cursor-rules) and [using plans to sequence work](https://rachel.fyi/posts/how-i-use-cursor-to-plan-and-ship). Those posts covered my system: rules for consistency, plans for sequencing, a Plan-Audit-Execute loop for confidence. It worked. But there were gaps I was papering over with habit instead of structure.

Then I found Addy Osmani's [`agent-skills`](https://github.com/addyosmani/agent-skills) repo. It's a collection of structured workflows for AI coding agents, organized by development phase: define, plan, build, verify, review, ship. Each skill is a markdown file with concrete steps, verification gates, and tables of common excuses agents use to skip steps (with rebuttals). There are around 20 skills total, and I'm not going to walk through all of them. I've only been using the repo for a few days, but four skills have already changed how I work.

## Planning and Task Breakdown

I already had `.cursor/plans/`. I was already breaking work into sequenced tasks with dependencies. What I wasn't doing was _sizing_ tasks for the agent's context window.

The [`planning-and-task-breakdown`](https://github.com/addyosmani/agent-skills/blob/main/skills/planning-and-task-breakdown/SKILL.md) skill introduces a constraint: keep tasks small enough that a single task touches roughly five files or fewer. If a task can't be described in a few bullet points, it needs to be broken down further.

In practice, I exceeded the five-file guideline regularly. A layout refactor touched a wrapper component, a page template, shared CSS, TypeScript types, an ADR, and a README update. That's not five files. But the constraint still helped because it acted as a warning. When I noticed a task ballooning past the threshold, I'd pause and ask whether I was actually doing one thing or several things at once. Usually it was several.

The other thing the skill added was explicit verification gates inside plan files. I already had task sequences, but I didn't have checkpoints. After reading the skill, I started adding them: ordered phases with a "verify here before continuing" step between each one. That meant the plan file wasn't just an execution guide; it was a contract between me and the agent about when to stop and check.

Another use case was consolidating two overlapping plans into one canonical document. I had two plans covering different aspects of the same feature that were drifting apart. The skill's emphasis on reducing parallel sources of truth made the merge obvious. One plan, one sequence, one place to check status.

## Incremental Implementation

The [`incremental-implementation`](https://github.com/addyosmani/agent-skills/blob/main/skills/incremental-implementation/SKILL.md) skill codifies a cycle: implement, test, verify, commit. Thin vertical slices. Each slice should be shippable on its own, or at least stable enough that the system compiles and tests pass before you move on.

I was already working incrementally, but the skill made one thing more explicit: the commit is the checkpoint. Not "I'll commit when this feature is done." Commit after every stable slice, so you have a rollback point if the next slice breaks something.

That framing changed a few things in practice. When I was building out a visual regression testing setup, I followed the sequence: deterministic test route first, then a Playwright spec, then the CI workflow. Narrow first, widen second. When the test runner's dev server config hit a port conflict with another tool in the stack, I made a small reversible change instead of debugging the root cause. That's a decision the skill's framing made easier: unblock the current slice, don't solve the adjacent problem.

During a layout refactor, I landed changes as a chain of small steps: fix the container height, restructure the flex root, make an element sticky, remove a margin that was eating space, swap a viewport unit, drop a conflicting utility class. Each one got validated before the next. Some of those steps introduced regressions that the next step fixed. Without the incremental commit points, that would have been a single messy diff where any individual regression would have been hard to isolate.

## Context Engineering

The [`context-engineering`](https://github.com/addyosmani/agent-skills/blob/main/skills/context-engineering/SKILL.md) skill defines a five-level hierarchy for what the agent sees: rules files at the top (always loaded, project-wide conventions), then specs, then source files, then execution output (test results, build errors), then conversation history. The hierarchy is about persistence: rules files are the most stable, history is the most volatile.

That framing explained why some of my Cursor sessions went sideways. When agent output quality drops, my instinct used to be "the model is having a bad day." The context hierarchy reframes it: the agent is probably missing something it needs, or drowning in too much of what it doesn't. It's a context problem, not a model problem.

A concrete example: I asked the agent whether our current session had enough context to keep going or whether I should start a new chat. Instead of a gut-feel answer, the agent used the context-engineering framing: we had a canonical plan, an ADR, and a visual test harness loaded. That was enough. A new chat would make sense for a new milestone, like a risky audit or a different feature. That's a workflow decision I used to make by feel, and now I have criteria for it.

The skill also pushed me to consolidate context sources. I had two plan files covering overlapping work. After invoking `context-engineering` alongside the `planning-and-task-breakdown` skill, the agent merged them into a single canonical plan and marked the other as superseded.

Rules files sit at Level 1 in the context hierarchy: always loaded, always setting the baseline. I'd already landed on this with my [Cursor rules setup](https://rachel.fyi/posts/say-less-with-cursor-rules), but the `context-engineering` skill gave me a framework for understanding _why_ it works, and where the other levels fit.

## Documentation and ADRs

When I make a decision, the reasoning lives in my head until I forget it. The [`documentation-and-adrs`](https://github.com/addyosmani/agent-skills/blob/main/skills/documentation-and-adrs/SKILL.md) skill tackles this by emphasizing Architecture Decision Records: structured markdown files that capture not **what** you built, but _why_ you built it that way.

The skill provides a template for these: context, decision, alternatives, consequences. I had an informal version of this already. I was writing notes in plan files and leaving comments in code. But the skill pushed me to formalize it, and the formalization made a real difference.

I found that ADRs get written at two specific moments. The first is when I finally get the outcome I want after iterating. I'd been wrestling with a layout where the header and footer needed to stay fixed within the viewport, trying different approaches over several rounds. When I landed on the right one, I wrote an ADR to capture the constraints and the solution so I wouldn't re-derive it later.

The second moment is when I discover a requirement that wasn't previously documented. During the same layout work, I found that a CSS utility class was conflicting with the layout pattern in ways I hadn't anticipated. That constraint wasn't written down anywhere. So I added it to the ADR's consequences section, turning a debugging session into a permanent record.

This also showed up in a CI decision. I'd tried installing g++ and make on every CI run to support a native dependency. It was slow and annoying, so I reverted the change. Instead of that decision just living in git history as a revert commit (which nobody reads), it went into ADR-002 as a documented tradeoff: we chose speed over native toolchain support, and here's why. The ADR replaced a heavier automation path that I'd rejected. Documentation became the deliverable instead of code.

ADRs also help future agent sessions. When a new Cursor chat picks up my codebase, it can read why a layout is viewport-bound or why we skipped native build tools in CI instead of me re-explaining it every time.

## In Conclusion

What I didn't expect was how much the skills would sharpen my relationship with plan files. I was already editing plans mid-implementation, adding phases, marking tasks deferred, merging overlapping plans. But I was doing it by feel. The skills gave me best practices for how to go about it: when to consolidate, when to add verification gates, when a plan has drifted far enough from reality that it needs a rewrite rather than a patch.

The skills aren't about making agents smarter; they're about encoding the discipline you'd want from any collaborator: break the work down, ship in small pieces, keep track of what you're looking at, and write down why you made the choices you made. The skills make it repeatable in a context where your collaborator has no memory between sessions.

The repo has 20 skills and it's worth browsing even if you cherry-pick. Shout out to [Addy Osmani](https://addyosmani.com) and [all of the gracious contributors](https://github.com/addyosmani/agent-skills/graphs/contributors) that have made this useful resource for us all to enjoy.

[https://github.com/addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)

## About the Author

I'm Rachel Cantor, a product engineer with over 14 years of experience building production systems. I plan and implement technical architecture that requires a knack for detail and a focus on high-fidelity user experiences. Currently seeking a full-time or contract opportunities.

Feel free to reach out to me on [bear.ink](https://bear.ink/) or [LinkedIn](https://linkedin.com/in/rachelcantor) if you're looking to build something sharp. 🙌
