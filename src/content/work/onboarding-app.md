---
title: Onboarding App
author: Rachel Cantor
pubDatetime: "2023"
slug: onboarding-app
featured: true
draft: false
tags:
  - Next.js
  - ReactJS
  - Redux
  - Figma
  - TypeScript
description: Supporting diverse user journeys in one Next.js app.
---

Develop an onboarding app that caters to multiple distinct user journeys while maintaining a seamless and intuitive user experience.

![Sat Naing's Terminal Portfolio](https://satnaing.dev/_ipx/w_2048,q_75/https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png?url=https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png&w=2048&q=75)

## Table of Contents

## Summary

Build an onboarding app that caters to multiple distinct user journeys while maintaining a seamless and intuitive user experience.

### Client

Hype is an all-in-one marketing and payments platform for anyone using social media to grow their business. The software enables creators to build a website in minutes, earn revenue from subscriptions and tips, send message blasts to followers, and track key business analytics.

## Challenge

They wanted an app that could support any number of diverse user journeys that all began with some form of user authentication.

## Approach

The approach involved mapping out a range of flows to determine how to isolate each step, but also giving us the ability to reuse steps wherever possible. I created the user flow diagrams using Figma (Figjam).

### User flow diagrams

#### Sign up: initial registration process

#### Linking a Hype Card: Connecting an NFC card or sticker to a user’s account

#### Claiming a page: User claiming ownership of a pre-existing page

## Solution

I chose to use Next.js for the application and used React to create wizards for each of the flows with the steps included. This allowed reusability wherever we needed it.

I translated designs from our product designer in Figma for each of the flows.

## Tech Stack

- Frontend: [ReactJS](https://reactjs.org/ "React"), [TypeScript](https://www.typescriptlang.org/ "TypeScript")
- Styling: [Tailwind CSS](https://tailwindcss.com "Tailwind CSS")
- UI/UX: [Figma and Figjam](https://figma.com/ "Figma")
- State Management: [Redux](https://redux.js.org "Redux")
- Deployment: [Cloudflare Workers](https://workers.cloudflare.com/ "Cloudflare Workers")

## Conclusion

- The comprehensive onboarding process reduced the number of support inquiries related to onboarding, indicating a smooth and efficient onboarding journey.
- We were able to track various flows and their success rate using Datadog RUM and a custom funneling dashboard.

### Product

- Website: [https://hype.co/signup](https://hype.co/signup "https://hype.co/signup")