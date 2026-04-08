---
title: FinzyTrack
description: Open-source personal finance application with AI-powered workflows, customizable dashboards, and zero data lock-in.
---

FinzyTrack is an open-source (GPLv2) GUI personal finance application for **macOS, Windows, and Linux**. Import your financial data with ease, explore it through dashboards and queries, and optionally let AI help you along the way — all while retaining full ownership of your data with complete privacy.

## Features

- **Double-entry bookkeeping** — built on [Beancount](https://beancount.github.io/), the powerful plain-text accounting system
- **Import from anywhere** — rule-based importers for OFX, CSV, XLS files, or directly from your email. FinzyTrack can connect to your email server and import transactions from emails sent by your financial institutions — no need to share your bank login credentials with third-party aggregators.
- **Flexible import rules** — define rules to automatically transform and categorize transactions as they come in
- **Auto-categorization** — automatically categorize imported transactions, either fully offline by training on your past categorizations or with AI assistance
- **Natural language transaction entry** — type transactions in plain language and FinzyTrack parses them into your ledger
- **Customizable dashboards** — build your own widgets, charts, and visualizations tailored to how you think about your finances
- **Powerful querying** — if you can express it as a SQL or Beancount (BQL) query, you can probably run it against your financial data
- **Transaction search** — quickly find any past transaction across your entire history

## You own your data

Your entire financial history lives in a single plain-text [Beancount](https://beancount.github.io/) ledger file. Open it in Notepad, Vim, or any text editor. Use it with any tool that speaks Beancount. If you ever stop using FinzyTrack, your data is right there, readable and portable.

FinzyTrack runs **entirely offline by default**. No one is mining your transactions for ads or profiling. If you use AI, you can run a local model on your own computer — your data never leaves your machine. If you connect a cloud-based model, some data will be sent to that provider. See [What data is shared with AI](reference/ai-data-sharing/) for details.

## AI as an accelerator

AI is entirely optional — it is not a gatekeeper. Everything the AI can do, you can do yourself — the [documentation](reference/dashboard-recipes/) covers it all. AI simply makes things faster:

- **AI-assisted import** — skip writing parsing rules for each financial institution. Hand a statement to the AI and it will figure out the format and import the transactions
- **Natural-language queries** — ask questions in plain English and get SQL or Beancount queries back
- **Agentic assistant** — create import rules, build dashboards and visualizations, and have conversations with your financial data

**Bring your own model.** Connect any AI model you choose — local or cloud-based.

## Open source and sustainable

FinzyTrack is and will remain open source. In future, we may explore fair monetization such as a bundled AI model subscription, signed binaries, or companion web and mobile apps — and you can always bring your own AI model.

## Quick links

- [Installation](installation/) — get FinzyTrack up and running
- [Quick Start](quick-start/) — a tour of the basics
- [Views](views/) — learn about each screen in the app
- [Reference](reference/dashboard-recipes/) — deep-dive into configuration and systems
