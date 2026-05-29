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
| **Aggregation** | `SUM(CAST(amount AS REAL))` | `COST(SUM(position))` |
| **Pattern matching** | `LIKE` operator | `~` (regex) operator |
| **Date functions** | `strftime()` | `YEAR()`, `MONTH()`, `DAY()` |
| **Best for** | Complex joins, window-style queries, dashboard recipes | Quick account lookups, register views, balance queries |
| **Official docs** | [SQLite SQL](https://www.sqlite.org/lang.html) | [Beancount Query Language](https://beancount.github.io/docs/beancount_query_language.html) |

In dashboard recipes, set the widget's `dbType` field to `"sqlite"` (default) or `"beanquery"` to choose the engine.

---

## SQL Reference

SQL queries run against a SQLite export of your Beancount ledger. This is the default and recommended engine for dashboard recipes.

The database contains two groups of tables:
- **`postings`** — a denormalized, analytics-optimized table with one row per posting. This is the primary table for dashboard widgets and aggregate queries.
- **Ledger mirror tables** — normalized tables covering all other Beancount directives and computed state: `accounts`, `account_balances`, `commodities`, `prices`, `balance_assertions`, `lots`, and more.

Most queries only need the `postings` table. The ledger mirror tables are useful for specialized widgets like price history charts, lot tracking views, or balance assertion reports.

### The Postings Table

The `postings` table contains one row per posting. Each transaction has two or more postings that sum to zero (double-entry accounting).

#### Transaction-Level Columns

These columns have the same value for all postings within a transaction.

| Column | Type | Description |
|--------|------|-------------|
| `transaction_id` | TEXT | Unique transaction identifier (UUID). |
| `transaction_content_hash` | TEXT | SHA256 content-based hash of the transaction. |
| `transaction_date` | TEXT | Date in YYYY-MM-DD format. |
| `transaction_flag` | TEXT | `'*'` (cleared) or `'!'` (pending). |
| `transaction_payee` | TEXT | Payee or merchant name. |
| `transaction_narration` | TEXT | Transaction description. |
| `transaction_tags` | TEXT | JSON array of tag strings. |
| `transaction_links` | TEXT | JSON array of link strings. |
| `transaction_metadata_json` | TEXT | JSON object of transaction-level metadata from the ledger. |

#### Posting-Level Columns

| Column | Type | Description |
|--------|------|-------------|
| `posting_id` | INTEGER | Auto-incrementing primary key. |
| `account` | TEXT | Full colon-separated account path (e.g., `Expenses:Food:Groceries`). |
| `account_type` | TEXT | First segment: `Assets`, `Liabilities`, `Equity`, `Income`, or `Expenses`. |
| `amount` | TEXT | Posting amount as a Decimal-as-string (e.g. `"100.00"`). Positive = debit, negative = credit. Wrap with `CAST(amount AS REAL)` for `SUM`/`AVG`/arithmetic — see [Money column note](#money-columns-are-text) below. |
| `currency` | TEXT | Currency code (e.g., `"USD"`, `"INR"`). |
| `cost_amount` | TEXT | Cost basis amount as Decimal-as-string (for investments with cost tracking). Cast with `CAST(cost_amount AS REAL)` for arithmetic. |
| `cost_currency` | TEXT | Cost basis currency. |
| `price_amount` | TEXT | Price conversion amount as Decimal-as-string. Cast with `CAST(price_amount AS REAL)` for arithmetic. |
| `price_currency` | TEXT | Price conversion currency. |
| `source_account` | TEXT | The originating Assets or Liabilities account for this transaction. Computed from the other posting(s). |
| `source_account_type` | TEXT | Account type of the `source_account`. |
| `posting_metadata_json` | TEXT | JSON object of posting-level metadata from the ledger. |

#### Derived Columns

| Column | Type | Description |
|--------|------|-------------|
| `year` | INTEGER | Year extracted from `transaction_date`. |
| `month` | INTEGER | Month (1-12) extracted from `transaction_date`. |
| `quarter` | INTEGER | Quarter (1-4). |
| `year_month` | TEXT | Year and month as `YYYY-MM`. |

### Money columns are TEXT

`amount`, `cost_amount`, and `price_amount` are stored as `TEXT` holding the string form of an arbitrary-precision Decimal (e.g. `"1234.5678"`). This preserves the exact precision of the source ledger — a value like `0.12345678 BTC` round-trips without binary-float rounding error.

The trade-off is at aggregation. SQLite has no exact-decimal arithmetic, so when you sum or average these columns you must cast to `REAL`:

```sql
-- Correct: explicit cast for aggregation
SELECT account, SUM(CAST(amount AS REAL)) AS total
FROM postings
GROUP BY account

-- Also correct: SQLite implicit cast works for plain comparisons
SELECT * FROM postings WHERE amount > 0
```

A bare `SUM(amount)` will appear to work — SQLite silently coerces — but the convention in this project is to write the `CAST(... AS REAL)` explicitly so the float aggregation is visible to anyone reading the query.

The aggregation error from float conversion grows as `√N × machine epsilon`; for tens of thousands of postings it's around `10⁻¹²`, far below display precision. Single-row reads stay exact because no aggregation happens.

### Sign Conventions

Beancount uses double-entry accounting. Every transaction has postings that sum to zero. Understanding the sign of each account type is essential for writing correct queries.

| Account Type | Sign | Meaning | To Display as Positive |
|-------------|------|---------|----------------------|
| **Expenses** | Positive (debit) | Money spent | Use `SUM(CAST(amount AS REAL))` directly |
| **Income** | Negative (credit) | Money earned | Use `-SUM(CAST(amount AS REAL))` or `SUM(CAST(amount AS REAL)) * -1` |
| **Assets** | Positive (debit) | What you own | Use `SUM(CAST(amount AS REAL))` directly |
| **Liabilities** | Negative (credit) | What you owe | Use `-SUM(CAST(amount AS REAL))` for outstanding balance |

Common derived values:

- **Net worth** = `SUM(CAST(amount AS REAL)) WHERE account_type IN ('Assets', 'Liabilities')`
- **Savings** = Income - Expenses = `SUM(CASE WHEN account_type = 'Income' THEN -CAST(amount AS REAL) ELSE 0 END) - SUM(CASE WHEN account_type = 'Expenses' THEN CAST(amount AS REAL) ELSE 0 END)`

:::caution
Expenses can be negative (refunds) and income can be positive (reversals). Always use `SUM(CAST(amount AS REAL))` to compute net figures — it handles these edge cases automatically. Don't assume all expenses are positive.
:::

### Multi-Currency Rules

Your ledger may contain multiple currencies (e.g., USD and INR). **Never sum amounts across different currencies.** Always do one of:

**Group by currency** — show each currency separately:
```sql
SELECT currency, SUM(CAST(amount AS REAL)) AS amount
FROM postings
WHERE account_type = 'Expenses' AND year = :year
GROUP BY currency
HAVING amount != 0
```

**Filter to one currency** — let the user choose:
```sql
SELECT account, SUM(CAST(amount AS REAL)) AS total
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
SELECT currency, SUM(CAST(amount AS REAL)) * -1 AS amount
FROM postings
WHERE account_type = 'Income' AND year = :year
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

#### Total expenses for a year (multi-currency)
```sql
SELECT currency, SUM(CAST(amount AS REAL)) AS amount
FROM postings
WHERE account_type = 'Expenses' AND year = :year
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

#### Net worth by currency
```sql
SELECT currency,
  SUM(CASE WHEN account_type IN ('Assets', 'Liabilities') THEN CAST(amount AS REAL) ELSE 0 END) AS amount
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
  SUM(CAST(amount AS REAL)) AS expenses
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
  SUM(CASE WHEN account_type = 'Income' THEN -CAST(amount AS REAL) ELSE 0 END) AS income,
  SUM(CASE WHEN account_type = 'Expenses' THEN CAST(amount AS REAL) ELSE 0 END) AS expenses,
  SUM(CASE WHEN account_type = 'Income' THEN -CAST(amount AS REAL) ELSE 0 END) -
    SUM(CASE WHEN account_type = 'Expenses' THEN CAST(amount AS REAL) ELSE 0 END) AS savings
FROM postings
WHERE year = :year AND currency = :currency
  AND account_type IN ('Income', 'Expenses')
GROUP BY year_month
ORDER BY year_month
```

#### Top expense categories
```sql
SELECT account, SUM(CAST(amount AS REAL)) AS total
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
  SUM(CAST(amount AS REAL)) AS value
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
SELECT account, year_month, SUM(CAST(amount AS REAL)) AS amount
FROM postings
WHERE account_type = 'Expenses'
  AND year = :year AND currency = :currency
GROUP BY account, year_month
ORDER BY account, year_month
```

#### Savings rate (income minus expenses)
```sql
SELECT currency,
  SUM(CASE WHEN account_type = 'Income' THEN -CAST(amount AS REAL) ELSE 0 END) -
  SUM(CASE WHEN account_type = 'Expenses' THEN CAST(amount AS REAL) ELSE 0 END) AS amount
FROM postings
WHERE year = :year AND account_type IN ('Income', 'Expenses')
GROUP BY currency
HAVING amount != 0
ORDER BY currency
```

:::tip[Computed columns for click-through links]
In dashboard recipes, you can include computed date columns in your query that aren't displayed but are used by click-through links:
```sql
SELECT account, SUM(CAST(amount AS REAL)) AS total,
  :year || '-' || printf('%02d', :month) || '-01' AS dateFrom,
  date(:year || '-' || printf('%02d', :month) || '-01', '+1 month', '-1 day') AS dateTo
FROM postings
WHERE ...
```
These columns can then be referenced in `clickLink` templates as `{{data.dateFrom}}` and `{{data.dateTo}}`. See the [dashboard recipes reference](/reference/dashboard-recipes/#click-through-links) for details.
:::

---

### Ledger Mirror Tables

These tables provide a complete, normalized view of your Beancount ledger beyond transactions. They are populated automatically whenever your ledger changes.

#### accounts

One row per account (Open directive). Close directives set the `close_date`.

| Column | Type | Description |
|--------|------|-------------|
| `name` | TEXT (PK) | Full account path (e.g., `Assets:Bank:Checking`). |
| `open_date` | TEXT | Date the account was opened (YYYY-MM-DD). |
| `close_date` | TEXT | Date closed, or NULL if still open. |
| `currencies_json` | TEXT | JSON array of allowed currencies (e.g., `["USD", "EUR"]`). |
| `booking` | TEXT | Booking method: `STRICT`, `FIFO`, `LIFO`, `AVERAGE`, `HIFO`, or NULL. |
| `metadata_json` | TEXT | JSON object of account metadata from the Open directive. |

#### account_balances

Per-account, per-currency final balances computed from all postings.

| Column | Type | Description |
|--------|------|-------------|
| `account` | TEXT | Account name (references `accounts.name`). |
| `currency` | TEXT | Currency code. |
| `balance` | TEXT | Current balance as a decimal string (preserves precision). |
| `transaction_count` | INTEGER | Number of transactions affecting this account+currency. |
| `last_transaction_date` | TEXT | Date of the most recent transaction (YYYY-MM-DD). |

Primary key: `(account, currency)`.

**Example — accounts with balances:**
```sql
SELECT a.name, a.open_date, a.close_date,
       ab.currency, ab.balance, ab.transaction_count
FROM accounts a
LEFT JOIN account_balances ab ON a.name = ab.account
ORDER BY a.name
```

#### commodities

One row per Commodity directive.

| Column | Type | Description |
|--------|------|-------------|
| `code` | TEXT (PK) | Commodity code (e.g., `USD`, `AAPL`). |
| `declaration_date` | TEXT | Date of the commodity directive. |
| `name` | TEXT | Full name from metadata (e.g., `"Apple Inc."`). |
| `type` | TEXT | Commodity type from metadata (e.g., `"stock"`, `"currency"`). |
| `metadata_json` | TEXT | JSON object of commodity metadata. |

#### commodity_usage

Transaction usage statistics per commodity, computed from postings.

| Column | Type | Description |
|--------|------|-------------|
| `code` | TEXT (PK) | Commodity code. |
| `transaction_count` | INTEGER | Number of postings using this commodity. |
| `total_volume` | TEXT | Sum of absolute amounts transacted. |
| `first_seen` | TEXT | Earliest transaction date. |
| `last_seen` | TEXT | Latest transaction date. |

#### prices

One row per Price directive. Useful for price history charts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `date` | TEXT | Price date (YYYY-MM-DD). |
| `base_currency` | TEXT | What's being priced (e.g., `AAPL`). |
| `quote_number` | TEXT | Price value as decimal string (e.g., `"150.00"`). |
| `quote_currency` | TEXT | Price denomination (e.g., `USD`). |
| `metadata_json` | TEXT | JSON object of price metadata. |

**Example — price history for a stock:**
```sql
SELECT date, CAST(quote_number AS REAL) AS price
FROM prices
WHERE base_currency = 'AAPL' AND quote_currency = 'USD'
ORDER BY date
```

#### balance_assertions

One row per Balance directive. Tracks whether each assertion passed or failed.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `date` | TEXT | Assertion date (YYYY-MM-DD). |
| `account` | TEXT | Account being asserted. |
| `amount_number` | TEXT | Expected balance as decimal string. |
| `amount_currency` | TEXT | Currency of the assertion. |
| `tolerance` | TEXT | Tolerance value, or NULL. |
| `passed` | INTEGER | `1` if assertion passed, `0` if failed. |
| `diff_number` | TEXT | Difference if failed, NULL if passed. |
| `diff_currency` | TEXT | Currency of the difference. |
| `metadata_json` | TEXT | JSON metadata. |

#### pad_directives

One row per Pad directive.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `date` | TEXT | Pad date (YYYY-MM-DD). |
| `account` | TEXT | Account being padded. |
| `source_account` | TEXT | Equity account to pad from. |
| `metadata_json` | TEXT | JSON metadata. |

#### lots

Current investment lot positions with cost basis, computed from Beancount's booking engine.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `account` | TEXT | Account holding the position. |
| `units_number` | TEXT | Number of shares/units as decimal string. |
| `units_currency` | TEXT | What's held (e.g., `AAPL`, `BTC`). |
| `cost_number` | TEXT | Per-unit cost basis as decimal string. |
| `cost_currency` | TEXT | Cost denomination (e.g., `USD`). |
| `acquisition_date` | TEXT | When the lot was opened (YYYY-MM-DD). |
| `label` | TEXT | Lot label (rare, usually NULL). |
| `book_value` | TEXT | `units_number * cost_number` (precomputed). |

**Example — current holdings with book value:**
```sql
SELECT account, units_currency AS ticker,
       CAST(units_number AS REAL) AS shares,
       CAST(cost_number AS REAL) AS cost_per_share,
       CAST(book_value AS REAL) AS total_cost
FROM lots
WHERE CAST(units_number AS REAL) > 0
ORDER BY account, units_currency
```

#### ledger_errors

Beancount parsing errors from the most recent parse.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `source_file` | TEXT | File path where the error occurred. |
| `line_number` | INTEGER | Line number of the error. |
| `message` | TEXT | Error message. |
| `entry_json` | TEXT | JSON representation of the problematic entry, if available. |

#### training_data

Payee/narration to category mappings extracted from transactions. Used for ML-based transaction categorization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing ID. |
| `description` | TEXT | Payee + narration text. |
| `category` | TEXT | Target account (e.g., `Expenses:Food`). |

#### Other Tables

These tables are available but less commonly queried in dashboards:

| Table | Description |
|-------|-------------|
| `notes` | Note directives attached to accounts (`date`, `account`, `comment`). |
| `events` | Event directives tracking named variables over time (`date`, `type`, `description`). |
| `documents` | Document directives linking files to accounts (`date`, `account`, `filename`). |
| `custom_directives` | Custom Beancount directives (`date`, `type`, `values_json`). |
| `stored_queries` | Named BQL queries defined in the ledger (`name`, `query_string`). |
| `ledger_options` | Beancount option values (`key`, `value_json`). |

#### Cross-Table Query Examples

**Accounts with their most recent transaction date:**
```sql
SELECT a.name, a.open_date, a.close_date,
       MAX(ab.last_transaction_date) AS last_activity
FROM accounts a
LEFT JOIN account_balances ab ON a.name = ab.account
GROUP BY a.name
ORDER BY last_activity DESC
```

**Commodities with usage statistics:**
```sql
SELECT c.code, c.name, c.type,
       cu.transaction_count, cu.first_seen, cu.last_seen
FROM commodities c
LEFT JOIN commodity_usage cu ON c.code = cu.code
ORDER BY cu.transaction_count DESC
```

**Failed balance assertions:**
```sql
SELECT date, account, amount_number, amount_currency,
       diff_number, diff_currency
FROM balance_assertions
WHERE passed = 0
ORDER BY date
```

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
- Use `SUM(position)` for aggregating amounts, **not** `SUM(amount)`. Wrap in `COST()` to get a numeric total: `COST(SUM(position))`. (This is BQL; the SQL-side `CAST(amount AS REAL)` convention does not apply here.)
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
SELECT SUM(CAST(amount AS REAL)) AS total
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
SELECT account, SUM(CAST(amount AS REAL)) AS total
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

---

## When the Two Engines Disagree

Both engines reflect your current ledger state at query time — there's no staleness difference. The asymmetry is **semantic**:

- **SQL reads `amount` as raw units.** `SUM(CAST(amount AS REAL))` over investment postings gives you "shares × cost-at-purchase" (the recorded transaction amount), not market value and not current cost basis. There's no automatic lot folding or cost reprojection. For pure-cash accounts (income, expenses, bank accounts) this doesn't matter — units *are* the value. For positions held at cost (`Assets:Investments:...` with `{cost}` syntax), it matters a lot.
- **BQL knows about positions, lots, and costs.** `sum(position)` keeps each position as a `(units, cost)` pair you can reproject with `COST(...)` or `VALUE(...)`. BQL also understands account hierarchy (`root_account`, `leaf_account`) without you having to split strings.

**Rule of thumb:**

- Cash-only aggregates (spend by category, income by month, payee roll-ups) → SQL, because it's fast and indexed.
- Portfolio queries (current holdings, cost basis by account, position-level inspection) → BQL, because it preserves cost semantics.
- For dashboard recipes that need both worlds, you can split a dashboard across multiple widgets with different `dbType` values.
