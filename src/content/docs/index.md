---
title: Finzytrack
description: Open-source personal finance application with AI-powered workflows, customizable dashboards, and zero data lock-in.
---

Finzytrack is an open-source (GPLv2) GUI personal finance application for **macOS, Windows, and Linux**. Import your financial data with ease, explore it through dashboards and queries, and optionally let AI help you along the way — all while retaining full ownership of your data with complete privacy.

## Features

- **Double-entry bookkeeping** — built on [Beancount](https://beancount.github.io/), the powerful plain-text accounting system
- **Import a wide variety of statements** — rule-based importers for OFX, CSV, XLS files, or directly from your email. Finzytrack can connect to your email server and import transactions from emails sent by your financial institutions — no need to share your bank login credentials with third-party aggregators.
- **Auto-categorization** — automatically categorize imported transactions, either fully offline by training on your past categorizations or with AI assistance
- **Customizable dashboards** — build your own widgets, charts, and visualizations tailored to how you think about your finances
- **Powerful querying** — if you can express it as a SQL or Beancount (BQL) query, you can probably run it against your financial data
- **Transaction search** — quickly find any past transaction across your entire history
- **Optional AI assistance** — let AI parse statements, create import rules, categorize transactions, enter transactions in natural language, build dashboards, and answer financial questions. Bring your own model; no AI required for core features.

## You own your data

Your entire financial history lives in a single plain-text [Beancount](https://beancount.github.io/) ledger file. Open it in Notepad, Vim, or any text editor. Use it with any tool that speaks Beancount. If you ever stop using Finzytrack, your data is right there, readable and portable.

Finzytrack runs **entirely offline by default**. No one is mining your transactions for ads or profiling. If you use AI, you can run a local model on your own computer — your data never leaves your machine. If you connect a cloud-based model, some data will be sent to that provider. See [What data is shared with AI](reference/ai-data-sharing/) for details.

## AI as an accelerator

AI is entirely optional — it is not a gatekeeper. Everything the AI can do, you can do yourself — this documentation covers it all. AI simply makes things faster and more convenient:

- **AI-assisted import** — skip writing parsing rules for each financial institution. Hand a statement to the AI and it will figure out the format and import the transactions
- **Natural-language queries** — ask questions in plain English and get SQL or Beancount queries back
- **Agentic assistant** — create import rules, build dashboards and visualizations, and have conversations with your financial data

**Bring your own model.** Connect any AI model you choose — local or cloud-based.

## Open source and sustainable

Finzytrack is and will remain open source, and you can always use your own AI model. In future, we may explore fair monetization such as a bundled AI model subscription, signed auto-updating binaries, a hosted web app, or companion mobile apps.

## Quick links

- [Installation](installation/) — get Finzytrack up and running
- [Quick Start](quick-start/) — a tour of the basics
- [Views](views/) — learn about each screen in the app
- [Reference](reference/dashboard-recipes/) — deep-dive into configuration and systems
