---
title: Design Pro
description: >-
  Give users the ability to change the look and feel of their page using themes
  and customizations.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2024-06-30T04:00:00.000Z
year: '2023'
tags:
  - Github Actions
  - CSS Variables
  - Hooks
  - ReactJS
  - Node.js
  - Figma
  - TypeScript
---

Develop an onboarding app that caters to multiple distinct user journeys while maintaining a seamless and intuitive user experience.

### Table of Contents

## Summary

Offer appearance customization features in our existing link-in-bio Page Editor as a way to increase revenue by enticing users that might not see value in subscribing to a paid plan.

### Client

Hype is an all-in-one marketing and payments platform for anyone using social media to grow their business. The software enables creators to build a website in minutes, earn revenue from subscriptions and tips, send message blasts to followers, and track key business analytics.

## Challenge

We wanted to be able to offer both themes and per page customization overrides.

## Approach

Make a system extendable enough that later on we could use the the data model for things beyond styles, potentially analytics scripts, etc.

### Layered flow

![Layered flow diagram showing the translation of serializing the content in the database, to presenting the preview to the user, and giving the user notifications upon saving.](/uploads/page_customization_layered_flow.png)

### Database schema

![Database schema](/uploads/database_schema.png)

## Solution

Creators will be able to use the Dashboard Page Editor to achieve the following:

1. Select a theme for their standard page/s
2. Be able to override the theme customizations with their page customizations (fonts, block borders, page background color, gradient).
3. We will be able to dynamically determine font color based on background type/value.

| Entity | Value Object  | Purpose                 |
| ------ | ------------- | ----------------------- |
| Themes | Name, display | - Provides a theme name |

* Whether or not theme gets displayed (in case we find one isn’t performing well enough to want to deprecate but don’t want to disturb users already using theme) |
  \| ThemeCustomizations | Theme ID, name, value, type | - A preset group of various customization choices |
  \| Forms | Name | - Gives pages a user friendly and editable name that is for ease of Creator to be able to identify in list if they have Design Pro (because Design Pro includes more than one page) |
  \| FormCustomizations | Form ID, name, value, type | - Things customized on the page level: ie a background with an image, a hover effect that animates for any linkable elements, etc.
* 1 form\_id:many form customizations |
  \| FormThemes | Form ID theme ID | - Gives the ability to override the PublisherTheme
* Should only apply 1 per form\_id |

### Form Service

For saving customizations on the form level and/or block level

### Themes Service

For returning Themes and ThemeCustomizations to be processed by the Customization Serializer for either the Page Editor or the Page.

### Customization Serializer

For converting customizations returned from the API to valid CSS.

### Style Tag Generator

For generating style blocks with increasing levels of specificity.

### Theme Picker

A component for choosing themes, both gated and ungated, which can only be saved when they have chosen a theme they have access to.

### Page Previewer

A component that injects style tags in the view of the page.

### Customization Pickers

* Should support the ability to visually gate/disable input and launch a CTA if gated
* Should be agnostic of whether they are used on the page-level or the block-level
* Should be able to handle if there’s no existing value or display if there’s an existing value
* Should also offer the ability to reset the value to be unset

## Tech Stack

* Frontend: [ReactJS](https://reactjs.org/ "React"), [TypeScript](https://www.typescriptlang.org/ "TypeScript")
* Backend: [Node.js](https://nodejs.org "Node.js"), [Koa](https://koajs.com "Koa"), [Sequelize](https://sequelize.org "Sequelize")
* Styling: [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties "CSS variables")
* UI/UX: [Figma and Figjam](https://figma.com/ "Figma")
* State Management: [Custom React Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks "Custom React Hooks")
* Deployment: [Github Actions/Workflows](https://docs.github.com/en/actions "Github Actions"), [AWS](https://aws.amazon.com "AWS")

## Conclusion

* Design Pro gave Hype the ability to compete with link-in-bio competitors while also providing flexibility for future customization offerings.

### Product

* Website: [https://app.hype.co](https://hype.co/signup "Dashboard App")
