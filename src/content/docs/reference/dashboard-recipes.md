---
title: Dashboard & Widget Recipes
description: Complete reference for the JSON recipe system that powers Finzytrack dashboards and widgets.
sidebar:
  order: 1
---

:::note
If you have [AI configured](/quick-start/#configuring-ai), you can [build dashboards conversationally](/views/ai-assistant/#analyst-mode-building-dashboards) using the AI assistant — describe what you want to see and it will create the recipe for you. If you prefer to create recipes manually, or want to understand and fine-tune what the assistant generates, read on.
:::

Dashboards and widgets in Finzytrack are defined using **JSON recipe files**. There are two types of recipes:

- **Dashboard recipes** define a grid layout containing multiple widgets — KPI cards, charts, tables, and pivot tables.
- **Widget recipes** define a single, self-contained visualization that can be reused across multiple dashboards.

Both types are plain JSON files — no code changes or rebuilds required.

## Concepts

A **widget** is the fundamental building block. Each widget runs a query (SQL or BQL) against your ledger data and displays the results as a KPI card, chart, table, or pivot table. Widgets can have interactive **parameters** (dropdowns, number inputs) that filter the data.

A **dashboard** arranges multiple widgets in a grid layout. Dashboards can define shared parameters that cascade to all contained widgets. A dashboard can define widgets inline in its own file, reference standalone widget recipes by ID, or mix both approaches (see [Widget Resolution](#widget-resolution)).

**Widget recipes** are standalone JSON files that define a single widget. They are useful when you want a reusable visualization (e.g., an expense treemap or a top-spending bar chart) that can be shared across multiple dashboards without duplicating the definition.

### File Structure

Recipe files live in the `config/recipes/` directory:

```
config/recipes/
├── manifest.json                 # Index of all recipes
├── dashboards/
│   ├── financial-overview.json
│   ├── year-summary.json
│   └── month-summary.json
└── widgets/
    ├── expense-treemap.json
    └── top-spending-categories.json
```

The `manifest.json` file lists all recipe files:

```json
{
  "widgets": [
    "widgets/expense-treemap.json",
    "widgets/top-spending-categories.json"
  ],
  "dashboards": [
    "dashboards/year-summary.json",
    "dashboards/month-summary.json",
    "dashboards/financial-overview.json"
  ]
}
```

When you add a new recipe file through the app's recipe editor, the manifest is updated automatically. If you add files manually, you must add their paths to the manifest for them to be loaded.

---

## Dashboard Structure

A dashboard recipe is a JSON file with the following top-level structure:

```json
{
  "id": "my-dashboard",
  "title": "My Dashboard",
  "description": "Optional description shown in the dashboard picker",
  "parameters": [],
  "layout": {
    "columns": 12,
    "gap": "1.5rem",
    "rowHeight": "140px",
    "widgets": []
  },
  "widgets": []
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier. Lowercase letters, numbers, and hyphens only (e.g., `my-dashboard`). |
| `title` | string | Display title shown in the dashboard picker and header. |
| `layout` | object | Grid layout configuration (see [Layout](#layout)). |
| `widgets` | array | Inline widget definitions (see [Widget Structure](#widget-structure)). |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | One-line description shown in the dashboard picker. |
| `parameters` | array | Dashboard-level parameters shared by all widgets (see [Parameters](#parameters)). |

### Widget Resolution

When a dashboard layout references a `widgetId`, the app looks for the widget in this order:

1. **Inline widgets** — the dashboard's own `widgets` array.
2. **Standalone widget recipes** — widget recipe files listed in the manifest.

This means a dashboard can reference standalone widget recipes by ID without redefining them inline. For example, a dashboard can use the `expense-treemap` widget from `widgets/expense-treemap.json` simply by referencing it in the layout:

```json
{
  "layout": {
    "columns": 12,
    "widgets": [
      { "widgetId": "expense-treemap", "gridArea": "2 / 1 / 6 / 13" }
    ]
  },
  "widgets": []
}
```

The `widgets` array can be empty (or contain only the other widgets) — the `expense-treemap` widget will be resolved from the standalone recipe file. You can mix inline and standalone widgets freely in the same dashboard.

:::caution
If a dashboard defines an inline widget with the same ID as a standalone widget recipe, the inline definition takes precedence and the standalone recipe is silently ignored for that dashboard. This can cause confusion — the app will warn you about such conflicts (see [ID Conflict Detection](#id-conflict-detection)).
:::

---

## Layout

Dashboards use CSS Grid for layout. The `layout` object configures the grid and places widgets within it.

```json
"layout": {
  "columns": 12,
  "gap": "1.5rem",
  "rowHeight": "140px",
  "widgets": [
    { "widgetId": "net-worth", "gridArea": "1 / 1 / 2 / 5" },
    { "widgetId": "total-assets", "gridArea": "1 / 5 / 2 / 9" },
    { "widgetId": "total-liabilities", "gridArea": "1 / 9 / 2 / 13" },
    { "widgetId": "assets-pie", "gridArea": "2 / 1 / 5 / 7" },
    { "widgetId": "liabilities-pie", "gridArea": "2 / 7 / 5 / 13" }
  ]
}
```

### Layout Properties

| Property | Type | Description |
|----------|------|-------------|
| `columns` | number | Number of grid columns. Use `12` for multi-widget layouts, `6` for simpler ones. |
| `gap` | string | CSS gap between widgets. Default: `"1.5rem"`. |
| `rowHeight` | string | Height of each grid row. Use `"140px"` for KPI-heavy layouts, `"200px"` for chart-heavy ones. |
| `widgets` | array | Widget placement definitions (see below). |

### Widget Placement

Each entry in `layout.widgets` places one widget on the grid:

| Property | Type | Description |
|----------|------|-------------|
| `widgetId` | string | Must match an `id` in the `widgets` array. |
| `gridArea` | string | CSS grid-area: `"row-start / col-start / row-end / col-end"` (1-based). |

**Rules:**
- Every `widgetId` must have a matching widget `id` in the `widgets` array.
- Column values must not exceed `columns + 1`.
- Row and column indices are 1-based.

### Common Grid Patterns (12-column)

**Three KPIs across the top:**
```json
{ "widgetId": "kpi-1", "gridArea": "1 / 1 / 2 / 5" },
{ "widgetId": "kpi-2", "gridArea": "1 / 5 / 2 / 9" },
{ "widgetId": "kpi-3", "gridArea": "1 / 9 / 2 / 13" }
```

**Four KPIs across the top:**
```json
{ "widgetId": "kpi-1", "gridArea": "1 / 1 / 2 / 4" },
{ "widgetId": "kpi-2", "gridArea": "1 / 4 / 2 / 7" },
{ "widgetId": "kpi-3", "gridArea": "1 / 7 / 2 / 10" },
{ "widgetId": "kpi-4", "gridArea": "1 / 10 / 2 / 13" }
```

**Full-width chart (3 rows tall, below KPIs):**
```json
{ "widgetId": "chart", "gridArea": "2 / 1 / 5 / 13" }
```

**Two half-width charts side by side:**
```json
{ "widgetId": "chart-left", "gridArea": "2 / 1 / 5 / 7" },
{ "widgetId": "chart-right", "gridArea": "2 / 7 / 5 / 13" }
```

**Single-widget dashboard** (use `columns: 6`):
```json
{ "widgetId": "main-chart", "gridArea": "1 / 1 / 5 / 7" }
```

:::tip
KPIs typically occupy 1 row. Charts and tables need 3-4 rows to have enough height. A good rule of thumb: make charts span at least 3 rows (e.g., `"2 / 1 / 5 / 13"` spans rows 2-4).
:::

---

## Widget Structure

Each widget is defined inline within the dashboard's `widgets` array:

```json
{
  "id": "total-income",
  "title": "Total Income",
  "description": "Sum of all income for the selected year",
  "helpText": "Income amounts are shown as positive values",
  "parameters": [],
  "dbType": "sqlite",
  "query": "SELECT currency, SUM(amount) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year GROUP BY currency HAVING amount != 0",
  "transform": "firstRow",
  "visualization": { "type": "kpi", "icon": "↑", "iconColor": "green" }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier within the dashboard. Lowercase letters, numbers, hyphens. |
| `title` | string | Display title shown in the widget header. |
| `query` | string | Query to execute — SQL or BQL depending on `dbType` (see [Queries](#queries)). |
| `visualization` | object | How to display results (see [Visualizations](#visualizations)). |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Description shown below the title. |
| `helpText` | string | Tooltip text shown when hovering the info icon. |
| `parameters` | array | Widget-level parameters (see [Parameters](#parameters)). |
| `dbType` | string | Query engine: `"sqlite"` (default) or `"beanquery"`. See [Querying Data](/reference/querying-data/) for details on each engine. |
| `transform` | string or object | Data transformation before visualization (see [Transforms](#transforms)). |

---

## Parameters

Parameters add interactive controls (dropdowns, number inputs) to dashboards and widgets. Parameter values are injected into SQL queries as `:paramName` placeholders.

### Parameter Definition

```json
{
  "name": "year",
  "label": "Year",
  "type": "select",
  "default": { "$gen": "currentYear" },
  "options": { "$gen": "yearRange", "count": 6 }
}
```

### Parameter Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | **Required.** Identifier used as `:name` in queries. |
| `label` | string | **Required.** Display label for the control. |
| `type` | string | **Required.** One of: `"select"`, `"number"`, `"date"`. |
| `default` | any | Default value. Can be a literal or a `$gen` generator. |
| `options` | array | For `select` type: array of `{ "value": ..., "label": "..." }` objects. Can be a `$gen` generator. |
| `optionsFrom` | string | For `select` type: dynamic option source. Currently only `"currencies"` is supported (populates from ledger currencies). |
| `min` | number | For `number` type: minimum value. |
| `max` | number | For `number` type: maximum value. |

### Parameter Types

**Select** — dropdown menu:
```json
{
  "name": "year",
  "label": "Year",
  "type": "select",
  "default": { "$gen": "currentYear" },
  "options": { "$gen": "yearRange", "count": 6 }
}
```

**Number** — numeric input with constraints:
```json
{
  "name": "limit",
  "label": "Show Top",
  "type": "number",
  "default": 10,
  "min": 5,
  "max": 50
}
```

**Date** — date picker:
```json
{
  "name": "startDate",
  "label": "Start Date",
  "type": "date",
  "default": { "$gen": "startOfYear" }
}
```

### Dashboard vs Widget Parameters

- **Dashboard-level parameters** are defined in the dashboard's `parameters` array and cascade to all widgets. They appear in the dashboard header.
- **Widget-level parameters** are defined in each widget's `parameters` array. They appear in the widget header.
- If a widget defines a parameter with the same `name` as a dashboard parameter, the dashboard value takes precedence.
- Parameters that the dashboard already provides are hidden from the widget header (no duplicate controls).

### Using Parameters in Queries

Reference parameters in SQL using `:paramName`:

```sql
SELECT account, SUM(amount) AS total
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year
  AND currency = :currency
GROUP BY account
ORDER BY total DESC
LIMIT :limit
```

---

## Generators ($gen)

Generators produce dynamic values at load time — default parameter values, option lists, and dates that stay current. Use the `{ "$gen": "generatorName" }` syntax.

Generators can appear anywhere in the recipe JSON. Any object with a `"$gen"` key is replaced with the generator's output when the recipe is loaded.

### Available Generators

#### Value Generators

| Generator | Output | Usage |
|-----------|--------|-------|
| `currentYear` | Current year as a number | `{ "$gen": "currentYear" }` |
| `currentMonth` | Current month (1-12) | `{ "$gen": "currentMonth" }` |
| `defaultCurrency` | User's default currency string | `{ "$gen": "defaultCurrency" }` |
| `today` | Today's date as YYYY-MM-DD | `{ "$gen": "today" }` |

#### Date Generators

| Generator | Args | Output | Usage |
|-----------|------|--------|-------|
| `startOfMonth` | `offset` (optional, default 0) | First day of month | `{ "$gen": "startOfMonth" }` |
| `endOfMonth` | `offset` (optional, default 0) | Last day of month | `{ "$gen": "endOfMonth" }` |
| `startOfYear` | `offset` (optional, default 0) | First day of year | `{ "$gen": "startOfYear" }` |
| `endOfYear` | `offset` (optional, default 0) | Last day of year | `{ "$gen": "endOfYear" }` |

The `offset` argument shifts relative to the current date. For month generators, `-1` means the previous month, `1` means the next month. For year generators, `-1` means the previous year, and so on. For example, `{ "$gen": "startOfMonth", "offset": -1 }` returns the first day of last month.

#### Option Generators

These return arrays of `{ "value": ..., "label": "..." }` objects, suitable for `select` parameter options.

| Generator | Args | Output |
|-----------|------|--------|
| `yearRange` | `count` (default 5) | Array of recent years, descending. `{ "$gen": "yearRange", "count": 6 }` |
| `monthOptions` | `format` (`"long"` or `"short"`, default `"long"`) | All 12 months. `{ "$gen": "monthOptions" }` |
| `quarterOptions` | — | Q1 through Q4. `{ "$gen": "quarterOptions" }` |
| `accountTypeOptions` | — | Assets, Liabilities, Income, Expenses, Equity. |
| `datePresets` | — | Predefined date range labels: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Quarter, This Year, Last Year. |

---

## Queries

Each widget's `query` field contains a query that fetches data from your ledger. By default, queries use SQL against a SQLite export of your Beancount ledger. You can also use BQL (Beancount Query Language) by setting `dbType: "beanquery"` on the widget.

For the complete query reference — table schema, sign conventions, multi-currency rules, SQL syntax, BQL syntax, and common query patterns — see the **[Querying Data](/reference/querying-data/)** reference.

Here's a quick summary of what you need to know for writing recipe queries:

- Queries run against the `postings` table (SQL) or Beancount entries directly (BQL).
- Use `:paramName` placeholders for parameter values in SQL queries (e.g., `:year`, `:currency`).
- Always `GROUP BY currency` or filter `WHERE currency = :currency` when summing amounts — never sum across currencies.
- Use `HAVING amount != 0` or `HAVING value > 0` to exclude zero-value rows.
- Income amounts are negative (credit) — use `SUM(amount) * -1` to display as positive.
- Expense amounts are positive (debit) — use `SUM(amount)` directly.
- For treemap and pie charts, the query must return `name` and `value` columns, and must include `HAVING value > 0` to exclude negative/zero values (which these chart types cannot display).

:::tip[Computed columns for click-through links]
You can include computed date columns in your query that aren't displayed but are used by [click-through links](#click-through-links):
```sql
SELECT account, SUM(amount) AS total,
  :year || '-' || printf('%02d', :month) || '-01' AS dateFrom,
  date(:year || '-' || printf('%02d', :month) || '-01', '+1 month', '-1 day') AS dateTo
FROM postings
WHERE ...
```
These columns can then be referenced in `clickLink` templates as `{{data.dateFrom}}` and `{{data.dateTo}}`.
:::

---

## Transforms

Transforms modify query results before they are passed to the visualization. Most widgets don't need a transform — the query results are used directly.

### Simple Transforms

Specify as a string in the widget's `transform` field:

| Transform | Description |
|-----------|-------------|
| `"none"` | No transform (default). Rows passed as-is. |
| `"firstRow"` | Extracts the first row as a single object. Use for single-value KPIs from multi-row queries. |
| `"firstValue"` | Extracts the first numeric value from the first row. |

### Configurable Transforms

Specify as an object:

**Sort rows:**
```json
{ "type": "sortBy", "field": "total", "order": "desc" }
```
| Property | Type | Description |
|----------|------|-------------|
| `field` | string | Column name to sort by. |
| `order` | string | `"asc"` or `"desc"` (default: `"asc"`). |

**Limit rows:**
```json
{ "type": "limit", "count": 10 }
```

**Pivot (cross-tabulation):**
```json
{
  "type": "pivot",
  "rowField": "account",
  "columnField": "year_month",
  "valueField": "amount",
  "formatColumn": "monthYear",
  "sortRowsBy": "total_desc"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `rowField` | string | Column to use as row labels (default: `"account"`). |
| `columnField` | string | Column to use as column headers (default: `"year_month"`). |
| `valueField` | string | Column containing the numeric values (default: `"amount"`). |
| `formatColumn` | string | Column header format: `"monthYear"` (e.g., "Jan 2026") or `"yearMonth"` (e.g., "2026-01"). |
| `sortRowsBy` | string | Row sort order. `total` sorts by the sum of all values across columns for each row; `label` sorts alphabetically by the row label. Options: `"total_desc"`, `"total_asc"`, `"label_asc"`, `"label_desc"`. Default: `"total_desc"`. |

The pivot transform is required when using the `pivot` visualization type. It restructures flat query results (one row per account+month) into a cross-tabulation structure.

When `columnField` contains `YYYY-MM` values (e.g., `"2026-01"`, `"2026-02"`), the pivot transform automatically generates **column metadata** for each column:
- `columnMeta.rawValue` — the original column key (e.g., `"2026-01"`)
- `columnMeta.startDate` — the first day of that month (e.g., `"2026-01-01"`)
- `columnMeta.endDate` — the last day of that month (e.g., `"2026-01-31"`)

This metadata is available in pivot table click-through link templates (see [Click-Through Links](#click-through-links)).

---

## Visualizations

The `visualization` object in each widget determines how query results are displayed.

### KPI — Single Metric Display

Displays a single value prominently, with an optional icon and color.

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"kpi"`. |
| `icon` | string | Single character or emoji displayed in a colored circle (e.g., `"$"`, `"↑"`, `"↓"`, `"#"`). |
| `iconColor` | string | Icon background color: `"blue"`, `"green"`, `"red"`, `"purple"`, or `"amber"`. |
| `format` | string | Value format (see [Formats](#formats)). |
| `valueField` | string | Column name to display as the KPI value (default: `"value"`). |
| `multiCurrency` | boolean | If `true`, displays one amount per currency, stacked vertically. The query must return one row per currency with `currency` and `amount` columns (or the columns specified by `currencyField` and `amountField`). |
| `amountField` | string | Column name for amounts when `multiCurrency` is true (default: `"amount"`). |
| `currencyField` | string | Column name for currencies when `multiCurrency` is true (default: `"currency"`). |
| `showTrend` | boolean | Show a trend indicator below the value (e.g., "+5.2% vs prior"). Requires `trendField`. |
| `trendField` | string | Column name containing the trend percentage. Positive values show as green (up), negative as red (down). |
| `clickLink` | object | Makes the KPI value clickable, navigating to a filtered view. See [Click-Through Links](#click-through-links). |

#### Single-value KPI

The query returns one row with a numeric column. Use `transform: "firstRow"` and `valueField` to extract the value.

```json
{
  "id": "transaction-count",
  "title": "Transaction Count",
  "query": "SELECT COUNT(DISTINCT transaction_id) AS value FROM postings WHERE year = :year",
  "transform": "firstRow",
  "visualization": {
    "type": "kpi",
    "icon": "#",
    "iconColor": "purple",
    "valueField": "value",
    "format": "number"
  }
}
```

#### Multi-currency KPI

The query returns one row per currency. Each currency is displayed stacked vertically with the amount formatted in that currency.

```json
{
  "id": "total-income",
  "title": "Total Income",
  "query": "SELECT currency, SUM(amount) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year GROUP BY currency HAVING amount != 0",
  "visualization": {
    "type": "kpi",
    "icon": "↑",
    "iconColor": "green",
    "multiCurrency": true
  }
}
```

If your query uses different column names than `currency` and `amount`, specify them with `currencyField` and `amountField`:

```json
{
  "id": "assets-by-currency",
  "title": "Total Assets",
  "query": "SELECT currency AS cur, SUM(amount) AS total FROM postings WHERE account_type = 'Assets' GROUP BY currency HAVING total != 0",
  "visualization": {
    "type": "kpi",
    "icon": "↑",
    "iconColor": "green",
    "multiCurrency": true,
    "amountField": "total",
    "currencyField": "cur"
  }
}
```

#### KPI with trend

The query includes a trend column (typically a percentage change vs a prior period). The trend is shown below the main value.

```json
{
  "id": "monthly-expenses",
  "title": "This Month's Expenses",
  "query": "SELECT SUM(amount) AS value, ROUND((SUM(amount) - prev.total) * 100.0 / prev.total, 1) AS trend FROM postings, (SELECT SUM(amount) AS total FROM postings WHERE account_type = 'Expenses' AND year_month = strftime('%Y-%m', date('now', '-1 month'))) prev WHERE account_type = 'Expenses' AND year_month = strftime('%Y-%m', 'now')",
  "transform": "firstRow",
  "visualization": {
    "type": "kpi",
    "icon": "↓",
    "iconColor": "red",
    "valueField": "value",
    "format": "currency",
    "showTrend": true,
    "trendField": "trend"
  }
}
```

#### KPI with click-through

Clicking the KPI navigates to the Transactions view with filters applied. The `clickLink` object is not a SQL query — it defines navigation parameters. See [Click-Through Links](#click-through-links) for the full reference.

Values in `{{...}}` are template variables that get replaced at click time. For KPI widgets, `{{dateFrom}}` and `{{dateTo}}` are special shorthand variables automatically computed from the widget's `year` and `month` parameters — for example, if `year` is 2026, `{{dateFrom}}` resolves to `"2026-01-01"` and `{{dateTo}}` to `"2026-12-31"`. If both `year` and `month` are present, the range narrows to that specific month. You can also use `{{parameters.paramName}}` to reference any parameter value directly.

```json
{
  "id": "total-expenses",
  "title": "Total Expenses",
  "query": "SELECT currency, SUM(amount) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year GROUP BY currency HAVING amount != 0",
  "visualization": {
    "type": "kpi",
    "icon": "↓",
    "iconColor": "red",
    "multiCurrency": true,
    "clickLink": {
      "name": "transactions",
      "query": {
        "accountContains": "Expenses",
        "dateFrom": "{{dateFrom}}",
        "dateTo": "{{dateTo}}"
      }
    }
  }
}
```

### Chart — ECharts Visualizations

Renders charts using [Apache ECharts](https://echarts.apache.org/). Supported chart types: `bar`, `line`, `pie`, `area`, `scatter`, `treemap`.

```json
{
  "type": "chart",
  "chartType": "bar",
  "seriesLabelFormat": "compact",
  "yAxisLabelFormat": "compact",
  "xAxisLabelFormat": "accountName",
  "options": { ... },
  "clickLink": { ... },
  "seriesClickLinks": { ... }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"chart"`. |
| `chartType` | string | **Required.** One of: `"bar"`, `"line"`, `"pie"`, `"area"`, `"scatter"`, `"treemap"`. |
| `options` | object | ECharts configuration (grid, axes, series, legend, tooltip). |
| `seriesLabelFormat` | string | Format for data point labels (see [Formats](#formats)). |
| `yAxisLabelFormat` | string | Format for Y-axis tick labels. |
| `xAxisLabelFormat` | string | Format for X-axis tick labels. |
| `clickLink` | object | Default click-through link for all series (see [Click-Through Links](#click-through-links)). |
| `seriesClickLinks` | object | Per-series click-through link overrides (see [Click-Through Links](#click-through-links)). |

The `options` object uses standard [Apache ECharts configuration](https://echarts.apache.org/en/option.html). Properties like `xAxis`, `yAxis`, `series`, `grid`, `legend`, and `tooltip` follow the ECharts API directly — refer to the [ECharts documentation](https://echarts.apache.org/en/option.html) for the full set of available options. The app processes `options` lightly before passing it to ECharts: it injects your query results as the chart's dataset, applies dark mode styling to text and grid lines, and applies any label formats you specified (e.g., `seriesLabelFormat`). Everything else is standard ECharts.

#### How Query Results Connect to Charts

The app takes your query results and injects them into ECharts as a [`dataset.source`](https://echarts.apache.org/en/option.html#dataset.source) — an array of row objects. For example, if your query returns:

```json
[
  { "month_label": "Jan", "expenses": 1200, "income": 3000 },
  { "month_label": "Feb", "expenses": 900, "income": 3100 }
]
```

You then use the standard ECharts [`encode`](https://echarts.apache.org/en/option.html#series-bar.encode) property in your series to map query column names to chart dimensions:

```json
"series": [
  {
    "name": "Expenses",
    "type": "bar",
    "encode": { "x": "month_label", "y": "expenses" }
  },
  {
    "name": "Income",
    "type": "bar",
    "encode": { "x": "month_label", "y": "income" }
  }
]
```

ECharts matches the `encode` field names against the keys in the dataset objects. This is how you control which query columns appear on which axes and series — you write the SQL column names (or aliases) and reference them in `encode`.

:::note[Treemap exception]
Treemaps do not use `dataset.source` or `encode`. Instead, the app injects query results directly into `series[0].data`. The query must return `name` and `value` columns. See [Treemap](#treemap) for details.
:::

#### Bar Chart

Vertical bars (category on X, value on Y):
```json
{
  "type": "chart",
  "chartType": "bar",
  "seriesLabelFormat": "compact",
  "yAxisLabelFormat": "compact",
  "options": {
    "legend": { "data": ["Expenses", "Income"], "top": 0, "left": "left", "itemGap": 20 },
    "grid": { "top": 40, "bottom": 40, "left": 50, "right": 20 },
    "xAxis": { "type": "category" },
    "yAxis": { "type": "value" },
    "series": [
      {
        "name": "Expenses",
        "type": "bar",
        "encode": { "x": "month_label", "y": "expenses" },
        "itemStyle": { "color": "#E8A951" },
        "label": { "show": true, "position": "top", "fontSize": 10 }
      },
      {
        "name": "Income",
        "type": "bar",
        "encode": { "x": "month_label", "y": "income" },
        "itemStyle": { "color": "#7DD3C0" },
        "label": { "show": true, "position": "top", "fontSize": 10 }
      }
    ]
  }
}
```

Horizontal bars (category on Y, value on X):
```json
{
  "type": "chart",
  "chartType": "bar",
  "seriesLabelFormat": "currency",
  "xAxisLabelFormat": "compact",
  "yAxisLabelFormat": "accountName",
  "options": {
    "grid": { "left": 120, "right": 24, "top": 16, "bottom": 16 },
    "xAxis": { "type": "value" },
    "yAxis": { "type": "category", "axisLabel": { "width": 100, "overflow": "truncate" } },
    "series": [
      {
        "name": "Amount",
        "type": "bar",
        "encode": { "x": "total", "y": "account" },
        "itemStyle": { "color": "#6366f1" },
        "label": { "show": true, "position": "right" }
      }
    ]
  }
}
```

Key concepts:
- `encode` maps query column names to chart dimensions: `{ "x": "column_name", "y": "column_name" }`.
- Multiple `series` entries create grouped bars. Use `"barGap": "10%"` to control spacing.
- The app injects query results as a `dataset.source` — you don't need to provide data in the options.

#### Line Chart

Same structure as bar chart, but with `"chartType": "line"` and series `"type": "line"`:

```json
{
  "type": "chart",
  "chartType": "line",
  "options": {
    "grid": { "top": 40, "bottom": 40, "left": 50, "right": 20 },
    "xAxis": { "type": "category" },
    "yAxis": { "type": "value" },
    "series": [
      {
        "name": "Balance",
        "type": "line",
        "encode": { "x": "month_label", "y": "balance" },
        "smooth": true,
        "itemStyle": { "color": "#6366f1" }
      }
    ]
  }
}
```

Add `"smooth": true` for smooth curves. Add `"areaStyle": {}` to fill the area under the line.

#### Area Chart

Use `"chartType": "area"` with series `"type": "line"` and `"areaStyle": {}`:

```json
{
  "type": "chart",
  "chartType": "area",
  "options": {
    "xAxis": { "type": "category" },
    "yAxis": { "type": "value" },
    "series": [
      {
        "name": "Net Worth",
        "type": "line",
        "encode": { "x": "month_label", "y": "net_worth" },
        "areaStyle": { "opacity": 0.3 },
        "itemStyle": { "color": "#6366f1" }
      }
    ]
  }
}
```

#### Pie Chart

```json
{
  "type": "chart",
  "chartType": "pie",
  "options": {
    "tooltip": { "trigger": "item" },
    "series": [
      {
        "type": "pie",
        "radius": ["30%", "60%"],
        "encode": { "itemName": "name", "value": "value" },
        "label": { "show": true, "formatter": "{b}: {d}%" }
      }
    ]
  }
}
```

- Query must return `name` and `value` columns.
- Pie charts cannot display negative or zero values. Your SQL query must include `HAVING value > 0` to filter them out.
- `radius: ["30%", "60%"]` creates a donut chart. Use `"50%"` for a solid pie.
- Pie charts have no axes — don't include `xAxis` or `yAxis`.
- Use `"tooltip": { "trigger": "item" }` (not `"axis"`).

#### Scatter Chart

```json
{
  "type": "chart",
  "chartType": "scatter",
  "options": {
    "xAxis": { "type": "value" },
    "yAxis": { "type": "value" },
    "series": [
      {
        "type": "scatter",
        "encode": { "x": "income", "y": "expenses" },
        "itemStyle": { "color": "#6366f1" }
      }
    ]
  }
}
```

#### Treemap

```json
{
  "type": "chart",
  "chartType": "treemap",
  "options": {
    "tooltip": { "trigger": "item" },
    "series": [
      {
        "type": "treemap",
        "roam": false,
        "breadcrumb": { "show": false },
        "label": { "show": true, "formatter": "{b}" },
        "itemStyle": { "borderColor": "#fff", "borderWidth": 2, "gapWidth": 2 },
        "levels": [
          {
            "itemStyle": { "borderColor": "#555", "borderWidth": 2, "gapWidth": 2 }
          }
        ]
      }
    ]
  }
}
```

:::caution[Treemap rules]
Treemaps have special requirements that differ from other chart types:

- Query **must** return `name` and `value` columns (exactly these names).
- **Do not** use `encode` in the series config. The app injects data directly into `series[0].data`.
- Treemaps cannot display negative or zero values. Your SQL query must include `HAVING value > 0` to filter them out.
- **Do not** set label colors — the treemap auto-adjusts label contrast for readability.
:::

### Table

Displays query results as a simple data table.

```json
{
  "type": "table",
  "columns": [
    { "key": "account", "label": "Account" },
    { "key": "total", "label": "Total", "align": "right", "format": "currency" },
    { "key": "transaction_count", "label": "Transactions", "align": "right", "format": "number" }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"table"`. |
| `columns` | array | **Required.** Column definitions (see below). |

#### Column Definition

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | **Required.** Query column name to display. |
| `label` | string | **Required.** Column header text. |
| `align` | string | Text alignment: `"left"` (default), `"center"`, `"right"`. |
| `format` | string | Value format (see [Formats](#formats)). |
| `link` | object | Click-through link for cell values (see [Click-Through Links](#click-through-links)). |

### Pivot Table

Displays a cross-tabulation with row and column totals. Requires a `pivot` transform on the widget.

```json
{
  "type": "pivot",
  "rowHeader": "Account",
  "format": "currency",
  "showRowTotals": true,
  "showColumnTotals": true,
  "valueLink": {
    "name": "transactions",
    "query": {
      "accountContains": "{{row.label}}",
      "dateFrom": "{{columnMeta.startDate}}",
      "dateTo": "{{columnMeta.endDate}}"
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"pivot"`. |
| `rowHeader` | string | Label for the row header column (default: `"Account"`). |
| `format` | string | Cell value format (see [Formats](#formats)). |
| `showRowTotals` | boolean | Show a "Total" column on the right (default: `true`). |
| `showColumnTotals` | boolean | Show a totals row at the bottom (default: `true`). |
| `valueLink` | object | Click-through link for cell values (see [Click-Through Links](#click-through-links)). |

A complete pivot widget requires both a pivot transform and a pivot visualization:

```json
{
  "id": "expenses-pivot",
  "title": "Monthly Expenses by Account",
  "parameters": [
    {
      "name": "currency",
      "label": "Currency",
      "type": "select",
      "default": { "$gen": "defaultCurrency" },
      "optionsFrom": "currencies"
    }
  ],
  "query": "SELECT account, year_month, SUM(amount) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year AND currency = :currency GROUP BY account, year_month ORDER BY account, year_month",
  "transform": {
    "type": "pivot",
    "rowField": "account",
    "columnField": "year_month",
    "valueField": "amount",
    "formatColumn": "monthYear",
    "sortRowsBy": "total_desc"
  },
  "visualization": {
    "type": "pivot",
    "rowHeader": "Account",
    "showRowTotals": true,
    "showColumnTotals": true,
    "valueLink": {
      "name": "transactions",
      "query": {
        "accountContains": "{{row.label}}",
        "dateFrom": "{{columnMeta.startDate}}",
        "dateTo": "{{columnMeta.endDate}}"
      }
    }
  }
}
```

---

## Formats

Predefined format strings control how numbers are displayed. They can be used in KPI `format`, chart `seriesLabelFormat`/`yAxisLabelFormat`/`xAxisLabelFormat`, table column `format`, and pivot `format`.

| Format | Output Example | Use For |
|--------|----------------|---------|
| `"currency"` | $14,200.00 or ₹14,20,000.00 | Monetary amounts (currency-aware) |
| `"signedCurrency"` | +$14,200 or -₹500 | Signed monetary amounts (currency-aware) |
| `"compact"` | 14.2k, 1.5M | Large numbers |
| `"number"` | 14,200 | Plain numbers with thousand separators |
| `"percent"` | 42% | Percentages |
| `"date"` | Jan 15, 2026 | ISO dates as readable text |
| `"dateShort"` | 1/15/26 | Short date format |
| `"accountName"` | Groceries | Last segment of an account path |
| `"accountName2"` | Food:Groceries | Last two segments of an account path |

### Currency-Aware Formatting

The `"currency"` and `"signedCurrency"` formats are locale-aware — they use the correct currency symbol and number grouping based on the widget's `currency` parameter. For example:

- A widget with a `currency` parameter set to `"USD"` formats as `$1,234,567.89` (en-US locale)
- A widget with a `currency` parameter set to `"INR"` formats as `₹12,34,567.89` (en-IN locale)

This works automatically: if your widget (or its parent dashboard) has a parameter named `currency`, the format functions pick it up and apply the appropriate locale. If no `currency` parameter exists, the formats default to USD.

**Multi-currency KPI widgets** (`multiCurrency: true`) are a special case — they format each row individually using the currency code from that row's data, so multiple currencies are each displayed with their correct symbol and grouping.

---

## Click-Through Links

Widgets can be made interactive by adding click-through links. Clicking a value navigates to the Transactions view with filters pre-applied.

### Link Structure

```json
{
  "name": "transactions",
  "query": {
    "accountContains": "Expenses",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-12-31"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Route name. Currently only `"transactions"` is supported. |
| `query` | object | Filter parameters for the Transactions view. |

### Supported Query Filters

| Filter | Description |
|--------|-------------|
| `accountContains` | Filter transactions where an account path contains this string. |
| `dateFrom` | Start date (YYYY-MM-DD). |
| `dateTo` | End date (YYYY-MM-DD). |
| `payeeContains` | Filter by payee name. |
| `narrationContains` | Filter by narration text. |

### Template Variables

Link values can use template variables with `{{...}}` syntax. The available variables depend on the visualization type:

#### In Chart `clickLink` and `seriesClickLinks`

| Variable | Description |
|----------|-------------|
| `{{data.columnName}}` | Any column from the clicked data row. |
| `{{parameters.paramName}}` | Current value of a parameter. |

#### In KPI `clickLink`

| Variable | Description |
|----------|-------------|
| `{{parameters.paramName}}` | Current value of a parameter. |
| `{{dateFrom}}` | Computed start date from year/month parameters (`YYYY-01-01` or `YYYY-MM-01`). |
| `{{dateTo}}` | Computed end date from year/month parameters (`YYYY-12-31` or last day of month). |

#### In Pivot Table `valueLink`

| Variable | Description |
|----------|-------------|
| `{{row.label}}` | The row's label (typically the account name). |
| `{{column}}` | The column name. |
| `{{value}}` | The cell value. |
| `{{columnMeta.startDate}}` | Start date of the column period (for YYYY-MM columns: first day of month). |
| `{{columnMeta.endDate}}` | End date of the column period (for YYYY-MM columns: last day of month). |
| `{{columnMeta.rawValue}}` | The raw column key value. |
| `{{parameters.paramName}}` | Current value of a parameter. |

#### In Table Column `link`

| Variable | Description |
|----------|-------------|
| `{{row.columnName}}` | Any column from the row. |
| `{{value}}` | The cell value. |

### Per-Series Click Links (Charts)

For charts with multiple series, you can specify different click-through links for each series:

```json
"seriesClickLinks": {
  "Income": {
    "name": "transactions",
    "query": {
      "accountContains": "Income",
      "dateFrom": "{{data.dateFrom}}",
      "dateTo": "{{data.dateTo}}"
    }
  },
  "Expenses": {
    "name": "transactions",
    "query": {
      "accountContains": "Expenses",
      "dateFrom": "{{data.dateFrom}}",
      "dateTo": "{{data.dateTo}}"
    }
  },
  "Savings": null
}
```

- Keys are the series `name` values from the `options.series` array.
- Set a series to `null` to disable clicking for that series.
- If `seriesClickLinks` is present, it takes priority over `clickLink` for the matching series.

---

## Complete Examples

### Example: Financial Overview Dashboard

A dashboard showing net worth, total assets, total liabilities, and breakdown pie charts.

```json
{
  "id": "financial-overview",
  "title": "Financial Overview",
  "description": "Overview of your financial status with net worth, assets, liabilities, and breakdowns",
  "layout": {
    "columns": 12,
    "gap": "1.5rem",
    "rowHeight": "140px",
    "widgets": [
      { "widgetId": "net-worth", "gridArea": "1 / 1 / 2 / 5" },
      { "widgetId": "total-assets", "gridArea": "1 / 5 / 2 / 9" },
      { "widgetId": "total-liabilities", "gridArea": "1 / 9 / 2 / 13" },
      { "widgetId": "assets-pie", "gridArea": "2 / 1 / 5 / 7" },
      { "widgetId": "liabilities-pie", "gridArea": "2 / 7 / 5 / 13" }
    ]
  },
  "widgets": [
    {
      "id": "net-worth",
      "title": "Net Worth",
      "query": "SELECT currency, SUM(CASE WHEN account_type IN ('Assets', 'Liabilities') THEN amount ELSE 0 END) AS amount FROM postings GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "$",
        "multiCurrency": true
      }
    },
    {
      "id": "total-assets",
      "title": "Total Assets",
      "query": "SELECT currency, SUM(amount) AS amount FROM postings WHERE account_type = 'Assets' GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↑",
        "iconColor": "green",
        "multiCurrency": true
      }
    },
    {
      "id": "total-liabilities",
      "title": "Total Liabilities",
      "query": "SELECT currency, SUM(amount) AS amount FROM postings WHERE account_type = 'Liabilities' GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↓",
        "iconColor": "red",
        "multiCurrency": true
      }
    },
    {
      "id": "assets-pie",
      "title": "Assets Breakdown",
      "helpText": "Only shows accounts with a positive balance",
      "parameters": [
        {
          "name": "currency",
          "label": "Currency",
          "type": "select",
          "default": { "$gen": "defaultCurrency" },
          "optionsFrom": "currencies"
        }
      ],
      "query": "SELECT REPLACE(account, 'Assets:', '') AS name, account, ROUND(SUM(amount), 2) AS value FROM postings WHERE account_type = 'Assets' AND currency = :currency GROUP BY account HAVING value > 0 ORDER BY value DESC",
      "visualization": {
        "type": "chart",
        "chartType": "pie",
        "options": {
          "tooltip": { "trigger": "item" },
          "series": [
            {
              "type": "pie",
              "radius": ["30%", "60%"],
              "encode": { "itemName": "name", "value": "value" },
              "label": { "show": true, "formatter": "{b}: {d}%" }
            }
          ]
        },
        "clickLink": {
          "name": "transactions",
          "query": { "accountContains": "{{data.account}}" }
        }
      }
    },
    {
      "id": "liabilities-pie",
      "title": "Liabilities Breakdown",
      "helpText": "Only shows accounts with outstanding balances",
      "parameters": [
        {
          "name": "currency",
          "label": "Currency",
          "type": "select",
          "default": { "$gen": "defaultCurrency" },
          "optionsFrom": "currencies"
        }
      ],
      "query": "SELECT REPLACE(account, 'Liabilities:', '') AS name, account, ROUND(SUM(amount) * -1, 2) AS value FROM postings WHERE account_type = 'Liabilities' AND currency = :currency GROUP BY account HAVING value > 0 ORDER BY value DESC",
      "visualization": {
        "type": "chart",
        "chartType": "pie",
        "options": {
          "tooltip": { "trigger": "item" },
          "series": [
            {
              "type": "pie",
              "radius": ["30%", "60%"],
              "encode": { "itemName": "name", "value": "value" },
              "label": { "show": true, "formatter": "{b}: {d}%" }
            }
          ]
        },
        "clickLink": {
          "name": "transactions",
          "query": { "accountContains": "{{data.account}}" }
        }
      }
    }
  ]
}
```

**What this demonstrates:**
- Three multi-currency KPI widgets across the top row
- Two half-width pie charts in the second section
- Widget-level currency parameter on pie charts (not shared at dashboard level, since KPIs show all currencies)
- `REPLACE(account, 'Assets:', '')` to create cleaner display names
- Liabilities multiplied by `-1` to show as positive values in pie chart
- `HAVING value > 0` to exclude negative/zero entries from pie charts
- Click-through links using `{{data.account}}`

### Example: Year Summary Dashboard

An annual overview with income, expenses, savings KPIs, a monthly bar chart, and an expense pivot table.

```json
{
  "id": "year-summary",
  "title": "Year Summary",
  "description": "Annual financial summary with income, expenses, and savings breakdown",
  "parameters": [
    {
      "name": "year",
      "label": "Year",
      "type": "select",
      "default": { "$gen": "currentYear" },
      "options": { "$gen": "yearRange", "count": 6 }
    }
  ],
  "layout": {
    "columns": 12,
    "gap": "1.5rem",
    "rowHeight": "140px",
    "widgets": [
      { "widgetId": "total-income", "gridArea": "1 / 1 / 2 / 5" },
      { "widgetId": "total-expenses", "gridArea": "1 / 5 / 2 / 9" },
      { "widgetId": "savings", "gridArea": "1 / 9 / 2 / 13" },
      { "widgetId": "monthly-income-expenses", "gridArea": "2 / 1 / 5 / 13" },
      { "widgetId": "expenses-pivot-table", "gridArea": "5 / 1 / 9 / 13" }
    ]
  },
  "widgets": [
    {
      "id": "total-income",
      "title": "Total Income",
      "query": "SELECT currency, SUM(amount) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↑",
        "iconColor": "green",
        "multiCurrency": true,
        "clickLink": {
          "name": "transactions",
          "query": {
            "accountContains": "Income",
            "dateFrom": "{{dateFrom}}",
            "dateTo": "{{dateTo}}"
          }
        }
      }
    },
    {
      "id": "total-expenses",
      "title": "Total Expenses",
      "query": "SELECT currency, SUM(amount) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↓",
        "iconColor": "red",
        "multiCurrency": true,
        "clickLink": {
          "name": "transactions",
          "query": {
            "accountContains": "Expenses",
            "dateFrom": "{{dateFrom}}",
            "dateTo": "{{dateTo}}"
          }
        }
      }
    },
    {
      "id": "savings",
      "title": "Savings",
      "query": "SELECT currency, (SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END)) - (SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END)) AS amount FROM postings WHERE year = :year AND account_type IN ('Income', 'Expenses') GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "$",
        "iconColor": "blue",
        "multiCurrency": true
      }
    },
    {
      "id": "monthly-income-expenses",
      "title": "Monthly Income & Expenses",
      "description": "Monthly comparison of income, expenses, and savings",
      "parameters": [
        {
          "name": "currency",
          "label": "Currency",
          "type": "select",
          "default": { "$gen": "defaultCurrency" },
          "optionsFrom": "currencies"
        }
      ],
      "query": "SELECT year_month, SUBSTR('JanFebMarAprMayJunJulAugSepOctNovDec', (CAST(strftime('%m', year_month || '-01') AS INTEGER) - 1) * 3 + 1, 3) AS month_label, year_month || '-01' AS dateFrom, date(year_month || '-01', '+1 month', '-1 day') AS dateTo, SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) AS income, SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END) AS expenses, SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) - SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END) AS savings FROM postings WHERE year = :year AND currency = :currency AND account_type IN ('Income', 'Expenses') GROUP BY year_month ORDER BY year_month",
      "visualization": {
        "type": "chart",
        "chartType": "bar",
        "seriesLabelFormat": "compact",
        "yAxisLabelFormat": "compact",
        "seriesClickLinks": {
          "Income": {
            "name": "transactions",
            "query": {
              "accountContains": "Income",
              "dateFrom": "{{data.dateFrom}}",
              "dateTo": "{{data.dateTo}}"
            }
          },
          "Expenses": {
            "name": "transactions",
            "query": {
              "accountContains": "Expenses",
              "dateFrom": "{{data.dateFrom}}",
              "dateTo": "{{data.dateTo}}"
            }
          },
          "Savings": null
        },
        "options": {
          "legend": { "data": ["Expenses", "Income", "Savings"], "top": 0, "left": "left", "itemGap": 20 },
          "grid": { "top": 40, "bottom": 40, "left": 50, "right": 20 },
          "xAxis": { "type": "category" },
          "yAxis": {
            "type": "value",
            "splitLine": { "lineStyle": { "type": "dashed", "opacity": 0.6 } }
          },
          "series": [
            {
              "name": "Expenses",
              "type": "bar",
              "encode": { "x": "month_label", "y": "expenses" },
              "itemStyle": { "color": "#E8A951" },
              "barGap": "10%",
              "label": { "show": true, "position": "top", "fontSize": 10 }
            },
            {
              "name": "Income",
              "type": "bar",
              "encode": { "x": "month_label", "y": "income" },
              "itemStyle": { "color": "#7DD3C0" },
              "label": { "show": true, "position": "top", "fontSize": 10 }
            },
            {
              "name": "Savings",
              "type": "bar",
              "encode": { "x": "month_label", "y": "savings" },
              "itemStyle": { "color": "#7B83AD" },
              "label": { "show": true, "position": "top", "fontSize": 10 }
            }
          ]
        }
      }
    },
    {
      "id": "expenses-pivot-table",
      "title": "Expenses Pivot Table",
      "description": "Monthly breakdown of expenses by account",
      "parameters": [
        {
          "name": "currency",
          "label": "Currency",
          "type": "select",
          "default": { "$gen": "defaultCurrency" },
          "optionsFrom": "currencies"
        }
      ],
      "query": "SELECT account, year_month, SUM(amount) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year AND currency = :currency GROUP BY account, year_month ORDER BY account, year_month",
      "transform": {
        "type": "pivot",
        "rowField": "account",
        "columnField": "year_month",
        "valueField": "amount",
        "formatColumn": "monthYear",
        "sortRowsBy": "total_desc"
      },
      "visualization": {
        "type": "pivot",
        "rowHeader": "Account",
        "showRowTotals": true,
        "showColumnTotals": true,
        "valueLink": {
          "name": "transactions",
          "query": {
            "accountContains": "{{row.label}}",
            "dateFrom": "{{columnMeta.startDate}}",
            "dateTo": "{{columnMeta.endDate}}"
          }
        }
      }
    }
  ]
}
```

**What this demonstrates:**
- Dashboard-level `year` parameter shared by all widgets
- Widget-level `currency` parameter on the chart and pivot (KPIs show all currencies)
- Multi-series bar chart with per-series click links (`seriesClickLinks`)
- Savings series with click disabled (`null`)
- Computed `dateFrom`/`dateTo` columns in SQL for click-through links
- Pivot table with month-formatted columns and cell-level click-through links
- `{{dateFrom}}`/`{{dateTo}}` shorthand in KPI click links (auto-computed from year parameter)

### Example: Month Summary Dashboard

A monthly breakdown with KPIs and an expense treemap. This dashboard mixes inline widgets with a reference to a standalone widget recipe.

```json
{
  "id": "month-summary",
  "title": "Month Summary",
  "description": "Monthly financial summary with income, expenses, and expense treemap breakdown",
  "parameters": [
    {
      "name": "year",
      "label": "Year",
      "type": "select",
      "default": { "$gen": "currentYear" },
      "options": { "$gen": "yearRange", "count": 5 }
    },
    {
      "name": "month",
      "label": "Month",
      "type": "select",
      "default": { "$gen": "currentMonth" },
      "options": { "$gen": "monthOptions" }
    }
  ],
  "layout": {
    "columns": 12,
    "gap": "1.5rem",
    "rowHeight": "140px",
    "widgets": [
      { "widgetId": "monthly-income", "gridArea": "1 / 1 / 2 / 5" },
      { "widgetId": "monthly-expenses", "gridArea": "1 / 5 / 2 / 9" },
      { "widgetId": "monthly-savings", "gridArea": "1 / 9 / 2 / 13" },
      { "widgetId": "expense-treemap", "gridArea": "2 / 1 / 6 / 13" }
    ]
  },
  "widgets": [
    {
      "id": "monthly-income",
      "title": "Total Income",
      "query": "SELECT currency, SUM(amount) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year AND CAST(strftime('%m', transaction_date) AS INTEGER) = :month GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↑",
        "iconColor": "green",
        "multiCurrency": true,
        "clickLink": {
          "name": "transactions",
          "query": {
            "accountContains": "Income",
            "dateFrom": "{{dateFrom}}",
            "dateTo": "{{dateTo}}"
          }
        }
      }
    },
    {
      "id": "monthly-expenses",
      "title": "Total Expenses",
      "query": "SELECT currency, SUM(amount) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year AND CAST(strftime('%m', transaction_date) AS INTEGER) = :month GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "↓",
        "iconColor": "red",
        "multiCurrency": true,
        "clickLink": {
          "name": "transactions",
          "query": {
            "accountContains": "Expenses",
            "dateFrom": "{{dateFrom}}",
            "dateTo": "{{dateTo}}"
          }
        }
      }
    },
    {
      "id": "monthly-savings",
      "title": "Savings",
      "query": "SELECT currency, (SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END)) - (SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END)) AS amount FROM postings WHERE year = :year AND CAST(strftime('%m', transaction_date) AS INTEGER) = :month AND account_type IN ('Income', 'Expenses') GROUP BY currency HAVING amount != 0 ORDER BY currency",
      "visualization": {
        "type": "kpi",
        "icon": "$",
        "iconColor": "blue",
        "multiCurrency": true
      }
    }
  ]
}
```

**What this demonstrates:**
- Dashboard-level `year` and `month` parameters (shared by all widgets)
- **Mixing inline and standalone widgets** — the three KPI widgets are defined inline, while `expense-treemap` is referenced by ID from the standalone [Expense Treemap widget recipe](#example-expense-treemap-widget). It is not defined in this dashboard's `widgets` array — it is resolved via [widget resolution](#widget-resolution) from `widgets/expense-treemap.json`.
- The dashboard's `year` and `month` parameters cascade to the standalone treemap widget, overriding its own defaults. The treemap's `currency` parameter (not provided by the dashboard) appears as a widget-level control in the treemap header.
- Month filtering with `CAST(strftime('%m', transaction_date) AS INTEGER) = :month`
- `{{dateFrom}}`/`{{dateTo}}` shorthand in KPI click links (auto-computed from year + month parameters)

---

## Widget Recipes

Widget recipes are standalone JSON files in `config/recipes/widgets/` that define a single widget. They have the same structure as inline widget definitions (see [Widget Structure](#widget-structure)) — the only difference is that they live in their own file rather than inside a dashboard's `widgets` array.

Widget recipes are listed in `manifest.json` under the `"widgets"` array. Dashboards can reference standalone widget recipes by ID in their layout — see [Widget Resolution](#widget-resolution) for details.

### Example: Expense Treemap Widget

A treemap showing expense categories for a given month, with click-through to transactions.

```json
{
  "id": "expense-treemap",
  "title": "Expense Treemap",
  "description": "Treemap visualization of expenses by account for a given month",
  "helpText": "Only shows categories with net positive expenses",
  "parameters": [
    {
      "name": "year",
      "label": "Year",
      "type": "select",
      "default": { "$gen": "currentYear" },
      "options": { "$gen": "yearRange", "count": 5 }
    },
    {
      "name": "month",
      "label": "Month",
      "type": "select",
      "default": { "$gen": "currentMonth" },
      "options": { "$gen": "monthOptions" }
    },
    {
      "name": "currency",
      "label": "Currency",
      "type": "select",
      "default": { "$gen": "defaultCurrency" },
      "optionsFrom": "currencies"
    }
  ],
  "query": "SELECT REPLACE(account, 'Expenses:', '') AS name, account, SUM(amount) AS value, :year || '-' || printf('%02d', :month) || '-01' AS dateFrom, date(:year || '-' || printf('%02d', :month) || '-01', '+1 month', '-1 day') AS dateTo FROM postings WHERE account_type = 'Expenses' AND year = :year AND CAST(strftime('%m', transaction_date) AS INTEGER) = :month AND currency = :currency GROUP BY account HAVING value > 0 ORDER BY value DESC",
  "visualization": {
    "type": "chart",
    "chartType": "treemap",
    "options": {
      "tooltip": { "trigger": "item" },
      "series": [
        {
          "type": "treemap",
          "roam": false,
          "breadcrumb": { "show": false },
          "label": { "show": true, "formatter": "{b}" },
          "itemStyle": { "borderColor": "#fff", "borderWidth": 2, "gapWidth": 2 },
          "levels": [
            {
              "itemStyle": { "borderColor": "#555", "borderWidth": 2, "gapWidth": 2 }
            }
          ]
        }
      ]
    },
    "clickLink": {
      "name": "transactions",
      "query": {
        "accountContains": "{{data.account}}",
        "dateFrom": "{{data.dateFrom}}",
        "dateTo": "{{data.dateTo}}"
      }
    }
  }
}
```

**What this demonstrates:**
- Three parameters (year, month, currency) all using `$gen` generators
- `optionsFrom: "currencies"` to dynamically load currency options from the ledger
- `REPLACE(account, 'Expenses:', '')` for cleaner treemap labels
- Computed `dateFrom`/`dateTo` columns in SQL for click-through links
- Treemap-specific rules: `name`/`value` columns, no `encode`, `HAVING value > 0`

### Example: Top Spending Categories Widget

A horizontal bar chart of the highest expense accounts.

```json
{
  "id": "top-spending-categories",
  "title": "Top Spending Categories",
  "description": "Highest expense accounts by total amount",
  "parameters": [
    {
      "name": "limit",
      "label": "Show Top",
      "type": "number",
      "default": 10,
      "min": 5,
      "max": 20
    },
    {
      "name": "currency",
      "label": "Currency",
      "type": "select",
      "default": { "$gen": "defaultCurrency" },
      "optionsFrom": "currencies"
    }
  ],
  "query": "SELECT account, SUM(amount) AS total FROM postings WHERE account_type = 'Expenses' AND currency = :currency GROUP BY account ORDER BY total DESC LIMIT :limit",
  "visualization": {
    "type": "chart",
    "chartType": "bar",
    "seriesLabelFormat": "currency",
    "xAxisLabelFormat": "compact",
    "yAxisLabelFormat": "accountName",
    "options": {
      "grid": { "left": 120, "right": 24, "top": 16, "bottom": 16 },
      "xAxis": { "type": "value" },
      "yAxis": { "type": "category", "inverse": true, "axisLabel": { "width": 100, "overflow": "truncate" } },
      "series": [
        {
          "name": "Amount",
          "type": "bar",
          "encode": { "x": "total", "y": "account" },
          "itemStyle": { "color": "#6366f1" },
          "label": { "show": true, "position": "right" }
        }
      ]
    }
  }
}
```

**What this demonstrates:**
- A `number` parameter with `min`/`max` constraints
- A `select` parameter with `optionsFrom` to dynamically populate from ledger currencies
- Horizontal bar chart (value on X, category on Y)
- `ORDER BY total DESC` with `"inverse": true` on yAxis so the highest spending categories appear at the top of the chart (ECharts renders category axes bottom-to-top by default)
- `accountName` format on Y-axis labels to show only the last segment of account paths
- `currency` format on series labels for formatted amounts

---

## Validation Rules

Recipes are validated when saved. Here's a summary of the validation rules:

### Dashboard Validation
- `id`: Required, non-empty, must match `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.
- `title`: Required, non-empty string.
- `layout`: Required object with `columns` (number), `widgets` (array).
- Each layout widget must have `widgetId` (string) and `gridArea` (string).
- Every `widgetId` must match an `id` in the `widgets` array.

### Widget Validation
- `id`: Required, non-empty, must match the same pattern as dashboard IDs.
- `title`: Required, non-empty string.
- `query`: Required, non-empty string. Must be a SELECT statement.
- `visualization`: Required object with `type` in `["kpi", "chart", "table", "pivot"]`.
- For `chart`: `chartType` must be in `["bar", "line", "pie", "area", "scatter", "treemap"]`.
- For `kpi`: `iconColor` must be in `["blue", "green", "red", "purple", "amber"]`.
- `format` and label format strings must be valid format names.
- `transform`: Must be a valid simple string or object transform.

### SQL Validation
- Queries are dry-run against the database at save time to catch syntax errors.
- Only SELECT (and WITH) statements are allowed.

### ID Conflict Detection

Widget and dashboard IDs must be unique across all recipe files. Finzytrack detects the following conflicts:

- **Duplicate widget IDs** — two standalone widget files with the same `id`.
- **Duplicate dashboard IDs** — two dashboard files with the same `id`.
- **Inline widget conflicts** — a standalone widget file with an `id` that matches an inline widget definition inside a dashboard.

When conflicts are detected at load time, an amber warning banner appears at the top of the Dashboards view listing each conflict and the files involved.

When saving a recipe in the Settings view, the editor checks for ID conflicts and shows a confirmation dialog if a conflict is found, giving you the option to go back and change the ID or save anyway.

---

## Tips and Best Practices

### Query Tips
- Always use `HAVING amount != 0` or `HAVING value > 0` to exclude zero-value rows — especially for KPIs and pie charts.
- Use `REPLACE(account, 'Expenses:', '') AS name` to create cleaner display names from account paths.
- Include `ORDER BY` for deterministic chart rendering.
- For horizontal bar charts showing top categories, use `ORDER BY total ASC` (not DESC) so the largest bars appear at the top of the chart.
- Compute `dateFrom` and `dateTo` columns in SQL when you need them for click-through links.

### Layout Tips
- Start with three KPIs in row 1, a full-width chart in rows 2-4, and a table or pivot in rows 5-8.
- KPIs need 1 row of height. Charts and pivots need at least 3 rows.
- Use `"rowHeight": "140px"` for KPI-focused dashboards, `"200px"` for chart-heavy ones.

### Multi-Currency Tips
- For KPIs showing totals across all currencies, use `multiCurrency: true` and `GROUP BY currency`.
- For charts and pivots that need a single currency, add a `currency` parameter with `"optionsFrom": "currencies"` and filter with `WHERE currency = :currency`.
- Common pattern: dashboard-level `year` parameter + widget-level `currency` parameter on charts/pivots, while KPIs show all currencies.

### Dark Mode
- The app automatically handles dark mode styling for charts, including text colors, grid lines, and borders.
- Don't hardcode text colors in chart labels — the app adjusts them automatically.
- Exception: `itemStyle.color` (bar/line/pie colors) is preserved as specified.
