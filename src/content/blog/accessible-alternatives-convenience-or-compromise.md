---
slug: accessible-alternatives-convenience-or-compromise
title: "Accessibility Alternatives: Convenience or Compromise?"
description: >-
  Come for the education, stay for the low-key dragging of luxury retailer
  Maison Alaïa's alternate version.
featured: true
draft: false
author: Rachel Cantor
pubDatetime: 2024-06-23T15:22:00.000Z
tags:
  - web accessibility
  - a11y
  - section 508
  - user experience
---

You are likely familiar with these overlay tools that claim to effortlessly render your website accessible to all individuals. While it is true that they can provide some utility, an over-reliance on third-party scripts can inadvertently create even greater barriers for certain individuals with disabilities, but that’s not what I am going to discuss for this post.

Another accessibility alternative is to create a different set of HTML for users needing assistive technologies. I’ve seen these used on many Shopify websites and they tend to be what I like to call “the ugly stepchild” version of a store, because they tend to be automatically generated either by a theme or plugin and ignored by designers. _Next time you’re shopping online, ⌘F, “accessib”, click, and prepare to be horrified._

<figure>
<img alt='A gif scrolling luxury retailer Alaïa’s “accessible” version of their website, showing broken images, and ugly blue all caps text.' src='/uploads/accessible_alaia.gif'>
<figcaption class='text-center'>Luxury retailer Alaïa’s alternate version, complete with broken images, and that eggplant visited link color á la the web of yesteryear.</figcaption>
</figure>

Regardless of the type of accessibility alternative, here’s the reason I am writing this: I want to discuss the often overlooked relationship between “Conforming Alternate Version” and “Non-Interference”.

Here are the definitions in my layman’s terms:

_Conforming Alternate Version (CAV):_ the version that you are presenting to be the alternate to your inaccessible website, whether it be an entirely different set of web pages with the same content or the same set of web pages with an accessibility overlay.

_Non-Interference:_ these are the rules that must be followed for the inaccessible version of your website because they could potentially prevent a user from safely being able to access the CAV. They are the things that could potentially render that CAV you spent money and/or time adding completely useless.

The following [WCAG tests ensure non-interference](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#cc5):

1. Audio Control: Mechanisms to pause, stop, or control audio.
   - Rationale: Essential for users with screen readers.
2. Blinking, Moving, and Scrolling: Mechanisms to pause, stop, or hide moving content.
   - Rationale: Prevents distractions.
3. Auto-Updating: Mechanisms to control auto-updating content.
   - Rationale: Maintains reading flow.
4. Flashing: No content should flash more than three times per second.
   - Rationale: Prevents seizures.
5. Keyboard Trap: Ensure focus can be moved away using the keyboard.
   - Rationale: Allows seamless navigation for keyboard users.

Ultimately, achieving genuine web accessibility requires a comprehensive approach that goes beyond overlays and alternate versions. In the best case scenario, there isn’t a need for these alternative versions; but if you are only looking for a short-term fix to potentially appease some type of legal action or check a box, realize there’s more to it than just offering (in my opinion) a substandard alternative.
