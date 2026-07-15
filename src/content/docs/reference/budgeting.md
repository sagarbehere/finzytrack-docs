---
title: Budgeting
description: The custom "budget" directive format, the semantics Finzytrack applies, and the building blocks for budget dashboards.
sidebar:
  order: 3
---

This is the reference for how budgeting works in Finzytrack: the directive that stores a budget, the
semantics Finzytrack applies when resolving it, and the building blocks budget dashboards are made of.
For setting and tracking budgets in the app, see the [Budgets view guide](/views/budgets/); for the
dashboard recipe format, see [Dashboard & Widget Recipes](/reference/dashboard-recipes/).

## The `custom "budget"` directive

A budget is stored directly in your ledger as a standard Beancount `custom "budget"` directive — the
same format Fava uses, so budgets travel with your data:

```
2026-01-01 custom "budget" Expenses:Food "monthly" 500 USD
```

- **date** — the effective date; the budget applies from this date forward.
- **account** — the budgeted account. A budget on a parent covers the parent *and all descendants*
  (see [Inheritance](#inheritance-inclusive-parent)).
- **interval** — one of `daily`, `weekly`, `monthly`, `quarterly`, `yearly` (plus `none`, below).
- **amount + currency** — the budget for one interval, in one currency.

You can write these by hand or let the **Budgets view** read and write them for you.

### Ending a budget (`none`)

To stop budgeting an account/currency from a date — without deleting the earlier record — use the
`none` interval:

```
2026-07-01 custom "budget" Expenses:Food "none" 0 USD
```

From that date the account is no longer budgeted (it drops out of budget-vs-actual tracking); the
earlier directives still govern the periods before it. The `0` amount is inert — it only names the
currency. This end marker is specific to Finzytrack; other Beancount tools that don't recognize `none`
simply ignore it and show the previous budget as continuing.

## Semantics

### Effective-dating

A directive applies from its date until a **later directive for the same account *and* currency**
supersedes it. To change an amount mid-year, add a second directive with a later date; the earlier
one still governs the earlier months.

### Inheritance (inclusive-parent)

A budget on a parent account is compared against spending on that account **and all of its
descendants**. If you also budget a child, the child is tracked as its own line *and* still counts
toward the parent — they overlap by design. Aggregate views use a *maximal-named-subtree* rule so
nested budgets never double-count a total.

### Total budgets and the account root

To set one total for a whole area, budget a **grouping account** (a non-leaf, e.g.
`Expenses:Insurance`). Beancount won't accept a bare root token (`Expenses`), but **quoting it** works
and both Beancount and Fava read it:

```
2026-01-01 custom "budget" "Expenses" "monthly" 9000 USD
```

Such root/total budgets are **excluded from bottom-up per-account views by default** (they'd double-count
against the accounts beneath them). The top-down **Budget: Zero-based** dashboard opts them in to carve
the total into named budgets + an Unbudgeted remainder.

### Multiple currencies

A budget applies only to its own currency; spending in other currencies is ignored for it. The **same
account can carry a separate budget per currency**, tracked side by side. The unit of a budget is an
**(account, currency)** pair.

### Ambiguity — last wins

Beancount doesn't enforce uniqueness on `custom` directives. If two directives share the same
`(date, account, currency)` with different amounts, Finzytrack takes the **last** (sorted by date,
then source file and line) and surfaces a warning so you can clean it up — it never silently averages
or drops one.

### Period normalization

A budget can use any interval. For a **calendar-aligned period with a single active budget**, the
period total is exactly the amount you set. For arbitrary ranges, Finzytrack uses the same
full-precision **daily-equivalent** normalization Fava does (`monthly ÷ days-in-that-month`, etc.),
computed per day and summed — so a range that crosses a budget change is a piecewise sum, and any date
range is computable. Cross-interval views (a yearly budget summed over one month) are inherently
fractional; only the display rounds.

## Building blocks for budget dashboards

Budget dashboards are ordinary [dashboard recipes](/reference/dashboard-recipes/): a `query` step for
actual spending + a `compute` step for the budget numbers + a `transform` that merges them. The pieces
are a fixed catalog — you compose them, you don't write new ones.

### The `budget_for_range` compute function

The single source of budget math. It reads your `custom "budget"` directives and resolves them over a
date range at full precision.

- **Signature:** `budget_for_range(from?, to, currency?, account?, groupBy?, includeRoots?)`.
- `from` optional — **omit it to start each account at its own first budget** (inception), the natural
  "from the beginning" for envelope balances.
- `account` optional — omitted returns every budgeted account in range; given, just that one.
- `groupBy: "period"` — returns a **per-calendar-month series** (for rollover / trends) instead of one
  total per account.
- `includeRoots: true` — include quoted root/total budgets (the zero-based view uses this).
- **Returns** `[{ account, currency, budget }]`, or `[{ account, currency, period, budget }]` in period
  mode.

### Budget transforms

Client-side transforms that turn budgets + actuals into what a widget renders:

| Transform | Does |
|---|---|
| `joinBudgetActual` | Per-account variance `{ budget, actual, remaining, pctUsed, direction }`. **Remainder mode** (`config.totalAccount`) adds synthetic **Unbudgeted** + **Total** rows for catch-all/zero-based, with an over-allocation flag. |
| `joinBudgetActualByPeriod` | Per-(account, period) variance — feeds the adherence heat-map. |
| `joinByPeriod` | Merges per-period budgets and actuals into one row per period. |
| `runningSum` | Cumulative columns over a period series — burn-down / pace. |
| `envelopeRollover` | Per-period `{ available, carryover, overspent }` — stateless envelope rollover. |
| `envelopeBalances` | Every budgeted account's inception-aware carried-forward balance. |
| `budgetTree` | Hierarchical carve-out of a total into named budgets + remainder (the zero-based sunburst). |
| `budgetSummary` | One aggregate row (budget / spent / remaining) for headline KPIs. |
| `unbudgetedSpending` | Spending in accounts covered by no budget — the "leak" list. |

Budget-progress bars and the adherence heat-map color themselves from the theme's favorability scale
(green under → amber approaching → on-budget → red over); see [Colors](/reference/dashboard-recipes/#colors).

## Budgeting styles → dashboards

Every style is the *same* machinery — which numbers you enter and which pieces you compose. Finzytrack
seeds one dashboard for each style that earns a dedicated one:

| Style | Dashboard |
|---|---|
| Per-account, no rollover (also 50/30/20, pay-yourself-first) | **Budget: Overview** |
| Envelope with rollover | **Budget: Envelopes** |
| Zero-based / total-with-carve-outs | **Budget: Zero-based** |
| Month-by-month history + adherence | **Budget: History** |

**50/30/20** and **pace / burn-down** don't get their own dashboard — they're quick recipes over the
same blocks (Overview with group budgets; a cumulative line for one account). The
[Budgets guide](/views/budgets/#other-styles-build-your-own) walks through building them.

## See also

- [Budgets view](/views/budgets/) — setting and tracking budgets in the app.
- [Dashboard & Widget Recipes](/reference/dashboard-recipes/) — the recipe format these dashboards use.
- [Dashboard Colors & Themes](/reference/dashboard-themes/) — how budget/chart colors are themed.
