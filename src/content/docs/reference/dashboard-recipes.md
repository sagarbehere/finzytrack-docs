---
title: Dashboard & Widget Recipes
description: Complete reference for the JSON recipe system that powers Finzytrack dashboards and widgets.
sidebar:
  order: 1
---

:::note
If you have [AI configured](/quick-start/#configuring-ai), you can [build dashboards conversationally](/views/ai-assistant/#analyst-mode-building-dashboards) using the AI assistant — describe what you want to see and it will create the recipe for you. You can also create and edit recipes manually in **Settings > Dashboards**, which provides a JSON editor with live preview. If you prefer to work directly with the recipe format, or want to understand and fine-tune what the assistant generates, read on.
:::

:::tip[Quickest way in: copy from the Widget Gallery]
The bundled **Widget Gallery** dashboard contains a working example of every widget type the app supports (kpi, bar, line, area, pie, scatter, treemap, table, pivot, funnel, gauge, calendar heatmap, sankey, radar, sunburst, budget progress). When building a new recipe, the fastest path is to find the closest gallery widget, copy its JSON, and adapt the SQL and titles. The gallery's source lives at `backend/resources/seed_config/recipes/dashboards/widget-gallery.json` (or open it from the Dashboard panel and use the recipe editor to inspect each widget). Each gallery widget has a `helpText` field describing the type's specific gotchas — those notes are the most reliable distillation of what works for that chart type.
:::

Dashboards in Finzytrack are defined using **JSON recipe files**. Each dashboard defines a grid layout and the widgets it contains **inline** — there are no separate, standalone widget files. 

## Concepts

A **widget** is the fundamental building block — a KPI card, chart, table, pivot table, or budget-progress list. Each widget is a small **pipeline of steps** feeding a visualization. A step is one of:

- **`query`** — a read-only SQL query against your ledger data (the common case). You can freely write any query that makes sense for your widget.
- **`compute`** — a server-side function that returns computed values (for example `budget_for_range`, which supplies budget numbers). There is a fixed catalog of available compute functions.
- **`transform`** — a client-side function that reshapes or combines the outputs of earlier steps (sort, limit, pivot, budget-vs-actual, and so on). There is a fixed catalog of available transforms.

The widget names an `output` step whose result is visualized. Most widgets are simply one `query` step feeding the visualization; multi-source widgets (such as budget vs actual) combine a `query` step and a `compute` step in a `transform`. Widgets can have interactive **parameters** (dropdowns, date and number inputs) that flow into steps.

A **dashboard** arranges its widgets in a grid layout and can define shared parameters that cascade to every widget. It can also define **shared steps** that are computed once and fed to multiple widgets.

:::tip
The most reliable, always-current description of the recipe format is built into the app: when you ask the AI assistant to build a dashboard it loads the schema on demand, and **Settings → Dashboards** validates your JSON with live preview.
:::

### File Structure

Recipe files live in the `config/recipes/dashboards/` directory:

```
config/recipes/
└── dashboards/
    ├── financial-overview.json
    ├── year-summary.json
    ├── month-summary.json
    └── widget-gallery.json       # Reference: one example per widget type
```

Any `*.json` file under `dashboards/` is automatically loaded. There is no index file to keep in sync: drop a file in, refresh the app, and it appears. Move or delete a file and it goes away. Files that fail to parse or validate are reported in the notification panel against their path so you can fix them.

:::note[Format version]
Every dashboard carries `"schemaVersion": 2` — the current step-based format. Recipes written for an earlier Finzytrack version are upgraded on first launch after you confirm a one-time upgrade prompt (a timestamped `.backup` copy of each is kept beside it). A file without `schemaVersion: 2` is rejected with a "run the migration" message.
:::

---

## Dashboard Structure

A dashboard recipe is a JSON file with the following top-level structure:

```json
{
  "schemaVersion": 2,
  "id": "my-dashboard",
  "title": "My Dashboard",
  "description": "Optional description shown in the dashboard picker",
  "parameters": [],
  "steps": [],
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
| `schemaVersion` | number | Recipe format version. Always `2`. |
| `id` | string | Unique identifier. Lowercase letters, numbers, and hyphens only (e.g., `my-dashboard`). |
| `title` | string | Display title shown in the dashboard picker and header. |
| `layout` | object | Grid layout configuration (see [Layout](#layout)). |
| `widgets` | array | Inline widget definitions, non-empty (see [Widget Structure](#widget-structure)). |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | One-line description shown in the dashboard picker. |
| `parameters` | array | Dashboard-level parameters shared by all widgets (see [Parameters](#parameters)). |
| `steps` | array | Dashboard **shared steps** — computed once and fed to multiple widgets (see [Shared steps](#dashboard-shared-steps)). |

### Widgets are inline only

Every widget a dashboard shows is defined **inline** in its `widgets` array. There are no standalone widget files and no by-ID lookup across files: each `layout.widgets[].widgetId` must match the `id` of a widget defined in this dashboard's own `widgets` array. To reuse a widget across dashboards, copy its definition (cheap) — or, to share the *expensive* part of a computation, use a [dashboard shared step](#dashboard-shared-steps).

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

Each widget is defined inline within the dashboard's `widgets` array. A widget is a **pipeline of named steps** (`steps`) plus an `output` pointer naming the step whose result is visualized.

The simplest widget is one query step feeding the visualization. Here a transform step (`firstRow`) reduces the rows to a single one for a KPI:

```json
{
  "id": "total-income",
  "title": "Total Income",
  "description": "Sum of all income for the selected year",
  "helpText": "Income amounts are shown as positive values",
  "parameters": [],
  "steps": [
    {
      "id": "rows",
      "kind": "query",
      "query": "SELECT currency, SUM(CAST(amount AS REAL)) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year GROUP BY currency HAVING amount != 0"
    },
    { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
  ],
  "output": "out",
  "visualization": { "type": "kpi", "icon": "↑", "iconColor": "green" }
}
```

A widget that needs no transformation just points `output` at its query step directly:

```json
{
  "id": "assets-pie",
  "title": "Assets Breakdown",
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT account AS name, ROUND(SUM(CAST(amount AS REAL)), 2) AS value FROM postings WHERE account_type = 'Assets' GROUP BY account HAVING value > 0" }
  ],
  "output": "rows",
  "visualization": { "type": "chart", "chartType": "pie", "options": { /* ... */ } }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier within the dashboard. Lowercase letters, numbers, hyphens. |
| `title` | string | Display title shown in the widget header. |
| `steps` | array | The widget's data pipeline — a non-empty array of step objects (see [Steps](#steps)). |
| `output` | string | The `id` of the step whose result feeds the visualization. Must name a step in `steps`. |
| `visualization` | object | How to display the output (see [Visualizations](#visualizations)). |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Description shown below the title. |
| `helpText` | string | Tooltip text shown when hovering the info icon. |
| `parameters` | array | Widget-level parameters (see [Parameters](#parameters)). |

---

## Steps

A widget's `steps` array is a small **directed graph**: each step produces a value, and later steps consume earlier steps' values by reference. Array order is just for readability — the app runs the steps in dependency order (and independent steps concurrently). There are three kinds:

| `kind` | Runs | Purpose |
|--------|------|---------|
| `query` | server (SQLite mirror) | A leaf data source: a read-only SQL query. |
| `compute` | server | A vetted function that returns computed values (e.g. budget numbers). |
| `transform` | browser | Reshapes or combines the outputs of earlier steps. |

Every step has a unique, lowercase-hyphen `id`. A step's output is referenced elsewhere as **`{{steps.<id>}}`** (or `{{dashboard.steps.<id>}}` for a [shared step](#dashboard-shared-steps)).

### `query` step

```json
{ "id": "actuals", "kind": "query", "query": "SELECT account, SUM(CAST(amount AS REAL)) AS spent FROM postings WHERE year = :year GROUP BY account", "engine": "sqlite" }
```

| Field | Description |
|-------|-------------|
| `query` | The SQL (or BQL) query. Uses `:paramName` placeholders for parameters. |
| `engine` | Optional engine: `"sqlite"` (default) or `"beanquery"`. See [Querying Data](/reference/querying-data/). |

A query step is a **leaf** — it reads the ledger mirror and **cannot read another step's rows** (`{{...}}` references are not allowed inside `query`). To combine a SQL result with anything else, do it in a `transform`. See [SQL queries](#sql-queries) for the rules.

### `compute` step

```json
{ "id": "budgets", "kind": "compute", "fn": "budget_for_range", "args": { "from": "{{params.from}}", "to": "{{params.to}}", "currency": "{{params.currency}}" } }
```

| Field | Description |
|-------|-------------|
| `fn` | Name of a server-side compute function. The catalog is **fixed** — you select from it. |
| `args` | Object of small scalar arguments. Values may be literals or `{{params.x}}` / `{{steps.x}}` templates. |

Compute functions do calculations SQL can't express — budget normalization, projections — and return JSON. The first one is `budget_for_range` (see [Budgets](/views/budgets/)). When the AI assistant is configured it discovers the catalog with its `get_compute_functions` tool; you can't invent new function names.

### `transform` step

```json
{ "id": "variance", "kind": "transform", "fn": "joinBudgetActual", "inputs": ["{{steps.budgets}}", "{{steps.actuals}}"], "config": { "totalAccount": "Expenses:Insurance" } }
```

| Field | Description |
|-------|-------------|
| `fn` | Name of a transform from the [catalog](#transforms) (fixed). |
| `inputs` | Ordered `{{steps.<id>}}` / `{{dashboard.steps.<id>}}` references to the step outputs this transform consumes. |
| `config` | Optional transform-specific configuration; `{{...}}` templates inside it are resolved. |

Transforms run in the browser over already-computed step outputs. Unlike query steps, a transform can take **multiple inputs** — that's how a widget combines a SQL result with a compute result (for example budget vs actual). Like compute functions, the transform names are a **fixed catalog** — you select from it and can't invent new ones (see the [full catalog](#transforms) below).

### References & interpolation

Three reference scopes are available in `args`, `inputs`, and `config` via `{{...}}`:

- `{{params.<name>}}` — a resolved parameter value.
- `{{steps.<id>}}` — the output of another step in this widget.
- `{{dashboard.steps.<id>}}` — the output of a [dashboard shared step](#dashboard-shared-steps).

A string that is *exactly* one token (`"{{steps.actuals}}"`) resolves to the actual value (object/array). A token inside a larger string resolves to its text. query steps are the exception — their `query` uses only `:name` parameter placeholders and never `{{...}}`.

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
  "optionsFrom": "years"
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
| `optionsFrom` | string | For `select` type: dynamic option source, populated from the user's ledger. `"currencies"` (ledger currencies), `"years"` (years present in the data), `"accounts"` (all accounts), `"expenseAccounts"` / `"incomeAccounts"` (only that type), `"budgetTotals"` (accounts that carry a budget **and** have a budgeted descendant — valid top-down "total" accounts for a zero-based view, including quoted roots like `Expenses`). For the account sources, each option's value is the full account path and its label is the path below the type root (e.g. `Expenses:Insurance:Health` → `Insurance:Health`). |
| `min` | number | For `number` type: minimum value. |
| `max` | number | For `number` type: maximum value. |
| `hidden` | boolean | When `true`, the parameter is functional (its `default` applies, it can be set by a [select action](#select-action-master-detail) or the URL, and steps read it) but renders **no control** in the parameter bar. Use for a parameter driven only by click-to-select. |
| `showWhen` | object | Conditional visibility: `{ "param": "<name>", "equals": <value> }` — the control shows only while another parameter's current value equals `equals`. The parameter stays functional when hidden this way (its default/last value still feeds steps). Use to reveal a control based on a toggle (e.g. a date shown only when a checkbox is on). |
| `minParam` / `maxParam` | string | For a `date` (or `number`) control: bind the input's minimum/maximum to another parameter's current value. Reactive — e.g. a "from" date with `"maxParam": "asOf"` can't be set past the "as of" date. |

### Parameter Types

**Select** — dropdown menu:
```json
{
  "name": "year",
  "label": "Year",
  "type": "select",
  "default": { "$gen": "currentYear" },
  "optionsFrom": "years"
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

**Boolean** — checkbox. The value is the string `"true"` or `"false"`; default `"false"`. Read it in a transform's `config` (`"{{params.flag}}"`) or pair it with a `showWhen` on another control:
```json
{
  "name": "startFresh",
  "label": "Start fresh",
  "type": "boolean",
  "default": "false"
}
```

### Dashboard vs Widget Parameters

- **Dashboard-level parameters** are defined in the dashboard's `parameters` array and cascade to all widgets. They appear in the dashboard header.
- **Widget-level parameters** are defined in each widget's `parameters` array. They appear in the widget header.
- If a widget defines a parameter with the same `name` as a dashboard parameter, the dashboard value takes precedence.
- Parameters that the dashboard already provides are hidden from the widget header (no duplicate controls).

### Persistence and Templated Defaults

Parameter selections — both dashboard-level and widget-level — are saved to the browser's local storage so they survive across app launches. Dashboard-level selections are also reflected in the URL, which makes a particular view bookmarkable and shareable.

When a parameter's `default` is a no-argument generator reference (for example `{ "$gen": "currentMonth" }` or `{ "$gen": "defaultCurrency" }`), the dropdown surfaces that generator as a sticky, **templated option** at the top of the list, rendered in italics. The label combines the generator's display name and the value it currently resolves to — for example "Current Month (May)" or "Default Currency (USD)".

Picking the templated option means "always evaluate this generator on load." On the next dashboard load it produces the value that is current *then* — March in March, April in April. Picking a specific literal value (for example the month "May") pins that value until the user changes it. To go back to the templated behavior after pinning, the user re-selects the italicized templated option.

This lets the same parameter satisfy two different intents — the dashboard author declares a sensible default behavior, and the user can override it (sticky) or stay with it (templated). It also means recipe authors don't need to choose between "this should always reflect the current month" and "the user's pick should stick" — both are reachable from a single `{ "$gen": "currentMonth" }` default.

Generators that take config arguments (for example `{ "$gen": "startOfMonth", "offset": -1 }`) are resolved at load time and are not exposed as templated options — only no-argument generator defaults are templatable.

### Using Parameters in Queries

Reference parameters in SQL using `:paramName`:

```sql
SELECT account, SUM(CAST(amount AS REAL)) AS total
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
| `monthOptions` | `format` (`"long"` or `"short"`, default `"long"`) | All 12 months. `{ "$gen": "monthOptions" }` |
| `quarterOptions` | — | Q1 through Q4. `{ "$gen": "quarterOptions" }` |
| `accountTypeOptions` | — | Assets, Liabilities, Income, Expenses, Equity. |
| `datePresets` | — | Predefined date range labels: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Quarter, This Year, Last Year. |

---

## SQL queries

A `query` step's `query` field fetches data from your ledger. By default queries use SQL against a SQLite export of your Beancount ledger; you can also use BQL (Beancount Query Language) by setting `engine: "beanquery"` on the step.

For the complete query reference — table schema, sign conventions, multi-currency rules, SQL syntax, BQL syntax, and common query patterns — see the **[Querying Data](/reference/querying-data/)** reference.

Here's a quick summary of what you need to know for writing recipe queries:

- Queries run against the `postings` table (SQL) or Beancount entries directly (BQL).
- Use `:paramName` placeholders for parameter values in SQL queries (e.g., `:year`, `:currency`).
- Always `GROUP BY currency` or filter `WHERE currency = :currency` when summing amounts — never sum across currencies.
- Use `HAVING amount != 0` or `HAVING value > 0` to exclude zero-value rows.
- Income amounts are negative (credit) — use `SUM(CAST(amount AS REAL)) * -1` to display as positive.
- Expense amounts are positive (debit) — use `SUM(CAST(amount AS REAL))` directly.
- For treemap and pie charts, the query must return `name` and `value` columns, and must include `HAVING value > 0` to exclude negative/zero values (which these chart types cannot display).

:::tip[Computed columns for click-through links]
You can include computed date columns in your query that aren't displayed but are used by [click-through links](#click-through-links):
```sql
SELECT account, SUM(CAST(amount AS REAL)) AS total,
  :year || '-' || printf('%02d', :month) || '-01' AS dateFrom,
  date(:year || '-' || printf('%02d', :month) || '-01', '+1 month', '-1 day') AS dateTo
FROM postings
WHERE ...
```
These columns can then be referenced in `clickLink` templates as `{{data.dateFrom}}` and `{{data.dateTo}}`.
:::

---

## Transforms

A `transform` step calls one named function from a **fixed catalog** over the outputs of the steps named in its `inputs`. The first input is the primary rowset; `config` shapes behavior. The simplest is `none` (pass rows through); reducers like `firstRow` adapt rows for a KPI; and multi-input transforms (the budget family) merge two step outputs.

```json
{ "id": "out", "kind": "transform", "fn": "sortBy", "inputs": ["{{steps.rows}}"], "config": { "field": "total", "order": "desc" } }
```

### Catalog

| `fn` | `inputs` | `config` | Output |
|------|----------|----------|--------|
| `none` | `[rows]` | — | the rows unchanged |
| `firstRow` | `[rows]` | — | the first row as a single object (single-value KPIs) |
| `firstValue` | `[rows]` | — | the first value of the first row |
| `sortBy` | `[rows]` | `{ field, order? }` | sorted rows (`order`: `asc`/`desc`) |
| `limit` | `[rows]` | `{ count }` | the first `count` rows |
| `pluck` | `[rows]` | `{ field }` | an array of one field's values |
| `where` | `[rows]` | `{ field, equals? \| notEquals? \| in? }` | the rows matching the predicate (chain `firstRow`/`limit` to reduce to one) |
| `appendTotal` | `[rows]` | `{ field?, labelField?, label?, count? }` | the rows (first `count`, if given) plus a grand-total row summing `field` over **all** input rows (`isTotal: true`), so a top-N table still totals the full set |
| `groupBy` | `[rows]` | `{ key, sum }` | one row per distinct `key` (a field name or array of names), each field in `sum` totalled exactly; first-seen order. E.g. roll per-account-per-period budgets up to a per-period total |
| `pivot` | `[rows]` | `{ rowField, columnField, valueField, formatColumn?, sortRowsBy? }` | a cross-tabulation (see below) |
| `joinBudgetActual` | `[budgets, actuals]` | `{ totalAccount?, periodStart?, periodEnd? }` | budget-vs-actual variance rows |
| `joinByPeriod` | `[budgetsByPeriod, actualsByPeriod]` | — | `[{ period, budget, actual }]` |
| `joinBudgetActualByPeriod` | `[budgetsByPeriod, actualsByPeriod]` | — | one row per budgeted `{ account, currency, period, budget, actual, remaining, pctUsed }` — budget-vs-actual keyed on the composite **(account, period)**, inclusive-parent. Feed `pctUsed` into a `pivot` with `colorByValue` for an account×month adherence heat-map |
| `budgetSummary` | `[budgets, actuals]` | — | one aggregate row `{ budget, actual, remaining, pctUsed, pctUsedPct }` for a ring/KPIs (maximal-named-subtree, so nested budgets aren't double-counted) |
| `unbudgetedSpending` | `[budgets, actuals]` | — | actual rows for accounts **not** covered by any budget, sorted by spend desc (inclusive-parent aware) |
| `runningSum` | `[rows]` | `{ fields, orderBy }` | rows plus a cumulative column per field |
| `budgetTree` | `[budgets]` | `{ totalAccount }` | hierarchical zero-based allocation for a **sunburst**: recursively decomposes each budgeted node into its maximal budgeted children + a synthetic `"<node>:Unbudgeted"` remainder leaf (budget − Σ children), emitting flat `{ account, value }` rows the sunburst's path-tree reassembles. Needs the total node in `budgets` (fetch it with `budget_for_range` `includeRoots: true`) |
| `envelopeRollover` | `[budgetsByPeriod, actualsByPeriod]` | `{ reset?, resetFrom? }` | per-period `{ period, currency, budget, actual, available, carryover, overspent, dateFrom, dateTo }`. Accumulates from the envelope's **inception** (the first month with a real budget) — leading budget-less months are skipped, and spend before inception isn't counted. Pass `reset` (truthy) + `resetFrom` (a date) to **start fresh** from that month instead (clamped to ≥ inception). `dateFrom`/`dateTo` are the period's month bounds (for a per-point chart click-through) |
| `envelopeBalances` | `[budgetsByPeriod, actualsByPeriod]` | `{ reset?, resetFrom? }` | one row per budgeted `{ account, currency, budget, actual, remaining, pctUsed, direction }` — each envelope's **inception-aware running balance** (`remaining` = what's in the envelope now, equal to `envelopeRollover`'s final carryover). For a multi-envelope overview list; inclusive-parent, each envelope counted from its own inception (or from `resetFrom` when `reset` is set) |

### `pivot`

Required by the `pivot` visualization. Restructures flat rows (one per account+month) into a cross-tabulation:

| Property | Description |
|----------|-------------|
| `rowField` | Column to use as row labels (default: `"account"`). |
| `columnField` | Column whose values become column headers (default: `"year_month"`). |
| `valueField` | Column containing the numeric values (default: `"amount"`). |
| `formatColumn` | Header format: `"monthYear"` ("Jan 2026") or `"yearMonth"` ("2026-01"). |
| `sortRowsBy` | `"total_desc"` (default), `"total_asc"`, `"label_asc"`, `"label_desc"`. |

When `columnField` holds `YYYY-MM` values, the pivot generates per-column metadata (`columnMeta.rawValue`, `columnMeta.startDate`, `columnMeta.endDate`) available in pivot click-through templates (see [Click-Through Links](#click-through-links)).

### Budget transforms

`joinBudgetActual`, `joinByPeriod`, `runningSum`, and `envelopeRollover` pair a `query` step (actuals) with a `compute` step (`budget_for_range`) to build budget dashboards. `joinBudgetActual` in **remainder mode** (set `config.totalAccount`) adds synthetic "Unbudgeted" and "Total" rows for catch-all/zero-based budgeting. To feed one of those roll-up rows to a single-value widget, slice it out with `where` — e.g. `where { field: "kind", equals: "total" }` yields the grand-total row for a KPI (see the Budget: Overview dashboard under [Dashboard shared steps](#dashboard-shared-steps)). See the [Budgets guide](/views/budgets/) for the styles and the seeded demo dashboards that use each.

---

## Compute steps

A `compute` step calls a vetted server-side function that returns values SQL can't compute directly. The catalog is fixed and currently centers on budgeting:

- **`budget_for_range`** — resolves budgets from `custom "budget"` directives over a date range (or per calendar month with `groupBy: "period"`). Returns `[{ account, currency, budget }]`. Pair it with a `query` actuals step and a budget transform. `from` is optional: **omit it to start each account at its own inception** (its first budget directive) — the natural "from the beginning" for envelope balances, with no empty pre-inception months. **Bare-root total budgets** (a quoted account with no `:`, e.g. `"Expenses"`) are **excluded by default** — they're top-down totals, not per-account budgets — so they never double-count or appear as an inclusive peer in bottom-up views; pass `includeRoots: true` (the zero-based/sunburst view does) to include them.

```json
{ "id": "budgets", "kind": "compute", "fn": "budget_for_range",
  "args": { "from": "2026-01-01", "to": "2026-12-31", "currency": "USD" } }
```

`args` are small scalars (dates, a currency, an account). Bulk data is read by the function on the server — don't pass large rowsets into `args`. When the AI assistant is configured it lists the available functions with `get_compute_functions`.

---

## Dashboard shared steps

A dashboard may declare a top-level `steps` array (the same step kinds, but no `output`). These run **once per dashboard render** and their outputs are available to every widget via `{{dashboard.steps.<id>}}`. Use them to compute an expensive value once and feed several widgets — instead of every widget repeating the same query, resolve, and join.

The seeded **Budget: Overview** dashboard is the worked example: it resolves budgets, queries actuals, and joins them into a variance table **once** at the dashboard level, then six widgets (three KPIs, a breakdown table, a chart, and a reconciliation) each render a slice of that single result.

```json
{
  "schemaVersion": 2,
  "id": "budget-overview",
  "title": "Budget: Overview",
  "parameters": [ /* monthStart, monthEnd, currency */ ],

  "steps": [
    { "id": "actuals", "kind": "query",
      "query": "SELECT account, currency, SUM(CAST(amount AS REAL)) AS actual FROM postings WHERE account_type = 'Expenses' AND transaction_date BETWEEN :monthStart AND :monthEnd AND currency = :currency GROUP BY account, currency" },
    { "id": "budgets", "kind": "compute", "fn": "budget_for_range",
      "args": { "from": "{{params.monthStart}}", "to": "{{params.monthEnd}}", "currency": "{{params.currency}}" } },
    { "id": "totals", "kind": "transform", "fn": "joinBudgetActual",
      "inputs": ["{{steps.budgets}}", "{{steps.actuals}}"], "config": { "totalAccount": "Expenses" } }
  ],

  "layout": { "columns": 12, "widgets": [ /* … */ ] },
  "widgets": [
    {
      "id": "kpi-spent",
      "title": "Spent This Month",
      "steps": [
        { "id": "row", "kind": "transform", "fn": "where",
          "inputs": ["{{dashboard.steps.totals}}"], "config": { "field": "kind", "equals": "total" } }
      ],
      "output": "row",
      "visualization": { "type": "kpi", "multiCurrency": true, "amountField": "actual", "currencyField": "currency" }
    }
    /* … more widgets, each a thin transform over {{dashboard.steps.totals}} … */
  ]
}
```

Two things to note in the shared steps themselves:

- **Sibling shared steps reference each other with `{{steps.<id>}}`** (as in the `totals` transform above), exactly like widget steps. It's only *widgets* that reach the shared outputs via `{{dashboard.steps.<id>}}`.
- A shared step can be any kind — `query`, `compute`, or `transform`. The expensive one here is `budget_for_range` (the compute), which now runs once instead of once per widget.

Shared steps are parameterized by **dashboard** parameters only. If a widget locally overrides a parameter a shared step depends on, it still sees the shared output computed with the *dashboard* value — the shared step does not re-run per widget. When a widget needs its own parameterization of a computation, give it its own widget step instead.

---

## Colors

Anywhere a color is accepted — a series `itemStyle.color`, a KPI `iconColor`, budget-progress
`colors`, a chart's top-level `options.color` array — you can use a **`{{theme.*}}` token** instead
of a raw hex value. Tokens draw from the active **dashboard theme**, so colors stay consistent across
every dashboard and can be recolored from one file. Prefer tokens; a raw hex/CSS color still works as
a per-value override.

| Token | Use for |
|---|---|
| `{{theme.brand}}` | The accent/focus color — a single-series chart, a primary/magnitude KPI icon |
| `{{theme.baseline}}` | The muted "target/budget" a value is measured against |
| `{{theme.valence.good \| warn \| bad \| complete}}` | Favorability: under / approaching / over / exactly-on-budget. The only place green/amber/red should appear |
| `{{theme.series.<name>}}` | A named recurring series: `budget`, `actual`, `income`, `expense`, `savings` |
| `{{theme.categorical}}` / `{{theme.categorical.N}}` | Category identity (pie/treemap) — auto-assigned, or a specific 0-based slot |

Conventions the runtime applies for you:

- **Pie and treemap charts** get the theme's categorical palette automatically — don't set colors on
  them unless you want to override. Treemaps and sunbursts also color by **account family** (hue) and
  **depth** (lightness), so a category's tiles read as a group.
- **Budget-progress bars and the pivot heat-map** are colored by favorability from the theme — no
  color config needed.
- **KPI icons**: use `{{theme.brand}}` for a magnitude (Spent, Total, Assets); set `colorBySign: true`
  for a signed value (Remaining, Net change) so it goes green/red by its sign.

The token set above is fixed — don't invent new tokens. For the full theme file and how to edit it,
see the [Dashboard Colors & Themes](/reference/dashboard-themes/) reference.

---

## Visualizations

The `visualization` object in each widget determines how query results are displayed.

### KPI — Single Metric Display

Displays a single value prominently, with an optional icon and color.

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"kpi"`. |
| `icon` | string | Single character or emoji displayed in a colored circle (e.g., `"$"`, `"↑"`, `"↓"`, `"#"`). |
| `iconColor` | string | Icon background color. Prefer a theme token — `"{{theme.brand}}"` for a magnitude, `"{{theme.series.income}}"` to match a series (see [Colors](#colors)). A hex/CSS color or a legacy name (`"blue"`/`"green"`/`"red"`/`"purple"`/`"amber"`) also works. For a signed figure use `colorBySign` instead. |
| `format` | string | Value format (see [Formats](#formats)). |
| `valueField` | string | Column name to display as the KPI value (default: `"value"`). |
| `multiCurrency` | boolean | If `true`, displays one amount per currency, stacked vertically. The query must return one row per currency with `currency` and `amount` columns (or the columns specified by `currencyField` and `amountField`). |
| `amountField` | string | Column name for amounts when `multiCurrency` is true (default: `"amount"`). |
| `currencyField` | string | Column name for currencies when `multiCurrency` is true (default: `"currency"`). |
| `colorBySign` | boolean | Colour **both the value text and the icon** by sign, from the theme's favorability colors — **good** when > 0, **on-the-mark** when exactly 0, **bad** when negative — **overriding `iconColor`** while it's on. Use for figures where negative is bad, e.g. a Remaining / over-budget KPI. (A single number has no "approaching" state, so there's no amber tier here — unlike the [budget-progress](#budget-progress) bars.) |
| `showTrend` | boolean | Show a trend indicator below the value (e.g., "+5.2% vs prior"). Requires `trendField`. |
| `trendField` | string | Column name containing the trend percentage. Positive values show as green (up), negative as red (down). |
| `clickLink` | object | Makes the KPI value clickable, navigating to a filtered view. See [Click-Through Links](#click-through-links). |

#### Single-value KPI

The query step returns one row with a numeric column. A `firstRow` transform reduces it to a single object, and `valueField` extracts the value.

```json
{
  "id": "transaction-count",
  "title": "Transaction Count",
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT COUNT(DISTINCT transaction_id) AS value FROM postings WHERE year = :year" },
    { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
  ],
  "output": "out",
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
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT currency, SUM(CAST(amount AS REAL)) * -1 AS amount FROM postings WHERE account_type = 'Income' AND year = :year GROUP BY currency HAVING amount != 0" }
  ],
  "output": "rows",
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
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT currency AS cur, SUM(CAST(amount AS REAL)) AS total FROM postings WHERE account_type = 'Assets' GROUP BY currency HAVING total != 0" }
  ],
  "output": "rows",
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
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT SUM(CAST(amount AS REAL)) AS value, ROUND((SUM(CAST(amount AS REAL)) - prev.total) * 100.0 / prev.total, 1) AS trend FROM postings, (SELECT SUM(CAST(amount AS REAL)) AS total FROM postings WHERE account_type = 'Expenses' AND year_month = strftime('%Y-%m', date('now', '-1 month'))) prev WHERE account_type = 'Expenses' AND year_month = strftime('%Y-%m', 'now')" },
    { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
  ],
  "output": "out",
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
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT currency, SUM(CAST(amount AS REAL)) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year GROUP BY currency HAVING amount != 0" }
  ],
  "output": "rows",
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

:::tip[Position the legend, or it overlaps the axis]
When a chart has **more than one series**, show a legend — but **pin it** and make room for it. An unpositioned `legend` defaults to the bottom-center, where it sits on top of the x-axis labels. Set `legend: { "top": 0 }` (top-anchored) and give the grid headroom with `grid: { "top": 40 }`, as the multi-series example above does. Single-series charts should set `legend: { "show": false }` (a one-item legend just adds clutter).
:::

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

#### Funnel

Ranked stages, larger at top, narrowing down. Useful for budget allocation and savings funnels.

```json
{
  "type": "chart",
  "chartType": "funnel",
  "options": {
    "tooltip": { "trigger": "item" },
    "legend": { "show": false },
    "series": [
      {
        "type": "funnel",
        "sort": "descending",
        "label": { "show": true, "position": "inside", "formatter": "{b}" }
      }
    ]
  }
}
```

- Query must return `name` and `value` columns.
- Like treemap, the runtime injects rows directly into `series[0].data` — do **not** use `encode`.
- Use `HAVING value > 0` (negative stages don't make sense).

#### Gauge

A dial showing a single value against a min/max range. Useful for budget progress, savings rate, etc.

```json
{
  "type": "chart",
  "chartType": "gauge",
  "options": {
    "tooltip": { "trigger": "item" },
    "series": [
      {
        "type": "gauge",
        "min": 0,
        "max": 100,
        "detail": { "formatter": "{value}%", "fontSize": 22 }
      }
    ]
  }
}
```

- Query should return one row with a numeric `value` column. The runtime uses the first row.
- Set `min` and `max` on the series to define the dial range.

#### Calendar Heatmap

GitHub-contributions style — one cell per day across a date range.

```json
{
  "type": "chart",
  "chartType": "calendar",
  "options": {
    "tooltip": { "trigger": "item" },
    "legend": { "show": false },
    "visualMap": { "min": 0, "max": 5000, "orient": "horizontal", "left": "center", "top": 0 },
    "calendar": { "top": 60, "cellSize": ["auto", 14] },
    "series": [
      { "type": "heatmap", "coordinateSystem": "calendar" }
    ]
  }
}
```

- Query must return `date` (YYYY-MM-DD) and `value` columns.
- The `calendar.range` is auto-derived from the data's min/max date when not specified.
- The runtime auto-injects a tooltip formatter that shows the date plus the formatted value.
- Always set `legend: { show: false }` — the global legend swatch clashes with the visualMap colour ramp.

See the gallery's `gallery-calendar` widget (in `widget-gallery.json`) for a complete worked example with a clickLink filtering by date.

#### Sankey

Flow diagram between source and target categories with link width proportional to value. Great for showing how money flows from income sources through to expenses.

```json
{
  "type": "chart",
  "chartType": "sankey",
  "options": {
    "tooltip": { "trigger": "item", "triggerOn": "mousemove" },
    "series": [
      {
        "type": "sankey",
        "lineStyle": { "color": "gradient", "curveness": 0.5, "opacity": 0.5 },
        "label": { "fontSize": 10 },
        "emphasis": { "focus": "adjacency" }
      }
    ]
  }
}
```

- Query must return `source`, `target`, and `value` columns. The runtime derives unique nodes and uses rows as links.
- For click-through routing, also emit `sourceAccount` and `targetAccount` columns carrying the *real* account paths (NULL for synthetic intermediates like a "Total Income" node). The runtime attaches a `realAccount` field to both nodes (rectangles) and links (flows), so a `clickLink` template using `{{data.realAccount}}` resolves correctly regardless of which side the user clicks. See the gallery `gallery-sankey` widget for the canonical SQL pattern.

#### Radar

Multi-dimensional comparison on a single shape. Useful for spending profiles across categories.

```json
{
  "type": "chart",
  "chartType": "radar",
  "options": {
    "tooltip": { "trigger": "item" },
    "legend": { "show": false },
    "series": [
      { "type": "radar", "areaStyle": { "opacity": 0.4 }, "lineStyle": { "width": 2 } }
    ]
  }
}
```

- Query returns one row per dimension with `category` and `value` columns.
- The runtime auto-builds the top-level `radar.indicator` from the categories, scaled to 1.2× the maximum observed value (override via `series.indicatorMaxRatio`).
- A recipe-supplied `radar:` config (e.g. for axis styling) is merged with the auto-derived indicator — recipe wins for everything except the indicator field.
- No `clickLink` — ECharts radar emits clicks at the subject level rather than per-axis.

#### Sunburst

Hierarchical breakdown rendered as concentric rings. The complement to treemap for nested category hierarchies.

```json
{
  "type": "chart",
  "chartType": "sunburst",
  "options": {
    "tooltip": { "trigger": "item" },
    "series": [
      {
        "type": "sunburst",
        "radius": [0, "90%"],
        "label": { "rotate": "tangential", "minAngle": 6, "fontSize": 10 }
      }
    ]
  }
}
```

- Query returns `account` (a colon-separated path like `"Expenses:Food:Restaurants"`) and `value`. The runtime splits the paths and builds the nested tree automatically.
- Outer rings represent deeper levels in the account hierarchy.
- No `clickLink` — ECharts sunburst uses clicks for built-in zoom/drill-down. Adding a click-link would conflict with that interaction.

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
| `colorByValue` | boolean | Tint each cell by its value read as a budget-usage fraction (e.g. `pctUsed`) — a **budget-adherence heat-map**. Uses the same green/amber/blue/red scale as [budget-progress](#budget-progress). Point `valueField` at a `pctUsed`-style column and turn totals off. |
| `warnAt` | number | With `colorByValue`: fraction where a cell turns amber. Default `0.85`. |
| `colors` | object | With `colorByValue`: override the status colours (`{ under, approaching, exact, over }` hex), same as budget-progress. |
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
  "steps": [
    { "id": "rows", "kind": "query", "query": "SELECT account, year_month, SUM(CAST(amount AS REAL)) AS amount FROM postings WHERE account_type = 'Expenses' AND year = :year AND currency = :currency GROUP BY account, year_month ORDER BY account, year_month" },
    { "id": "pivoted", "kind": "transform", "fn": "pivot", "inputs": ["{{steps.rows}}"],
      "config": { "rowField": "account", "columnField": "year_month", "valueField": "amount", "formatColumn": "monthYear", "sortRowsBy": "total_desc" } }
  ],
  "output": "pivoted",
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

### Budget Progress

A purpose-built budget-vs-actual list — **not an ECharts chart**, but a dedicated widget type. It shows one row per budgeted account, each with a fill bar (spent vs budget, over-budget in red) and `$spent / $budget` with the amount remaining. It reads the flat rows a [`joinBudgetActual`](#budget-transforms) transform produces, so a typical widget is a `query` (actuals) + `compute` (`budget_for_range`) + `joinBudgetActual` feeding this visualization.

```json
{
  "type": "budget-progress",
  "accountFormat": "accountName2",
  "emptyText": "No budgets for this period.",
  "link": {
    "name": "transactions",
    "query": { "accountContains": "{{row.account}}", "dateFrom": "{{parameters.monthStart}}", "dateTo": "{{parameters.monthEnd}}" }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | **Required.** Must be `"budget-progress"`. |
| `accountField` | string | Row field for the category label (default: `"account"`). |
| `budgetField` | string | Row field for the budget amount (default: `"budget"`). |
| `actualField` | string | Row field for the actual spend (default: `"actual"`). |
| `remainingField` | string | Row field for `budget − actual` (default: `"remaining"`). |
| `pctUsedField` | string | Row field for the fraction of budget used, e.g. `1.23` = 123% (default: `"pctUsed"`). |
| `currencyField` | string | Row field for the currency code (default: `"currency"`). |
| `directionField` | string | Row field holding `"under-good"` or `"over-good"` (expenses vs income). Default `"direction"`; absent → under-good. |
| `accountFormat` | string | Optional [format](#formats) for the account label (e.g. `"accountName2"`). |
| `warnAt` | number | Fraction of budget where a bar turns amber ("approaching"). Default `0.85` (85%). |
| `colors` | object | Override the status bar colours — `{ under, approaching, exact, over }`, each any CSS/hex colour (applied in both light and dark mode). Omitted statuses keep the default palette. |
| `link` | object | Optional per-row click-through (see [Click-Through Links](#click-through-links)); templates can use `{{row.<field>}}` and `{{parameters.<name>}}`. |
| `emptyText` | string | Message shown when there are no rows. |

Bar colours are a status scale — **green** (under `warnAt`), **amber** (approaching), **blue** (exactly on budget, e.g. a fixed expense paid in full at 100%), **red** (over budget, strictly `> 100%`). Each maps to a `colors` key, and you can set any subset (omitted keys keep their default):

```jsonc
"colors": {
  "under":       "#10b981",  // under budget (default green)
  "approaching": "#f59e0b",  // approaching the limit — ≥ warnAt (default amber)
  "exact":       "#3b82f6",  // exactly on budget — 100% (default blue)
  "over":        "#ef4444"   // over budget — > 100% (default red)
}
```

The defaults match the `joinBudgetActual` flat output (`account`, `budget`, `actual`, `remaining`, `pctUsed`, `direction`, `currency`), so a widget usually needs only `accountFormat`, `emptyText`, and an optional `link`. Bar colours are a traffic light on how much of the budget is used — green (comfortable, under 85%), amber (approaching, 85–100%), red (over) — flipped for income (`over-good`), where reaching the target is good.

A complete widget:

```json
{
  "id": "budget-progress",
  "title": "Budget vs Actual",
  "steps": [
    { "id": "actuals", "kind": "query", "query": "SELECT account, currency, SUM(CAST(amount AS REAL)) AS actual FROM postings WHERE account_type = 'Expenses' AND transaction_date BETWEEN :monthStart AND :monthEnd AND currency = :currency GROUP BY account, currency" },
    { "id": "budgets", "kind": "compute", "fn": "budget_for_range", "args": { "from": "{{params.monthStart}}", "to": "{{params.monthEnd}}", "currency": "{{params.currency}}" } },
    { "id": "variance", "kind": "transform", "fn": "joinBudgetActual", "inputs": ["{{steps.budgets}}", "{{steps.actuals}}"] }
  ],
  "output": "variance",
  "visualization": {
    "type": "budget-progress",
    "accountFormat": "accountName2",
    "link": { "name": "transactions", "query": { "accountContains": "{{row.account}}", "dateFrom": "{{parameters.monthStart}}", "dateTo": "{{parameters.monthEnd}}" } }
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

Widgets can be made interactive by adding a click action. A click action is one of two modes:

- **Navigate** (`{name, query}`) — clicking a value goes to the Transactions view with filters pre-applied.
- **Select** (`{select}`) — clicking sets dashboard parameters from the clicked context, driving other widgets on the same dashboard (master-detail drill-down). See [Select Action](#select-action-master-detail).

Every click-action field — a chart `clickLink`/`seriesClickLinks`, a KPI `clickLink`, a pivot `valueLink`, a table column `link`, and a budget-progress `link` — accepts either mode.

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

Provide **either** `{name, query}` (navigate) **or** `select` (below) — not both.

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

### Select Action (master-detail)

Instead of navigating away, a click can **set dashboard parameters** from the clicked row/value/series, re-running the widgets that depend on those parameters. This builds a master-detail dashboard: a list or chart on top acts as a picker for a detail view below.

```json
"link": { "select": { "account": "{{row.account}}" } }
```

| Property | Type | Description |
|----------|------|-------------|
| `select` | object | Map of dashboard-parameter name → template. On click, each parameter is set to its interpolated value. |

- Templates use the **same click variables** as a navigate link for that widget type (e.g. `{{row.<field>}}` for a table column or budget-progress row, `{{data.<field>}}` for a chart series).
- Only keys that are **actual dashboard parameters** are applied — a select can't invent unknown parameters.
- Setting a parameter re-runs the dashboard shared steps and every widget that reads that parameter — exactly as if the user had changed it in the dropdown. The parameter is persisted and reflected in the URL like any other selection.
- For a `budget-progress` list, the row whose selection matches the current parameter values is highlighted as the active (drilled-in) row.

**Example — click an account to drive an account-scoped drill-down.** A `budget-progress` overview whose rows each set the `account` parameter; a chart below reads `:account` and shows just that account's trend:

```json
{
  "id": "overview",
  "output": "ranked",
  "visualization": {
    "type": "budget-progress",
    "accountFormat": "accountName2",
    "link": { "select": { "account": "{{row.account}}" } }
  }
}
```

The seeded **Budget: Envelopes** dashboard (`config/recipes/dashboards/budget-envelopes.json`) is a complete worked example: its envelope-balances list selects the `account` parameter, and the KPIs + trend chart below drill into the chosen envelope.

---

## Complete Examples

The bundled dashboards under `config/recipes/dashboards/` are the living, validated reference — open any of them in **Settings → Dashboards** to see a full recipe in the current format. The examples below show the shapes you'll use most.

### Example: a simple multi-widget dashboard

Three KPI cards over one chart. Each widget is a single `query` step; the KPIs reduce to one row with a `firstRow` transform, the chart points `output` straight at its query step.

```json
{
  "schemaVersion": 2,
  "id": "overview",
  "title": "Overview",
  "parameters": [
    { "name": "currency", "label": "Currency", "type": "select",
      "default": { "$gen": "defaultCurrency" }, "optionsFrom": "currencies" }
  ],
  "layout": {
    "columns": 12, "gap": "1.5rem", "rowHeight": "140px",
    "widgets": [
      { "widgetId": "net-worth", "gridArea": "1 / 1 / 2 / 5" },
      { "widgetId": "assets", "gridArea": "1 / 5 / 2 / 9" },
      { "widgetId": "liabilities", "gridArea": "1 / 9 / 2 / 13" },
      { "widgetId": "assets-pie", "gridArea": "2 / 1 / 5 / 13" }
    ]
  },
  "widgets": [
    {
      "id": "net-worth", "title": "Net Worth",
      "steps": [
        { "id": "rows", "kind": "query", "query": "SELECT currency, SUM(CASE WHEN account_type IN ('Assets','Liabilities') THEN CAST(amount AS REAL) ELSE 0 END) AS amount FROM postings WHERE currency = :currency GROUP BY currency HAVING amount != 0" },
        { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
      ],
      "output": "out",
      "visualization": { "type": "kpi", "icon": "$", "multiCurrency": true }
    },
    {
      "id": "assets", "title": "Total Assets",
      "steps": [
        { "id": "rows", "kind": "query", "query": "SELECT currency, SUM(CAST(amount AS REAL)) AS amount FROM postings WHERE account_type = 'Assets' AND currency = :currency GROUP BY currency HAVING amount != 0" },
        { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
      ],
      "output": "out",
      "visualization": { "type": "kpi", "icon": "↑", "iconColor": "green", "multiCurrency": true }
    },
    {
      "id": "liabilities", "title": "Total Liabilities",
      "steps": [
        { "id": "rows", "kind": "query", "query": "SELECT currency, SUM(CAST(amount AS REAL)) * -1 AS amount FROM postings WHERE account_type = 'Liabilities' AND currency = :currency GROUP BY currency HAVING amount != 0" },
        { "id": "out", "kind": "transform", "fn": "firstRow", "inputs": ["{{steps.rows}}"] }
      ],
      "output": "out",
      "visualization": { "type": "kpi", "icon": "↓", "iconColor": "red", "multiCurrency": true }
    },
    {
      "id": "assets-pie", "title": "Assets Breakdown",
      "steps": [
        { "id": "rows", "kind": "query", "query": "SELECT REPLACE(account, 'Assets:', '') AS name, account, ROUND(SUM(CAST(amount AS REAL)), 2) AS value FROM postings WHERE account_type = 'Assets' AND currency = :currency GROUP BY account HAVING value > 0 ORDER BY value DESC" }
      ],
      "output": "rows",
      "visualization": {
        "type": "chart", "chartType": "pie",
        "options": { "series": [{ "type": "pie", "radius": ["35%", "65%"], "encode": { "itemName": "name", "value": "value" } }] }
      }
    }
  ]
}
```

### Example: budget vs actual (sql + compute + transform)

This is the canonical multi-source widget: a `query` step for actuals, a `compute` step for budgets, and a `transform` that merges them into a variance table. The `joinBudgetActual` transform rolls actuals up to each budgeted account inclusively and emits `budget`, `actual`, `remaining`, and `pctUsed`.

```json
{
  "schemaVersion": 2,
  "id": "budget-vs-actual",
  "title": "Budget vs Actual",
  "parameters": [
    { "name": "monthStart", "label": "From", "type": "date", "default": { "$gen": "startOfMonth" } },
    { "name": "monthEnd", "label": "To", "type": "date", "default": { "$gen": "endOfMonth" } },
    { "name": "currency", "label": "Currency", "type": "select",
      "default": { "$gen": "defaultCurrency" }, "optionsFrom": "currencies" }
  ],
  "layout": { "columns": 12, "rowHeight": "320px", "widgets": [{ "widgetId": "variance", "gridArea": "1 / 1 / 2 / 13" }] },
  "widgets": [
    {
      "id": "variance",
      "title": "This Month",
      "steps": [
        { "id": "actuals", "kind": "query",
          "query": "SELECT account, currency, SUM(CAST(amount AS REAL)) AS actual FROM postings WHERE account_type = 'Expenses' AND transaction_date BETWEEN :monthStart AND :monthEnd AND currency = :currency GROUP BY account, currency" },
        { "id": "budgets", "kind": "compute", "fn": "budget_for_range",
          "args": { "from": "{{params.monthStart}}", "to": "{{params.monthEnd}}", "currency": "{{params.currency}}" } },
        { "id": "out", "kind": "transform", "fn": "joinBudgetActual",
          "inputs": ["{{steps.budgets}}", "{{steps.actuals}}"] }
      ],
      "output": "out",
      "visualization": {
        "type": "table",
        "columns": [
          { "key": "account", "label": "Account", "format": "accountName2" },
          { "key": "budget", "label": "Budget", "format": "currency", "align": "right" },
          { "key": "actual", "label": "Actual", "format": "currency", "align": "right" },
          { "key": "remaining", "label": "Remaining", "format": "signedCurrency", "align": "right" },
          { "key": "pctUsed", "label": "% Used", "format": "percent", "align": "right" }
        ]
      }
    }
  ]
}
```

The bundled `budget-overview`, `budget-envelopes`, `budget-zero-based`, and `budget-history` dashboards build on this pattern with the other budget transforms. For the user-facing workflow — copying a demo and adapting it to your own accounts — see [Build your own budget dashboard](/views/budgets/#build-your-own-budget-dashboard).

---

## Validation Rules

Recipes are validated when saved. Here's a summary of the validation rules:

### Dashboard Validation
- `schemaVersion`: Required, must be `2`.
- `id`: Required, non-empty, must match `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.
- `title`: Required, non-empty string.
- `layout`: Required object with `columns` (number), `widgets` (array).
- Each layout widget must have `widgetId` (string) and `gridArea` (string).
- `widgets`: Required, non-empty. Every `widgetId` in the layout must match an `id` in the `widgets` array (widgets are inline only).

### Widget Validation
- `id`: Required, non-empty, must match the same pattern as dashboard IDs.
- `title`: Required, non-empty string.
- `steps`: Required, non-empty. Each step has a unique lowercase-hyphen `id` and a `kind` (`query`/`compute`/`transform`).
  - `query` steps need a non-empty `query` and may not contain `{{...}}` references.
  - `compute` steps need an `fn`; `transform` steps need an `fn` and non-empty `inputs`.
  - `{{steps.x}}` references must resolve to a declared step, and the step graph must be acyclic.
- `output`: Required. Must name a step in `steps`.
- `visualization`: Required object with `type` in `["kpi", "chart", "table", "pivot"]`.
- For `chart`: `chartType` must be in `["bar", "line", "pie", "area", "scatter", "treemap", "funnel", "gauge", "calendar", "sankey", "radar", "sunburst"]`.
- For `kpi`: `iconColor` is any string — a `{{theme.*}}` token, a hex/CSS color, or a legacy name (`blue`/`green`/`red`/`purple`/`amber`). See [Colors](#colors).
- `format` and label format strings must be valid format names.

### Step Validation
- `query` steps are dry-run against the database at save time to catch syntax errors (SELECT/WITH only).
- `compute` `fn` names must exist in the server's function catalog, and their `args` must satisfy the function's schema.
- `transform` `fn` names must exist in the transform catalog.
- The output's shape is checked against the visualization at render time — if a step returns the wrong shape for the chosen viz (e.g. a plain row list wired to a pivot), the widget shows a clear error instead of a blank panel.

### ID Conflict Detection

Dashboard IDs must be unique across recipe files; step IDs must be unique within a widget. When two dashboard files share an `id`, an amber warning banner appears at the top of the Dashboards view listing the conflict and the files involved. When saving in the Settings editor, a confirmation dialog appears if the dashboard ID is already in use, letting you change it or save anyway.

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
- For year selectors, use `"optionsFrom": "years"` to dynamically populate from years present in the ledger data.
- Common pattern: dashboard-level `year` parameter + widget-level `currency` parameter on charts/pivots, while KPIs show all currencies.

### Dark Mode
- The app automatically handles dark mode styling for charts, including text colors, grid lines, and borders.
- Don't hardcode text colors in chart labels — the app adjusts them automatically.
- Exception: `itemStyle.color` (bar/line/pie colors) is preserved as specified.
