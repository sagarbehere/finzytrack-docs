---
title: Architecture
description: Technical overview of Finzytrack's stack and design.
sidebar:
  order: 1
---

:::note
This page is under construction.
:::

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Vue 3, Tailwind CSS, HeadlessUI, ECharts        |
| Backend  | Python, FastAPI, Beancount, SQLite               |
| Desktop  | PyWebView (wraps the web app as a native window) |

## High-Level Architecture

```
+---------------------------+
|     Desktop Shell         |
|      (PyWebView)          |
+---------------------------+
|   Vue 3 Frontend SPA      |
+---------------------------+
|   FastAPI Backend          |
+-----------+---------------+
| Beancount |   SQLite      |
| (ledger)  |  (queries)    |
+-----------+---------------+
```

## Key Concepts

- **Beancount** is the source of truth for all financial data
- The backend parses Beancount files and serves data via a REST API
- The frontend consumes the API and renders dashboards using a recipe system
- The desktop app wraps everything in a native window using PyWebView
