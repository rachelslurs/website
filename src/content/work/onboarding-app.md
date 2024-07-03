---
slug: onboarding-app
title: Onboarding App
description: Supporting diverse user journeys in one Next.js app.
summary: >-
  Build an onboarding app that caters to multiple distinct user journeys while
  maintaining a seamless and intuitive user experience.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2024-06-11T12:21:00.000Z
year: '2023'
tags:
  - Next.js
  - ReactJS
  - Redux
  - Figma
  - TypeScript
features:
  - src: /uploads/sign_up_log_in.gif
    alt: Screen recording showing signup and login toggle
    caption: Sign up and log in toggle
  - src: /uploads/trial.gif
    alt: >-
      Onboarding process for creating an account and opting in for a free trial
      using Stripe
    caption: >-
      Onboarding process for creating an account and opting in for a free trial
      using Stripe
---

### Table of Contents

## Client

Hype is an all-in-one marketing and payments platform for anyone using social media to grow their business. The software enables creators to build a website in minutes, earn revenue from subscriptions and tips, send message blasts to followers, and track key business analytics.

## Challenge

They wanted an app that could support any number of diverse user journeys that all began with some form of user authentication.

## Approach

The approach involved mapping out a range of flows to determine how to isolate each step, but also giving us the ability to reuse steps wherever possible. I created the user flow diagrams using Figma (Figjam).

### User flow diagrams

#### Sign up: initial registration process

![](/uploads/signup.png)

#### Linking a Hype Card: Connecting an NFC card or sticker to a user’s account

![](/uploads/linking.png)

#### Claiming a page: User claiming ownership of a pre-existing page

![](/uploads/claiming.png)

## Solution

I chose to use Next.js for the application and used React to create wizards for each of the flows with the steps included. This allowed reusability wherever we needed it.

I translated designs from our product designer in Figma for each of the flows.

## Tech Stack

* Frontend: [ReactJS](https://reactjs.org/ "React"), [TypeScript](https://www.typescriptlang.org/ "TypeScript")
* Styling: [Tailwind CSS](https://tailwindcss.com "Tailwind CSS")
* UI/UX: [Figma and Figjam](https://figma.com/ "Figma")
* State Management: [Redux](https://redux.js.org "Redux")
* Deployment: [Cloudflare Workers](https://workers.cloudflare.com/ "Cloudflare Workers")

## Conclusion

* The comprehensive onboarding process reduced the number of support inquiries related to onboarding, indicating a smooth and efficient onboarding journey.
* We were able to track various flows and their success rate using Datadog RUM and a custom funneling dashboard.

### Product

* Website: [https://hype.co/signup](https://hype.co/signup "https://hype.co/signup")
