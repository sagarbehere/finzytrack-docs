---
title: Query
description: The Query view — running SQL and BQL queries against your financial data.
sidebar:
  order: 6
---

The Query view lets you run SQL and BQL queries directly against your ledger data and visualize the results as tables or charts. It is designed for straightforward, single-shot queries. For more complex analysis involving multiple steps, follow-up questions, or progressive refinement, use the [AI Assistant](/views/ai-assistant/#analyst-mode-financial-queries) instead.

---

## Language Toggle

A toggle in the top-right corner switches between **SQLite** and **[BQL](https://beancount.github.io/docs/beancount_query_language/)** (Beancount Query Language). This affects the query editor placeholder, the generation target for natural language queries, and which backend engine executes the query.

See [Querying Data](/reference/querying-data/) for the full reference on available tables, columns, and query syntax for both languages.

---

## Quick Query Builder

If you have [AI configured](/quick-start/#configuring-ai), you can describe what you want to know in plain English and the AI will generate the corresponding SQL or BQL query.

1. Type a description in the text area — for example, *"Show me my top 10 expense categories this year"*.
2. Click **Generate SQL** (or **Generate BQL**) or press **Cmd/Ctrl+Enter**.
3. The generated query appears in the query editor below, where you can review and adjust it before executing.

If AI is not configured, a warning message appears and the generation button is disabled. The manual query editor below still works without AI.

---

## Query Editor

The main editor area where you write or edit SQL/BQL queries. The text area uses a monospace font and has spell checking disabled.

- Click **Execute** or press **Cmd/Ctrl+Enter** to run the query.
- Click **Clear** to reset the editor and results.

After execution, the row count and execution time are shown below the editor (e.g., "42 row(s) in 150ms").

### Error Display

If a query fails — due to a syntax error, missing table, or other issue — a red error box appears with the error message. Fix the query and execute again.

---

## Results

Query results are displayed in two tabs: **Table** and **Chart**.

### Table

The default view. Results are shown as a table with column headers and formatted values. Numbers are formatted with thousands separators and two decimal places where appropriate.

### Chart

Switch to the Chart tab to visualize the query results. You can configure:

- **Chart type** — bar, line, pie, area, scatter, or treemap.
- **X axis** (or Name for pie charts) — select which column to use as the category axis. The view auto-selects the first non-numeric column by default.
- **Y axis** (or Value for pie charts) — select one or more numeric columns as the value axis. For pie charts, only a single value column is used. For other chart types, you can select multiple columns to plot as separate series.

The chart renders automatically once both axes are selected. For richer visualizations with more control over formatting, labels, and interactivity, consider building a [dashboard widget](/reference/dashboard-recipes/) instead — the [AI Assistant](/views/ai-assistant/#analyst-mode-building-dashboards) can help with that.
