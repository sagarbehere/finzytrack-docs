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

### Colors

Dashboard colors — chart series, category slices, budget bars, KPI accents — come from a shared **dashboard theme**, so they stay consistent across every dashboard and can be recolored from one place. See [Dashboard Colors & Themes](/reference/dashboard-themes/).

---

## Parameters

Dashboards and individual widgets can expose **parameters** — interactive controls that filter the data shown. Parameter types include dropdowns, date pickers, and number inputs.

**Dashboard-level parameters** appear in the dashboard header next to the title and affect all widgets in the dashboard. For example, a Year parameter on the Year Summary dashboard filters every widget to that year.

**Widget-level parameters** appear in the widget header and affect only that widget. For example, a Currency parameter on a single chart lets you switch currencies without affecting other widgets.

Parameter selections are remembered. Both dashboard-level and widget-level selections are saved locally, so the values you pick are still there the next time you open the app. Dashboard parameters are also encoded in the URL, which makes them shareable and lets browser back/forward navigation restore the state of a particular session.

Some parameters default to a **templated value** like *Current Year* or *Current Month* — these appear in italics at the top of the dropdown, with the current resolved value shown in parentheses (for example, *Current Month (May)*). Picking a templated value means the dropdown re-evaluates on every load (so *Current Month* will be March in March and April in April), whereas picking a specific value like "May" pins it until you change it. To go back to the templated behavior after pinning, just re-select the italicized templated option from the dropdown.

---

## Included Dashboards

Finzytrack ships with several dashboards out of the box: three **overview** dashboards that give you a useful picture from day one, three **investment** dashboards for holdings and cash instruments, a **Widget Gallery** reference of every supported widget type, and a set of **budget** dashboards (one per common budgeting style).

### Financial Overview

A snapshot of your current financial position:

- **Net Worth** — sum of all assets minus all liabilities, shown per currency. Includes the market value of any priced holdings, folded into the currency each is priced in.
- **Total Assets** — sum of all asset accounts, holdings included at market value.
- **Total Liabilities** — sum of all liability accounts.
- **Assets Breakdown** — pie chart showing how your assets are distributed across accounts. Has a currency parameter for filtering.
- **Liabilities Breakdown** — pie chart showing outstanding liabilities by account. Has a currency parameter for filtering.
- **Allocation by Asset Class** — pie chart of your assets grouped by asset class (cash, ETF, CD, and so on), the honest mix across cash and holdings.

Holdings are valued at their latest price, or at what you paid when they have no price. When you hold anything whose prices are fetched, the header shows **Update prices** and the date of the prices in use.

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

### Investment dashboards

Three dashboards project your holdings and cash instruments. They are per-currency (Finzytrack never sums across currencies), and every table cell and chart element clicks through to the underlying transactions. A small amount of optional metadata enriches them — see the [Investments reference](/reference/investments/).

#### Holdings & Performance

Your priced holdings — equities, funds, crypto — and how they have performed.

- **Invested / Current Value / Unrealized Gain** — what you paid for the holdings you still hold, what they are worth now, and the difference, per currency.
- **Value Over Time** — market value against cost basis, month by month. Months with no recorded price fall back to cost.
- **Market Value by Holding** — each holding's current value as a bar.
- **Portfolio Return** — money-weighted return (XIRR) and simple gain for all your holdings together, per currency. Cash and deposit accounts are not included.
- **Returns by Asset Class** — the same two returns per asset class.
- **Unattributed Dividends** — a warning figure, with a **by-account list** beside it, for cash dividends that aren't linked to a holding and so are left out of the returns by asset class (they still count in the portfolio return). Empty when everything is attributed. See [Attributing dividends](/reference/investments/#attributing-dividends-to-the-holding-that-paid-them).
- **Holdings** — a sortable table: units, average cost, cost basis, last price, market value, gain/loss, and weight. Click a holding to load its lots and price history below.
- **Purchase Lots** and **Price History** — the lots and recorded prices for the holding selected in the table.

#### Cash & Deposits

Every currency-balance account — checking, savings, CDs, bonds recorded as a cash balance.

- **Total Cash & Deposits** — the sum of these accounts, per currency.
- **Unattributed Interest** — a warning figure, with a **by-account list** below, for interest that couldn't be tied to the account that earned it. Empty when everything is attributed. See [Attributing interest](/reference/investments/#attributing-interest-to-the-account-that-earned-it).
- **Accounts** — each account with its type, rate, maturity, balance, interest earned, and effective yield (interest ÷ average balance, annualized), shown next to the stated rate so you can compare promised against delivered.
- **Cash by Type** — a pie of your cash by account type.
- **Upcoming Maturities** — term instruments with a recorded maturity date, soonest first.

#### Returns & Income

What your money earned — income and realized gains.

- **Interest & Dividends** — total interest plus dividend income received, per currency.
- **Realized Gain** — total realized capital gain or loss on sold holdings.
- **Interest & Dividends Over Time** — dividends and interest received per year.
- **Interest & Dividends by Source** — which accounts the income came from.
- **Realized Gain by Year** — realized gains per year, split into short- and long-term by holding period.
- **Sales** — every sale: date, holding, proceeds, cost basis, and realized gain, consolidated across accounts.

The realized-gains figures are derived from your ledger and are **not a tax document** — they apply no wash-sale rules or broker lot-selection, so they can differ from your 1099-B. For tax, use your broker's official statements.

### Widget Gallery

A reference dashboard with one example of every widget type the app supports — KPI, bar, line, area, pie, scatter, treemap, table, pivot, funnel, gauge, calendar heatmap, sankey, radar, and sunburst. Each widget hovers a small **ⓘ** icon next to its title that, on hover, explains the type's gotchas (data shape requirements, encoding patterns, click-through behaviour, etc.).

Treat the gallery as both:

- **A working visual reference** — see how each chart type renders against your own data before committing to use it.
- **A starting point for new dashboards** — find the closest example, click **Manage Recipes**, and copy the underlying widget JSON to use as a template. The full source for the gallery dashboard lives at `backend/resources/seed_config/recipes/dashboards/widget-gallery.json`. See the [Dashboard Recipes reference](/reference/dashboard-recipes/) for the recipe format.

Editing the user-facing copy of the gallery (in `config/recipes/dashboards/widget-gallery.json`) only affects what *you* see in the app — the AI assistant always reads its own copy from the bundled seed and is unaffected.

### Budget dashboards

Four budget dashboards, one per genuinely distinct budgeting style. They render against your `custom "budget"` directives, so they show data once you've set budgets (see the **[Budgets](/views/budgets/)** view). They're calibrated to the example ledger, so treat them as templates to copy and re-point at your own accounts.

- **Budget: Overview** — at-a-glance budgeted / spent / remaining KPIs, a per-account progress list, and the spending outside any budget. The basis for the no-rollover, 50/30/20, and pay-yourself-first styles.
- **Budget: Envelopes** — envelope budgeting with rollover: every envelope's balance at a glance, then click one to drill into its month-by-month available, spent, and carryover.
- **Budget: Zero-based** — a total budget on an umbrella account (a real grouping account, or the whole-expenses root via a quoted directive) plus named carve-outs, with everything else collapsed into an **Unbudgeted** bucket that reconciles to the total, and a sunburst carving the total all the way down.
- **Budget: History** — budget vs actual month by month over any window (defaults to the trailing year), plus a per-account adherence heat-map (green under, red over).

Two more popular styles — **50/30/20** and **pace / burn-down** — are quick recipes over the same building blocks rather than separate dashboards; the **[Budgets guide](/views/budgets/#other-styles-build-your-own)** shows how to build them, and how to copy any demo and adapt it to your accounts.

These dashboards support multiple currencies and include click-through links — clicking on KPI values, chart elements, or table cells navigates you to the Transactions view with the appropriate filters pre-applied.

---

## Creating Dashboards

There are three ways to create new dashboards:

### Using the AI Assistant

If you have [AI configured](/quick-start/#configuring-ai), you can describe the dashboard you want in the [AI Assistant](/views/ai-assistant/#analyst-mode-building-dashboards) and it will generate the recipe for you. For example, you might say "Create a dashboard that shows my top 10 expense categories as a bar chart and a monthly spending trend as a line chart."

### Using the Settings Editor

Go to **Settings > Dashboards** to create and edit dashboards using a JSON editor with live preview. Click **"+ New"**, write or paste your dashboard JSON, and use the **Refresh Preview** button to see a live rendering of your layout. See [Dashboard Recipes](/reference/dashboard-recipes/) for the full recipe reference.

### Editing Recipe Files Directly

Dashboards are JSON files stored in `config/recipes/dashboards/`, one file per dashboard; each widget is defined **inline** within its dashboard (there is no separate widget file). You can create or edit these files with any text editor. After making changes, click the **Reload** button in the dashboard tab bar to pick up the new files. See [Dashboard Recipes](/reference/dashboard-recipes/) for the recipe format and options.
