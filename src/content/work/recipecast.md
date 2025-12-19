---
title: RecipeCast
description: >-
  A full-stack SaaS platform for casting recipes from any website to a TV or
  smart display.
summary: >-
  Build a production-ready SaaS platform that fills the void left by Google
  Cookbook, allowing users to cast recipes from any site to their TV with
  reliable state management and a distraction-free cooking experience.
featured: true
draft: true
author: Rachel Cantor
pubDatetime: '2025-12-19T05:00:00.000Z'
year: '2025'
tags:
  - SaaS
  - TypeScript
  - React
  - Google Cast SDK
  - PostgreSQL
  - Cloudflare Workers
  - Node.js
---



## Table of Contents

## Client

RecipeCast is a self-founded Micro-SaaS platform designed for home cooks. It provides a modern solution for casting recipes to TVs and smart displays, offering a hands-free cooking experience that works with any recipe site.

## Challenge

Home cooks faced constant frustration following the discontinuation of Google's Cookbook app. I identified several key friction points that needed to be solved:

* **Screen locks:** Devices locking during cooking required constant unlocking with messy hands.
* **Ad-heavy content:** Finding actual recipe steps amidst ads on mobile sites was difficult.
* **Hardware limitations:** Small phone screens were hard to read from a distance while cooking.
* **Lack of alternatives:** No existing solution provided reliable casting to Google Cast-enabled devices.

## Approach

I needed to architect a system that prioritized reliability and universality. The approach involved deep technical discovery into the Google Cast SDK and structured data parsing.

### Authoritative Receiver Pattern

To handle the complexity of the Cast SDK, I designed an architecture where the cast receiver device controls all state to ensure synchronization.

### Recipe Extraction

I built a priority-based extraction system deployed on Cloudflare Workers to handle the variance in recipe website structures.

## Solution

I built a production-ready SaaS platform using Wasp (React + Node.js) that integrates seamlessly with a custom Google Cast implementation.

The solution focused on two core technical achievements:

1. Reliable Cast Integration: Implementing an authoritative receiver architecture to maintain synchronized state, handle network interruptions, and manage session timeouts gracefully.
2. Universal Parsing: A plugin-based system that detects and extracts recipe data from over 100+ sites.
