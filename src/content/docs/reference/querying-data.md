---
title: Querying Data
description: Reference for querying your financial data with SQL and BQL — table schema, sign conventions, and common patterns.
sidebar:
  order: 2
---

Finzytrack provides two query engines for accessing your financial data: **SQL** (SQLite) and **BQL** (Beancount Query Language). Both are available in the [Query view](/views/query/) for ad-hoc queries, and in [dashboard recipes](/reference/dashboard-recipes/) for widget data.

## Query Engines

| | SQL (SQLite) | BQL (Beancount Query Language) |
|---|---|---|
| **Data source** | SQLite export of your ledger | Beancount entries directly (in-memory) |
| **Table** | Explicit `FROM postings` | Implicit — no table name needed |
| **Syntax** | Standard SQLite SQL | SQL-like but with Beancount-specific extensions |
| **Aggregation** | `SUM(amount)` | `COST(SUM(position))` |
| **Pattern matching** | `LIKE` operator | `~` (regex) operator |
| **Date functions** | `strftime()` | `YEAR()`, `MONTH()`, `DAY()` |
| **Best for** | Complex joins, window-style queries, dashboard recipes | Quick account lookups, register views, balance queries |
| **Official docs** | [SQLite SQL](https://www.sqlite.org/lang.html) | [Beancount Query Language](https://beancount.github.io/docs/beancount_query_language.html) |

In dashboard recipes, set the widget's `dbType` field to `"sqlite"` (default) or `"beanquery"` to choose the engine.

---

## SQL Reference

SQL queries run against a SQLite export of your Beancount ledger. This is the default and recommended engine for dashboard recipes.

### The Postings Table

The `postings` table contains one row per posting. Each transaction has two or more postings that sum to zero (double-entry accounting).

#### Transaction-Level Columns

These columns have the same value for all postings within a transaction.

| Column | Type | Description |
|--------|------|-------------|
| `transaction_id` | TEXT | Unique transaction identifier (UUID). |
| `transaction_date` | TEXT | Date in YYYY-MM-DD format. |
| `transaction_payee` | TEXT | Payee or merchant name. |
| `transaction_narration` | TEXT | Transaction description. |
| `transaction_flag` | TEXT | `'*'` (cleared) or `'!'` (pending). |
| `transaction_tags` | TEXT | JSON array of tag strings. |
| `transaction_links` | TEXT | JSON array of link strings. |

#### Posting-Level Columns

| Column | Type | Description |
|--------|------|-------------|
| `account` | TEXT | Full colon-separated account path (e.g., `Expenses:Food:Groceries`). |
| `account_type` | TEXT | First segment: `Assets`, `Liabilities`, `Equity`, `Income`, or `Expenses`. |
| `amount` | REAL | Posting amount. Positive = debit, negative = credit. |
| `currency` | TEXT | Currency code (e.g., `"USD"`, `"INR"`). |

#### Derived Columns

| Column | Type | Description |
|--------|------|-------------|
| `year` | INTEGER | Year extracted from `transaction_date`. |
| `year_month` | TEXT | Year and month as `YYYY-MM`. |
| `quarter` | INTEGER | Quarter (1-4). |

### Sign Conventions

Beancount uses double-entry accounting. Every transaction has postings that sum to zero. Understanding the sign of each account type is essential for writing correct queries.

| Account Type | Sign | Meaning | To Display as Positive |
|-------------|------|---------|----------------------|
| **Expenses** | Positive (debit) | Money spent | Use `SUM(amount)` directly |
| **Income** | Negative (credit) | Money earned | Use `-SUM(amount)` or `SUM(amount) * -1` |
| **Assets** | Positive (debit) | What you own | Use `SUM(amount)` directly |
| **Liabilities** | Negative (credit) | What you owe | Use `-SUM(amount)` for outstanding balance |

Common derived values:

- **Net worth** = `SUM(amount) WHERE account_type IN ('Assets', 'Liabilities')`
- **Savings** = Income - Expenses = `SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) - SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END)`

:::caution
Expenses can be negative (refunds) and income can be positive (reversals). Always use `SUM(amount)` to compute net figures — it handles these edge cases automatically. Don't assume all expenses are positive.
:::

### Multi-Currency Rules

Your ledger may contain multiple currencies (e.g., USD and INR). **Never sum amounts across different currencies.** Always do one of:

**Group by currency** — show each currency separately:
```sql
SELECT currency, SUM(amount) AS amount
FROM postings
WHERE account_type = 'Expenses' AND year = :year
GROUP BY currency
HAVING amount != 0
```

**Filter to one currency** — let the user choose:
```sql
SELECT account, SUM(amount) AS total
FROM postings
WHERE account_type = 'Expenses' AND currency = :currency
GROUP BY account
```

### SQL Syntax Rules

- **SQLite-compatible only.** No PostgreSQL or MySQL syntax.
- **Only SELECT statements** are allowed (and WITH for CTEs).
- Use `strftime()` for date operations — not `DATE_TRUNC` or `EXTRACT`.
- Use `:paramName` for parameter placeholders in dashboard recipes.
- Use `HAVING` to filter out zero-value rows (e.g., `HAVING amount != 0`).
- Include `ORDER BY` when results have a natural ordering.
- Use `LIMIT` to avoid returning excessive rows.
- Each transaction has 2+ postings — be careful not to double-count. Use `COUNT(DISTINCT transaction_id)` for transaction counts.
- Filter months with `CAST(strftime('%m', transaction_date) AS INTEGER) = :month`, or use the `year_month` column.

### Common SQL Patterns

#### Total income for a year (multi-currency)
```sql
SELECT currency, SUM(amount) * -1 AS amount
FROM postings
WHERE account_type = 'Income' AND year = :year
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

#### Total expenses for a year (multi-currency)
```sql
SELECT currency, SUM(amount) AS amount
FROM postings
WHERE account_type = 'Expenses' AND year = :year
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

#### Net worth by currency
```sql
SELECT currency,
  SUM(CASE WHEN account_type IN ('Assets', 'Liabilities') THEN amount ELSE 0 END) AS amount
FROM postings
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

#### Monthly expenses for a year (single currency)
```sql
SELECT year_month,
  SUBSTR('JanFebMarAprMayJunJulAugSepOctNovDec',
    (CAST(strftime('%m', year_month || '-01') AS INTEGER) - 1) * 3 + 1, 3) AS month_label,
  SUM(amount) AS expenses
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year AND currency = :currency
GROUP BY year_month
ORDER BY year_month
```

#### Monthly income vs expenses (for grouped bar chart)
```sql
SELECT year_month,
  SUBSTR('JanFebMarAprMayJunJulAugSepOctNovDec',
    (CAST(strftime('%m', year_month || '-01') AS INTEGER) - 1) * 3 + 1, 3) AS month_label,
  year_month || '-01' AS dateFrom,
  date(year_month || '-01', '+1 month', '-1 day') AS dateTo,
  SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) AS income,
  SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) -
    SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END) AS savings
FROM postings
WHERE year = :year AND currency = :currency
  AND account_type IN ('Income', 'Expenses')
GROUP BY year_month
ORDER BY year_month
```

#### Top expense categories
```sql
SELECT account, SUM(amount) AS total
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year AND currency = :currency
GROUP BY account
HAVING total > 0
ORDER BY total DESC
LIMIT :limit
```

#### Expense breakdown for a month (for treemap or pie chart)
```sql
SELECT REPLACE(account, 'Expenses:', '') AS name,
  account,
  SUM(amount) AS value
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year
  AND CAST(strftime('%m', transaction_date) AS INTEGER) = :month
  AND currency = :currency
GROUP BY account
HAVING value > 0
ORDER BY value DESC
```

#### Transaction count
```sql
SELECT COUNT(DISTINCT transaction_id) AS value
FROM postings
WHERE year = :year
```

#### Expenses by account and month (for pivot table)
```sql
SELECT account, year_month, SUM(amount) AS amount
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year AND currency = :currency
GROUP BY account, year_month
ORDER BY account, year_month
```

#### Savings rate (income minus expenses)
```sql
SELECT currency,
  SUM(CASE WHEN account_type = 'Income' THEN -amount ELSE 0 END) -
  SUM(CASE WHEN account_type = 'Expenses' THEN amount ELSE 0 END) AS amount
FROM postings
WHERE year = :year AND account_type IN ('Income', 'Expenses')
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

:::tip[Computed columns for click-through links]
In dashboard recipes, you can include computed date columns in your query that aren't displayed but are used by click-through links:
```sql
SELECT account, SUM(amount) AS total,
  :year || '-' || printf('%02d', :month) || '-01' AS dateFrom,
  date(:year || '-' || printf('%02d', :month) || '-01', '+1 month', '-1 day') AS dateTo
FROM postings
WHERE ...
```
These columns can then be referenced in `clickLink` templates as `{{data.dateFrom}}` and `{{data.dateTo}}`. See the [dashboard recipes reference](/reference/dashboard-recipes/#click-through-links) for details.
:::

---

## BQL Reference

BQL (Beancount Query Language) is a query language native to Beancount. It queries your ledger entries directly — no SQLite export needed. BQL is SQL-like but has important differences. For the full official specification, see the [Beancount Query Language documentation](https://beancount.github.io/docs/beancount_query_language.html).

### Columns

#### Posting-Level Columns (SELECT and WHERE)

| Column | Type | Description |
|--------|------|-------------|
| `date` | Date | Transaction date (YYYY-MM-DD). |
| `year` | integer | Year from transaction date. |
| `month` | integer | Month from transaction date (1-12). |
| `day` | integer | Day from transaction date (1-31). |
| `flag` | string | Transaction flag: `'*'` (cleared) or `'!'` (pending). |
| `payee` | string | Payee/merchant name. |
| `narration` | string | Transaction description. |
| `tags` | set | Set of tag strings. |
| `links` | set | Set of link strings. |
| `account` | string | Full account path (e.g., `Expenses:Food:Groceries`). |
| `number` | number | Posting amount as a plain number. |
| `currency` | string | Currency code (e.g., `USD`). |
| `amount` | Amount | Posting amount (number with currency). |
| `cost` | Amount | Cost basis of the posting. |
| `price` | Amount | Price conversion amount. |
| `position` | Position | The posting position — use with `SUM()` for aggregation. |
| `balance` | Inventory | Running cumulative balance (auto-calculated, not a stored column). |

#### Transaction-Level Columns (FROM clause)

| Column | Type | Description |
|--------|------|-------------|
| `date` | Date | Transaction date. |
| `year` | integer | Year from date. |
| `month` | integer | Month from date (1-12). |
| `day` | integer | Day from date (1-31). |
| `flag` | string | Transaction flag. |
| `payee` | string | Payee name. |
| `narration` | string | Description. |
| `tags` | set | Transaction tags. |
| `links` | set | Transaction links. |
| `id` | string | Stable hash derived from the transaction contents. |
| `type` | string | Entry type identifier. |

### Functions

#### Simple Functions

| Function | Description |
|----------|-------------|
| `COST(position)` | Get cost basis of a Position or Inventory as an Amount. |
| `UNITS(position)` | Get units (number and currency) of a Position or Inventory. |
| `YEAR(date)` | Extract year as integer. |
| `MONTH(date)` | Extract month as integer (1-12). |
| `DAY(date)` | Extract day as integer (1-31). |
| `LENGTH(set)` | Length of a set (e.g., `LENGTH(tags)`). |
| `PARENT(account)` | Parent account name (e.g., `PARENT("Expenses:Food:Groceries")` → `"Expenses:Food"`). |

#### Aggregate Functions

These summarize multiple rows and require a `GROUP BY` clause (or apply to all rows if none is specified).

| Function | Description |
|----------|-------------|
| `SUM(position)` | Sum positions into an Inventory. Wrap in `COST()` for a numeric total. |
| `COUNT(*)` | Count matching rows. |
| `FIRST(expr)` | First value encountered. |
| `LAST(expr)` | Last value encountered. |
| `MIN(expr)` | Minimum value. |
| `MAX(expr)` | Maximum value. |

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=`, `!=`, `<`, `<=`, `>`, `>=` | Comparison | `year = 2026` |
| `AND`, `OR`, `NOT` | Logical | `account ~ 'Expenses' AND year = 2026` |
| `~` | Regex match on strings | `account ~ 'Expenses:Food'` |
| `IN` | Set membership | `'trip' IN tags` |

### BQL Syntax Rules

- **No table name needed** — write `SELECT ... WHERE ...` directly. There is no `FROM postings`.
- **`FROM` clause filters at the transaction level**, **`WHERE` clause filters at the posting level.** This is an important distinction:
  - `FROM year = 2026` — filters entire transactions by year before expanding to postings.
  - `WHERE account ~ 'Expenses'` — filters individual postings.
- Use `~` for pattern matching, **not** `LIKE`. The `~` operator uses Python regex syntax.
- Use `SUM(position)` for aggregating amounts, **not** `SUM(amount)`. Wrap in `COST()` to get a numeric total: `COST(SUM(position))`.
- Use `YEAR(date)`, `MONTH(date)` for date parts, **not** `strftime()`.
- Dates are compared directly without quotes: `date >= 2026-01-01`.
- `SELECT DISTINCT` and `SELECT *` are supported.
- `GROUP BY` can use column positions: `GROUP BY 1, 2`.
- `ORDER BY` and `LIMIT` work like standard SQL. `ORDER BY` supports `ASC` (default) and `DESC`.
- `HAVING` is **not implemented** in BQL. Filter before aggregation with `WHERE` instead.
- `NULL = NULL` evaluates to `TRUE` in BQL, unlike standard SQL where it would be `NULL`.
- Semicolons at the end of queries are optional.
- Only SELECT queries are allowed in Finzytrack.

### Common BQL Patterns

#### Total by account
```
SELECT account, COST(SUM(position))
GROUP BY 1
ORDER BY 2
```

#### Monthly expenses
```
SELECT YEAR(date) AS y, MONTH(date) AS m, COST(SUM(position))
WHERE account ~ 'Expenses'
GROUP BY 1, 2
ORDER BY 1, 2
```

#### Top spending categories
```
SELECT account, COST(SUM(position)) AS total
WHERE account ~ 'Expenses'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
```

#### Account register (with running balance)
```
SELECT date, narration, position, balance
WHERE account ~ 'Assets:Bank:Checking'
```

#### Income for a year
```
SELECT account, COST(SUM(position))
FROM year = 2026
WHERE account ~ 'Income'
GROUP BY 1
```

#### Expenses by payee
```
SELECT payee, COST(SUM(position)) AS total
WHERE account ~ 'Expenses'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20
```

### BQL vs SQL: Equivalent Queries

**Total expenses for 2026:**

SQL:
```sql
SELECT SUM(amount) AS total
FROM postings
WHERE account_type = 'Expenses' AND year = 2026 AND currency = 'USD'
```

BQL:
```
SELECT COST(SUM(position)) AS total
FROM year = 2026
WHERE account ~ 'Expenses'
```

**Top 5 expense accounts:**

SQL:
```sql
SELECT account, SUM(amount) AS total
FROM postings
WHERE account_type = 'Expenses' AND currency = 'USD'
GROUP BY account
ORDER BY total DESC
LIMIT 5
```

BQL:
```
SELECT account, COST(SUM(position)) AS total
WHERE account ~ 'Expenses'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 5
```

---

## Choosing Between SQL and BQL

Use **SQL** when:
- Building dashboard recipe widgets (more predictable output format)
- You need computed columns (e.g., `dateFrom`, `dateTo` for click-through links)
- You need complex date formatting (e.g., month labels)
- You want explicit control over multi-currency handling with `GROUP BY currency`
- You need joins or CTEs

Use **BQL** when:
- Running ad-hoc queries in the Query view
- You want quick account register views with running balances
- You prefer Beancount's native query style
- You don't need the query output for a dashboard widget (BQL works but SQL is more common in recipes)

:::note
Both engines are fully supported in dashboard recipe widgets via the `dbType` field. However, most recipe examples use SQL because it gives more control over column names, date formatting, and multi-currency output format.
:::
