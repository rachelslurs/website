---
title: 'ControlGroup.com: Built Using Jekyll'
description: Using a static-site generator led to huge performance gains
author: Rachel Cantor
pubDatetime: 2012-10-19T04:00:00.000Z
tags:
  - github pages
  - ruby
  - static-site generator
  - jekyll
---

Originally published on [controlgroup.com](https://web.archive.org/web/20121023054417/http://blog.controlgroup.com/2012/10/19/controlgroup-com-built-using-jekyll/)

If you’ve been to our website recently, you may have noticed there have been a lot of changes. There is no server or CMS powering our website anymore, with the exception of the blog, which will soon change.

The pragmatic reality of a company website, beyond its blog, are such that content doesn’t need to be changed more than once or twice a week. So in the interest of speed and ease of maintenance, we chose [Jekyll](https://web.archive.org/web/20121023030250/http://github.com/mojombo/jekyll). Sure, I am most comfortable with a CMS, and that would have been a safe bet for my first public-facing work I would play a major part in the production of. Luckily at Control Group, knowing a tool isn’t a compelling enough reason to use it, so I invested a bit of time learning Jekyll.

Jekyll satisfied all of our wishes, but some things required extra finesse/hackery, especially since it was designed to be “blog aware” rather than for entire company websites. If you’re a designer/web coder mutt like me, there are certain holes in the available documentation that I felt could have been explained better. Many things I figured out were very duh-worthy and would have benefitted from a less pedestrian understanding of Ruby. But with some decent Googling skills, I usually found the answer…Thank you stackoverflow posts, blogs, Github issues, and other miscellany; I couldn’t do it without you. Regardless, there’s a lot of great documentation on Jekyll.

## Pros

### It’s fun!

Nothing gave me more satisfaction than having to build and iterate based on our specific needs. It was frustrating at times, but figuring out what we could place in the YAML front matter, and having layout dependent choices made based on them, was nothing short of wonderful once you get it.

### It’s fast and secure. Version control FTW.

CG deals with servers “on the reg” for many of our clients, but it would be nice to have one less instance to concern ourselves with watching. Having a solution that didn’t require the heavy lifting of a CMS meant there would be no software to update, no cron tasks, nothing but a bit of AWS S3 goodness. We serve it using a CDN (Amazon CloudFront) to speed up our already fast site and add additional security.

## Cons

### No plugins can be run on GitHub pages because of security reasons.

Sure, I can run Ruby plugins on my local machine (say, to generate category pages) and push the static HTML generated, but this went against one of our major requirements. We chose Jekyll with the hopes that content could be edited by anyone on the GitHub website without server/local machine intervention needed to keep plugin-generated content up to date.

### Markdown is a fickle mistress.

* I used the default markup interpreter engine for Jekyll which is [Maruku](https://web.archive.org/web/20121023030250/http://maruku.rubyforge.org/), but as far as I know, they all have their caveats. Just one seemingly harmless unencoded ampersand was enough to make Jekyll get all Hyde on you.
* Another big markdown offender is allowfullscreen, something you probably never noticed is in every video embed code in existence. Including it will throw you an error. Removing the offending attribute is the simple enough solution, and fortunately, it doesn’t seem to remove the video’s ability to go fullscreen.

## Recommended Documentation

[Jekyll How-To](https://web.archive.org/web/20121023030250/http://jekyllbootstrap.com/lessons/jekyll-introduction.html): Everything you want to know about Jekyll fahrealz

[Liquid for Designers](https://web.archive.org/web/20121023030250/https://github.com/Shopify/liquid/wiki/Liquid-for-Designers): Jekyll uses Liquid, a templating language created by Shopify

[Liquid Extensions in Jekyll](https://web.archive.org/web/20121023030250/http://github.com/mojombo/jekyll/wiki/Liquid-Extensions): Jekyll-specific Liquid extensions

[YAML on Wikipedia](https://web.archive.org/web/20121023030250/http://en.wikipedia.org/wiki/YAML): YAML lists are needed for tags and categories

[Extending and Hacking with Jekyll](https://web.archive.org/web/20121023030250/https://github.com/mojombo/jekyll/wiki/Extending-and-Hacking-on-Jekyll): Recipe ideas

After much database withdrawal, I have successfully built the new Control Group website without a CMS; it’s just straight, tried and true HTML, thanks to [Tom Preston-Werner](https://web.archive.org/web/20121023030250/http://tom.preston-werner.com/2008/11/17/blogging-like-a-hacker.html)‘s lean, mean, static site generating machine, Jekyll.
