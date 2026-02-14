---
title: "Say Less with Cursor Rules"
description: How I use .cursor/rules and glob patterns to enforce standards without cluttering context.
featured: true
author: Rachel Cantor
pubDatetime: 2026-01-28T05:00:00.000Z
tags:
  - RecipeCast
  - cursor
  - ai
  - how i work
---

## Table of Contents

When I started using Cursor to build [RecipeCast](https://recipecast.app), I noticed I was repeating myself constantly.

"Make sure this is accessible."
"Use conventional commits."
"Ask me before making big changes."
"Tell me what needs testing."

Then I realized: I can teach Cursor my preferences once and have them apply automatically. That's what `.cursor/rules/` is for.

### Why Rules Matter Especially for Solo Developers

Your AI context window is precious. Every time I forget to tell Cursor "make sure to use semantic HTML" or "I prefer TypeScript strict mode," that's tokens I could be using for actual work.

Rules let me frontload my preferences. Cursor loads them automatically, so I never have to say "make it accessible" again. It just is.

But here's the key: rules aren't just about saving tokens. They're about consistency. When I'm building a feature over multiple sessions, spread across days or weeks, rules ensure the code stays consistent.

### The Folder Structure

I use individual `.mdc` files instead of a single `.cursorrules` file. This helps me organize rules by concern and makes them easier to maintain.

Rules can be applied in three ways:

1. **alwaysApply: true** - Loaded automatically in every session
2. **glob: pattern** - Applied automatically when working with files matching the pattern
3. **Manual reference** - I explicitly reference them when needed

Here's my structure:

```
.cursor/
  rules/
    commit-style.mdc           (alwaysApply: true)
    engagement-preferences.mdc (manual reference)
    documentation.mdc          (manual reference)
    project-structure.mdc      (manual reference)
    accessibility.mdc          (glob: src/components/**)
    testing.mdc                (glob: **/*.test.*)
    api-conventions.mdc        (glob: src/server/**)
```

The glob patterns ensure certain files are automatically aware of specific contexts without cluttering the global context window.

### Core Rules Every Solo Dev Should Have

Here are the rules I use in every project:

#### Engagement Preferences

`.cursor/rules/engagement-preferences.mdc`

```markdown
# How to Work With Me

- Confirm my intentions before making significant changes
- Be proactive in asking questions about anything you want to assume
- When asking questions, prefer multiple choice format to speed things up
- Provide detailed verification instructions on task completion
- Use path aliases (@/, ~/components) instead of relative paths
- Tell me what needs testing and what might have broken
```

I reference this manually when starting complex features, but you could also use `alwaysApply: true` if you want it in every session.

**Multiple choice questions** speed things up dramatically. Instead of:

> How should we handle pagination?

I get:

> How should we handle pagination?
> A) Cursor-based (better for real-time updates)
> B) Offset-based (simpler implementation)
> C) Load all at once (fine for MVP, paginate later)

I can respond with "B" and move on, or "B, but let's add a TODO for cursor-based later" if I want to add context.

**Verification checklists** catch issues before they hit production. After implementing a feature, Cursor automatically tells me:

- What to test
- What might have broken as a side effect
- Edge cases to verify

This changes AI from being a "code generator" into a "collaborator who knows I need to verify the work."

#### Commit Style

`.cursor/rules/commit-style.mdc`

```markdown
---
alwaysApply: true
---

# Commit Message Style

Use conventional commits format:

- feat: new feature
- fix: bug fix
- refactor: code restructuring
- docs: documentation changes
- test: test additions or changes

Keep the first line under 72 characters.
Include context in the body when the change isn't obvious.
```

When Cursor generates code, it suggests commit messages that match this format. Consistency without thinking about it.

#### Documentation Maintenance

`.cursor/rules/documentation.mdc`

```markdown
# Documentation Maintenance

When modifying code:

- Update relevant README files
- Update inline comments if function behavior changes
- Flag when API documentation needs updates
- Suggest JSDoc additions for exported functions
```

I reference this manually or could use a glob like `glob: src/**` to apply it across source files.

#### Project Structure

`.cursor/rules/project-structure.mdc`

```markdown
# Project Structure Overview

/app
/src
/client - React components, hooks, utilities
/server - API routes, database queries, business logic
/shared - Types and utilities used by both client and server
/public - Static assets

Use @/ alias for imports from /app/src
Keep components under 200 lines
Extract business logic into custom hooks or server utilities
```

I reference this manually when starting new features or could use `glob: src/**` to apply it broadly.

#### Accessibility Standards

`.cursor/rules/accessibility.mdc`

```markdown
---
glob: src/components/**
---

# Accessibility Standards

When creating UI components:

- Use semantic HTML (nav, main, article, section, button, etc.)
- Include ARIA attributes where semantic HTML isn't sufficient
- Ensure keyboard navigation works (tab order, focus states, shortcuts)
- Check color contrast meets WCAG AA minimum (4.5:1 for text)
- Handle focus management for modals and dynamic content
- Respect reduced motion preferences
- Test with screen readers in mind

For forms:

- Label all inputs with visible labels or aria-label
- Group related inputs with fieldset/legend
- Show clear error messages associated with inputs
- Indicate required fields

For interactive elements:

- Use button for actions, a for navigation
- Ensure click targets are at least 44x44px
- Provide visual focus indicators
- Support both mouse and keyboard interaction
```

The glob pattern `src/components/**` ensures this rule applies automatically when working on any component file. Accessibility is baked in from the start, not retrofitted later.

### Context-Specific Rules

Not every rule needs to apply everywhere. Some are only relevant in specific contexts.

#### Testing Requirements

`.cursor/rules/testing.mdc`

```markdown
---
glob: **/*.test.*
---

# Testing Standards

When writing tests:

- Use descriptive test names that explain what's being tested
- Follow Arrange-Act-Assert pattern
- Test edge cases (empty arrays, null values, boundary conditions)
- Mock external dependencies (API calls, database queries)
- Avoid testing implementation details

For React components:

- Test user interactions, not internal state
- Use Testing Library queries in order: getByRole > getByLabelText > getByText
- Verify accessibility (screen reader text, keyboard navigation)

For API endpoints:

- Test success cases and error cases
- Verify authentication/authorization
- Check input validation
- Test rate limiting if applicable
```

The glob pattern `**/*.test.*` ensures this rule applies automatically to all test files.

### Context Window Management

Rules should be brief. The AI doesn't need your life story. It needs the constraints.

I keep each rule file under 30 lines. If a rule is getting long, it probably should be split into multiple rules or doesn't belong in rules at all.

**What belongs in rules:**

- Code style and conventions
- Project structure
- Communication preferences
- Standards that apply across sessions

**What doesn't belong in rules:**

- Feature-specific context (that goes in plans)
- One-off instructions
- Temporary constraints
- Detailed implementation guidance

### When Rules Aren't Enough

Rules work great for standards and conventions, but they don't work for:

- **Complex workflows** - Use plans for this (I'll write about this in my next post)

- **Feature-specific context** - Include this in your conversation or reference documentation

- **Temporary constraints** - Just mention these in the conversation

### Evolution of Rules

**What I've removed:**

- Overly prescriptive code style rules (let Prettier handle it)
- Technology choices that constrained too much
- Implementation details that belonged in documentation

**What I've added:**

- Accessibility standards
- Verification checklist requirements
- Multiple choice question preference
- Documentation maintenance awareness

**What I've refined:**

- Made engagement preferences more explicit
- Shortened project structure overview
- Added specific ARIA requirements for accessibility

### Common Mistakes

**Rules that are too verbose**

Rules should be brief. If you're writing paragraphs of explanation, it's too long. Let Prettier and ESLint handle code formatting. Use rules for higher-level conventions and communication patterns.

**Conflicting rules**

Don't have one rule say "keep components under 200 lines" and another say "avoid splitting components until necessary." Pick one approach.

**Over-constraining**

Rules that are too rigid prevent the AI from adapting to unique situations. Leave room for judgment.

Bad: "Always use Redux or Zustand for state management"
Good: "Prefer React Context for shared state, consider external state management for complex apps"

### Testing If Rules Are Working

After adding a rule, test it:

1. Start a new Composer session
2. Ask for something the rule should affect
3. Check if Cursor follows the rule without you mentioning it

If Cursor doesn't follow the rule, either:

- The rule isn't clear enough
- The rule isn't in a file with `alwaysApply: true` or matching glob pattern
- The rule conflicts with another rule
- If all else fails, update or restart Cursor

### What's Next

Rules are the foundation. They establish standards and communication patterns. But rules don't help with complex workflows. For that, you need plans.

In my next post, I'll show you how I use `.cursor/plans/` to coordinate features that span multiple sessions and require careful sequencing.

And if you're working on a project and need some help, I'm taking on new clients. Let's talk! [bear.ink](https://bear.ink)
