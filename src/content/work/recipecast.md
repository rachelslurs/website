---
title: RecipeCast
description: >-
  A full-stack SaaS platform for casting recipes to a TV or
  smart display.
summary: >-
  Build a production-ready SaaS platform that fills the void left by Google
  Cookbook, allowing users to cast recipes from any site to their TV with
  reliable state management and a distraction-free cooking experience.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2025-12-19T05:00:00.000Z
year: "2025"
tags:
  - SaaS
  - Python
  - FastAPI
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

- **Screen locks:** Devices locking during cooking required constant unlocking with messy hands.
- **Ad-heavy content:** Finding actual recipe steps amidst ads on mobile sites was difficult.
- **Hardware limitations:** Small phone screens were hard to read from a distance while cooking.
- **Lack of alternatives:** No existing solution provided reliable casting to Google Cast-enabled devices.

## Approach

I needed to architect a system that prioritized reliability and universality. The approach involved deep technical discovery into the Google Cast SDK and structured data parsing.

### Authoritative Receiver Pattern

To handle the complexity of the Cast SDK, I designed an architecture where the cast receiver device controls all state to ensure synchronization.

![Casting flow diagram](/uploads/recipecast-flow.png)

### Recipe Extraction

I built a two-tier recipe extraction pipeline: a FastAPI service (primary) and a Cloudflare Worker (fallback). The Wasp backend calls the Python API first; if it fails (timeout, 5xx, or site block), it falls back to the proxy worker. Both return normalized Schema.org-style recipe data so the rest of the app stays unchanged.

#### Primary: FastAPI

Stack: Python, FastAPI, deployed on Railway
Features: JWT auth, per-user rate limiting, URL validation and SSRF protection, Datadog APM.
Why primary: Better structure, validation, and observability; easier to extend and harden.

#### Fallback: Cloudflare Worker

Role: Original extraction layer; used only when the FastAPI call fails at runtime.
Coverage: Handles 200+ recipe sites as a proxy that detects and extracts recipe data.

## Solution

I built a production-ready SaaS platform using Wasp (React + Node.js) that integrates seamlessly with a custom Google Cast implementation.

The solution focused on two core technical achievements:

1. Reliable Cast Integration: Implementing an authoritative receiver architecture to maintain synchronized state, handle network interruptions, and manage session timeouts gracefully.
2. Universal Parsing: A two-tier extraction pipeline—FastAPI as the primary service, with a Cloudflare Worker as fallback when the API fails. The worker continues to support 200+ recipe sites; the Wasp backend tries the API first, then the worker.
