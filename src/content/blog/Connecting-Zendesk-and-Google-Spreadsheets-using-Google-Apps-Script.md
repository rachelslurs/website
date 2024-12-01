---
title: Connecting Zendesk and Google Spreadsheets using Google Apps Script
description: >-
  Manage date-related deadlines with an integration between a Google Sheet and
  Zendesk’s ticketing system.
author: Rachel Cantor
pubDatetime: 2013-12-08T05:00:00.000Z
tags:
  - integrations
  - google apps script
  - google apps
  - zendesk
---

Originally posted on [zendesk.com](https://www.zendesk.com/blog/community-tip-connecting-zendesk-google-spreadsheets/) and [controlgroup.com](https://web.archive.org/web/20160306135950/http://blog.controlgroup.com/author/rachel-cantor/)

At Control Group, we’re constantly reevaluating our own internal workflow to be more productive using the tools we already have. We create working prototypes like this as a research lab of sorts to see what potential gaps and technical debt can be removed with creative applications of technology.

Our need for a tool like this came out of being fans of two great products we use all the time: Google Apps and Zendesk. Beyond the obvious benefits of using Google for all of our email communications, we greatly benefit from shared document creation. Zendesk helps us measure our success in providing dedicated support to our variety of clients ranging from [The Daily Show](https://web.archive.org/web/20160306135950/http://www.controlgroup.com/the-daily-show.html) here in New York, to the [Gagosian Gallery](https://web.archive.org/web/20160306135950/http://www.controlgroup.com/gagosian-gallery.html), with locations spanning 6 time zones. Since our IT support doesn’t limit itself to one particular team, our use case evolved beyond the typical when it came to monitoring warranty expiration. We’ve been using Google spreadsheets to keep track of purchased items for ourselves and clients, but without some kind of automated monitoring system in place, we realized there was unnecessary reliance on someone checking the spreadsheet for warranties nearing expiration. Hence, an idea for a tool I like to precociously refer to as Magic Ticket was born!

## Magic Ticket

Magic Ticket is a Google Apps Script that checks the date in a specified column of a spreadsheet to see if it’s X amount of days away. If it is X amount of days or less, the script uses its granted authorization to open a Zendesk ticket with the corresponding row of information. It uses an additional spreadsheet (added as an additional tabbed sheet named “Log”) to log the results.

Zendesk recently added [OAuth 2.0](https://web.archive.org/web/20160306135950/http://oauth.net/2) support, which provides a secure way for your application to access data without requiring that sensitive information like usernames and passwords be sent with the requests.

I recommend trying Magic Ticket using a Zendesk sandbox to make sure the script works correctly before trying it in production. For information on creating a sandbox, if you haven’t already, [reference this guide](https://web.archive.org/web/20160306135950/https://support.zendesk.com/entries/22881993-Testing-changes-in-your-sandbox).

The first step is to create your spreadsheet.

## Open your spreadsheet in Google Drive

You can [make a copy of my spreadsheet as a template](https://web.archive.org/web/20160306135950/https://docs.google.com/spreadsheet/ccc?key=0Ar8T1bZPJyrVdGlCTU9USWl0V0pyYzZuMjNYbUQtUmc&usp=sharing), or note the following when creating a spreadsheet from scratch:

- Use the first row as your column headers
- Make sure you have a column with the dates you’d like the script to reference.
- Add a tabbed sheet and name it Log

Here's [the source on Github](https://github.com/rachelslurs/magic-ticket/) and the [spreadsheet template](https://docs.google.com/spreadsheets/d/15nsjHBojKfwoKhV089I2dsoe48jYGSAvXdw9CWI_6pM/edit?gid=0#gid=0).
