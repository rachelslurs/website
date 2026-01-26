---
title: "Shared Brain: Achieving Zero-Wait States with Optimistic UI"
description: Achieve high-fidelity feedback by mirroring your backend logic in the browser
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2026-01-26T05:00:00.000Z
tags:
  - shared brain
  - frontend
  - optimistic ui
  - architecture
---

If you’ve spent any time in the full-stack trenches, you’ve felt the frustration of logic drift. This happens when your business rules, such as a delivery date calculator, start to diverge because you're maintaining them in two places: the backend to process the order, and the frontend to give the user instant feedback.

We usually fall into one of two traps. Either we have a backend-heavy team that assumes the API will be fast enough, which leaves the user staring at a spinner, or we write the logic twice. It works until the versions inevitably drift apart.

Eventually, you end up with a blurry UI. By "blurry," I mean a user interface where the feedback is just a fuzzy approximation of the truth. The user is left in an uncertain state, looking at a calculated guess until the server response finally comes back to snap the data into focus.

The fix is logic parity: running the exact same code on both the frontend and the backend. Here is how I use a shared brain to create a zero-wait state where the UI reacts instantly, backed by the total confidence of a backend-verified system.

## The Interface: Decoupling Rules

The core of this strategy is treating your business logic like a universal socket.

Imagine if every time you bought a new hair dryer, you had to call an electrician to solder the wires directly into your home's electrical grid. That’s tight coupling. If you want to move the hair dryer or upgrade it, you have to rip out the drywall every time.

In code, soldering your business logic directly creates the same mess. Instead, we use an interface, a universal socket, that defines the shape of the data we need. The logic shouldn't care if it's plugged into a real production database or a local frontend cache.

### What is a Shared Brain?

A shared brain is not a microservice. If you put this logic in a microservice, the frontend still has to call it over a network, which introduces the exact latency and uncertain loading states we’re trying to avoid.

Instead, the shared brain is a package that both your frontend and backend import and run locally. It’s a single source of truth that lives in its own library. In a standard TypeScript monorepo, it looks like this:

- `packages/brain`: Pure business rules and math. Side-effect free. No database calls, no browser APIs.
- `apps/client`: Imports the shared brain and plugs it into local UI state for a high-fidelity frontend.
- `apps/server`: Imports the same shared brain and plugs it into the database for the final source of truth.

```typescript
// @shared/brain.ts
export interface DataProvider {
  checkStock(id: string): Promise<number>;
}

export class DeliveryBrain {
  constructor(private dataSource: DataProvider) {}

  async calculate(itemId: string) {
    const stock = await this.dataSource.checkStock(itemId);
    // Logic: If in stock, it's today; otherwise, it's Saturday.
    return stock > 0 ? "Friday" : "Saturday";
  }
}
```

## The Logic Mirror Handshake

Because the frontend and backend share the identical code, they become mirrors of each other. This allows us to effectively remove the user's perception of network lag, a concept I’ll refer to as zero latency perception.

When a user clicks a button, the frontend executes using the shared brain immediately using local data. It displays the result instantly and then sends that "expected result" to the backend for verification.

![Shared brain concept illustrated](/uploads/all-good.png)

## Reconciliation: When Friday becomes Saturday

What happens if the mirror breaks? Maybe the last item in stock was sold in the 100ms between the user’s click and the API request.

The backend detects this discrepancy, known as logic drift, and sends the actual result back. The frontend then negotiates this change with the user:

- Minor drift: The UI silently updates the date from Friday to Saturday.
- Significant drift: We trigger a subtle soft alert, such as a toast or a highlight, letting the user know the delivery date was updated based on real-time inventory.

By managing the drift instead of just guessing, you maintain system integrity without sacrificing that snappy, responsive feel.

![Shared brain concept with frontend/backend negotiation illustrated](/uploads/reconciliation.png)

Stop soldering your rules to your infrastructure. Build a shared brain, define your interfaces, and start building for a zero-wait state.

## About the Author

I’m Rachel Cantor, a product engineer with over 14 years of experience building production systems. I plan and implement technical architecture that requires a knack for detail and a focus on high-fidelity user experiences. Currently seeking contract opportunities.

Feel free to reach out to me on [bear.ink](https://bear.ink/ "bear.ink") or [LinkedIn](https://linkedin.com/in/rachelcantor "LinkedIn") if you're looking to build something sharp. 🙌
