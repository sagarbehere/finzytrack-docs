---
title: Dashboards
description: The Dashboards view — widgets, charts, and key metrics at a glance.
sidebar:
  order: 2
---

The Dashboards view is Finzytrack's primary interface for visualizing your financial data. It presents your finances through interactive widgets — KPI cards, charts, tables, and pivot tables — arranged in customizable grid layouts.

---

## Tabs

Dashboards are organized as **tabs** along the top of the view. Each tab corresponds to one dashboard.

- **Switch dashboards** by clicking a tab.
- **Close a tab** by clicking the **X** that appears when you hover over it (or always visible on the active tab). This hides the dashboard from view but does not delete it — you can add it back at any time.
- **Add a dashboard** by clicking the **+** button at the end of the tab bar. This opens the dashboard picker where you can choose from all available dashboards.

Your tab selection is saved automatically. The same tabs will be open the next time you launch the app, with the same dashboard active.

### Toolbar

Two buttons appear to the right of the tab bar:

- **Reload** (circular arrow icon) — Reloads all dashboard recipes from disk. Use this after editing recipe files to see your changes without restarting the app.
- **Manage Recipes** (gear icon) — Opens **Settings > Dashboards** where you can create and edit recipe files.

---

## Dashboard Picker

Click the **+** button in the tab bar (or the "Click here to add one" link when no tabs are open) to open the dashboard picker.

The picker lists all available dashboards. Each entry shows the dashboard title and description. Dashboards already open as tabs are grayed out with an "Added" badge.

- Click a dashboard to add it as a new tab.
- Click the **trash icon** next to a dashboard to delete it permanently. This cannot be undone.

---

## Widgets

Each dashboard contains one or more **widgets** arranged in a grid layout. A widget runs a query against your ledger data and displays the result as one of four visualization types:

### KPI Cards

A single prominent number — net worth, total income, total expenses, savings, and so on. KPI cards can show values in multiple currencies simultaneously and may include an icon and a trend indicator.

### Charts

Visual plots of your data. Supported chart types include **bar**, **line**, **pie**, **area**, **scatter**, **treemap**, **funnel**, **gauge**, **calendar heatmap**, **sankey**, **radar**, and **sunburst**. Charts support tooltips on hover and can be interactive — clicking a bar, slice, or flow can navigate you to a filtered view of the underlying transactions. See the **Widget Gallery** dashboard (described below) for a working example of every type.

### Tables

Tabular data with sortable columns. Values can be formatted as currency, percentage, or plain numbers. Table cells can be clickable links to filtered transaction views.

### Pivot Tables

Two-dimensional summaries — for example, expense categories as rows and months as columns. Pivot tables can show row totals, column totals, and a grand total. Cells can be clickable links to filtered transaction views.

---

## Parameters

Dashboards and individual widgets can expose **parameters** — interactive controls that filter the data shown. Parameter types include dropdowns, date pickers, and number inputs.

**Dashboard-level parameters** appear in the dashboard header next to the title and affect all widgets in the dashboard. For example, a Year parameter on the Year Summary dashboard filters every widget to that year.

**Widget-level parameters** appear in the widget header and affect only that widget. For example, a Currency parameter on a single chart lets you switch currencies without affecting other widgets.

Parameter selections are remembered. Both dashboard-level and widget-level selections are saved locally, so the values you pick are still there the next time you open the app. Dashboard parameters are also encoded in the URL, which makes them shareable and lets browser back/forward navigation restore the state of a particular session.

Some parameters default to a **templated value** like *Current Year* or *Current Month* — these appear in italics at the top of the dropdown, with the current resolved value shown in parentheses (for example, *Current Month (May)*). Picking a templated value means the dropdown re-evaluates on every load (so *Current Month* will be March in March and April in April), whereas picking a specific value like "May" pins it until you change it. To go back to the templated behavior after pinning, just re-select the italicized templated option from the dropdown.

---

## Included Dashboards

Finzytrack ships with four dashboards out of the box. The first three are designed to give you a useful overview from day one and serve as examples of what dashboards can do. The fourth — the **Widget Gallery** — is a reference of every supported widget type, useful both for visual inspection and as a starting point when creating your own dashboards.

### Financial Overview

A snapshot of your current financial position:

- **Net Worth** — sum of all assets minus all liabilities, shown per currency.
- **Total Assets** — sum of all asset accounts.
- **Total Liabilities** — sum of all liability accounts.
- **Assets Breakdown** — pie chart showing how your assets are distributed across accounts. Has a currency parameter for filtering.
- **Liabilities Breakdown** — pie chart showing outstanding liabilities by account. Has a currency parameter for filtering.

### Month Summary

A monthly income-and-expense report. Use the **Year** and **Month** parameters in the header to select the period.

- **Total Income** — sum of all income for the selected month.
- **Total Expenses** — sum of all expenses for the selected month.
- **Savings** — income minus expenses.
- **Expense Treemap** — a treemap visualization showing expense categories as proportionally sized rectangles. Larger rectangles mean more spending. Click any rectangle to see the underlying transactions.

### Year Summary

An annual financial summary. Use the **Year** parameter to select the year.

- **Total Income** — sum of all income for the year.
- **Total Expenses** — sum of all expenses for the year.
- **Savings** — income minus expenses.
- **Monthly Income & Expenses** — a bar chart comparing income, expenses, and savings month by month throughout the year. Click any bar to see the transactions behind it.
- **Expenses Pivot Table** — a table with expense categories as rows and months as columns, showing how spending in each category changes over the year. Includes row and column totals.

### Widget Gallery

A reference dashboard with one example of every widget type the app supports — KPI, bar, line, area, pie, scatter, treemap, table, pivot, funnel, gauge, calendar heatmap, sankey, radar, and sunburst. Each widget hovers a small **ⓘ** icon next to its title that, on hover, explains the type's gotchas (data shape requirements, encoding patterns, click-through behaviour, etc.).

Treat the gallery as both:

- **A working visual reference** — see how each chart type renders against your own data before committing to use it.
- **A starting point for new dashboards** — find the closest example, click **Manage Recipes**, and copy the underlying widget JSON to use as a template. The full source for the gallery dashboard lives at `backend/resources/seed_config/recipes/dashboards/widget-gallery.json`. See the [Dashboard Recipes reference](/reference/dashboard-recipes/) for the recipe format.

Editing the user-facing copy of the gallery (in `config/recipes/dashboards/widget-gallery.json`) only affects what *you* see in the app — the AI assistant always reads its own copy from the bundled seed and is unaffected.

All four dashboards support multiple currencies and include click-through links — clicking on KPI values, chart elements, or table cells navigates you to the Transactions view with the appropriate filters pre-applied.

---

## Creating Dashboards

There are three ways to create new dashboards:

### Using the AI Assistant

If you have [AI configured](/quick-start/#configuring-ai), you can describe the dashboard you want in the [AI Assistant](/views/ai-assistant/#analyst-mode-building-dashboards) and it will generate the recipe for you. For example, you might say "Create a dashboard that shows my top 10 expense categories as a bar chart and a monthly spending trend as a line chart."

### Using the Settings Editor

Go to **Settings > Dashboards** to create and edit dashboard and widget recipes using a JSON editor with live preview. Select "Dashboards" or "Widgets" at the top, click **"+ New"**, write or paste your recipe JSON, and use the **Refresh Preview** button to see a live rendering of your layout. See [Dashboard Recipes](/reference/dashboard-recipes/) for the full recipe reference.

### Editing Recipe Files Directly

Dashboard recipes are JSON files stored in `config/recipes/dashboards/` and widget recipes in `config/recipes/widgets/`. You can create or edit these files with any text editor. After making changes, click the **Reload** button in the dashboard tab bar to pick up the new files. See [Dashboard Recipes](/reference/dashboard-recipes/) for the recipe format and options.
