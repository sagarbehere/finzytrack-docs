---
title: Budgets
description: Set budgets per account and currency, and track spending against them.
sidebar:
  order: 6
---

The Budgets view lets you set a budget for any account — separately for each currency — effective from a date, and track actual spending against it. The unit of a budget is an **(account, currency)** pair, so the same account can carry an independent budget in each currency you use (see [Multiple currencies](#multiple-currencies)). Budgets are stored directly in your ledger as standard Beancount `custom "budget"` directives, so they stay compatible with Fava and travel with your data.

---

## Setting a budget

Open **Budgets** from the sidebar. The view lists one row per **(account, currency)** pair you budget, with two amount columns:

- **Current budget** — what's in effect for that account and currency, as of the date in the **Current budget as of** filter (today by default). This column is read-only.
- **New budget** — enter an amount here (with an interval and effective date) to change the budget *going forward*. Saving writes a new directive effective from that date; the earlier budget still governs the earlier period. A row with a pending entry is marked **Edited**.

Stage as many changes as you like across rows, then click **Save Changes** below the table to commit them together; **Reset** discards the staged entries. A per-row status icon shows Edited, Saved, or — if a write fails — an error you can hover for the reason.

- **Quick-add row** (top): budget an account and currency you haven't budgeted yet — enter account, currency, interval, amount, and effective date, then **Add**.
- **Filters:** narrow by account name, set the **Current budget as of** date, and — when you budget in more than one currency — filter by **Currency**.

### Editing or removing past budgets — Manage history

Setting a **New budget** always adds a directive going forward; it never rewrites the past. To correct or remove an earlier directive, expand a row with its **▸** chevron to open **Manage history** — the full timeline of directives for that account and currency. There you can:

- **Edit or delete** an individual past or current directive in place. These changes apply immediately (they are corrections to the record, not staged forward changes).
- **End budget** — stop budgeting this account and currency from a date you choose, keeping the past directives (see [Ending a budget](#ending-a-budget)).

The same per-account budget editor is available from the **Accounts** view: open an account's detail drawer and use its **Budget** section.

A budget you set is written to your ledger as a directive like:

```
2026-01-01 custom "budget" Expenses:Food "monthly" 500 USD
```

You can equally hand-write these directives in your ledger file — the Budgets view simply reads and writes them for you.

---

## How budgets are interpreted

These semantics determine what your budget numbers *mean*.

### Effective-dating

A budget applies from its effective date until a later budget for the **same account and currency** supersedes it. To change an amount mid-year, add a second directive with a later date — the earlier one still governs the earlier months.

### Ending a budget

To stop budgeting an account and currency from a certain date — without deleting the record of what you budgeted before — use **End budget** in a row's [Manage history](#editing-or-removing-past-budgets--manage-history). From that date the account is no longer budgeted: it drops out of budget-vs-actual tracking, while the earlier directives remain for the periods they governed.

Ending is different from budgeting **0**. A budget of 0 is a real target of zero — spending against it counts as over budget. An end means there is *no budget at all* from that date.

An end is stored as a budget directive with a `none` interval, for example:

```
2026-07-01 custom "budget" Expenses:Food "none" 0 USD
```

The `0` amount is inert — it exists only to name the currency, so you can end one currency's budget for an account while keeping another. To resume budgeting, set a new budget with a later effective date (it supersedes the end); to undo the end entirely, delete the end marker in **Manage history**.

:::note
The end marker is specific to Finzytrack. The directive stays valid in any Beancount tool, but a tool that doesn't recognize the `none` interval (such as Fava) simply ignores it and shows the previous budget as continuing.
:::

### Inheritance (inclusive-parent)

A budget on a parent account is compared against spending on that account **and all of its descendants**. A budget on `Expenses:Food` covers `Expenses:Food`, `Expenses:Food:Restaurants`, and so on. If you also budget a child account, that child is tracked as its own line *and* still counts toward the parent — they overlap by design.

:::note
Beancount accounts need at least one subaccount, so you cannot budget the bare `Expenses` root. To budget a whole area, budget a real grouping account (for example `Expenses:Insurance`).
:::

### Multiple currencies

A budget applies only to its own currency; spending in other currencies is ignored for that budget. The **same account can carry a separate budget in each currency**, tracked side by side — for example a USD budget and an INR budget on `Expenses:Food`:

```
2026-01-01 custom "budget" Expenses:Food "monthly"   500 USD
2026-01-01 custom "budget" Expenses:Food "monthly" 30000 INR
```

Each is compared only against `Expenses:Food` spending in its own currency. Budget dashboards pick one currency at a time (a **Currency** parameter), since amounts in different currencies can't be summed into a single variance.

### Period normalization

A budget can use any interval (`daily`, `weekly`, `monthly`, `quarterly`, `yearly`). For an aligned period with a single active budget, the period total is exactly the amount you set. For other ranges, Finzytrack uses the same full-precision daily-equivalent normalization Fava does (`monthly ÷ days-in-that-month`, etc.), so arbitrary date ranges are computable.

---

## Choosing a budgeting style

Budget *tracking* is done with dashboards. Finzytrack ships a demo dashboard for each common style — open the **Dashboards** view, pick the one that matches how you like to budget, and copy/tweak it. The "allocation philosophy" (how you arrive at the numbers — zero-based, 50/30/20, pay-yourself-first) is just how you choose what to enter; the tracking is the same machinery.

| If you budget like this… | Use this demo dashboard | What it shows |
|---|---|---|
| A fixed amount per account each month, at a glance | **Budget — Overview** | Headline KPIs — total budgeted, spent, remaining — a per-account progress list, and the spending that falls outside any budget |
| One total for an area, a few named sub-budgets, rest lumped together | **Budget — Zero-based (catch-all)** | Named carve-outs plus a single "Unbudgeted" bucket that sums back to the total |
| "Am I pacing to budget?" over a span | **Budget — Burn-down** | Cumulative actual vs cumulative budget, month by month |
| Unspent money rolls over to next month | **Budget — Envelopes** | Every envelope's balance at a glance; click one to drill into its month-by-month available, spent, and carryover |

50/30/20 and pay-yourself-first are the **Overview** dashboard with budgets set on your Needs/Wants/Savings groups (or your savings account) — no different machinery, just different numbers and labels.

---

## Build your own budget dashboard

The demo dashboards are calibrated to the bundled example ledger, so they're **templates** — the quickest way to a budget dashboard for *your* data is to copy a demo and re-point it at your own accounts.

### 1. Set your budgets first

A budget dashboard only has something to show once you've set budgets. Add them in this **Budgets** view (above) for the accounts you want to track. Then make sure you're looking at a month or date range that actually has spending, in the right currency.

### 2. Copy the demo that matches your style

Open **Settings → Dashboards**, select the demo from the list (e.g. *Budget — Overview*), and copy its JSON. Either edit it in place, or — to keep the original as a reference — paste it into a new dashboard and give it a new `id` and `title`. The editor validates as you go and shows a live preview.

### 3. Re-point it at your accounts

What you change depends on the style:

- **Overview / 50-30-20 / pay-yourself-first** — nothing structural. These already cover *every* budgeted expense account (and, for Overview, the whole-expenses "unbudgeted" remainder), so once your budgets are set they just work. Adjust the **From/To** and **Currency** parameters to taste.
- **Envelopes** — nothing structural either. The overview lists *every* budgeted account with its current balance, so once your budgets are set it just works — click any envelope to drill into its trend. Balances accumulate from each envelope's **first budget** (so what you see is the real balance, not a window that resets); use **As of** to evaluate at a past date, and **Start fresh** to deliberately reset an envelope to empty on a chosen date.
- **Zero-based (catch-all)** — change `totalAccount` (in the `joinBudgetActual` step's `config`) from `Expenses:Insurance` to the account you want as the total (a real account that has sub-accounts — Beancount can't budget the bare `Expenses` root). Set a budget on that total account and on the children you want named; everything else rolls into **Unbudgeted**.
- **Burn-down** — replace the **Account** parameter's option list with your own accounts, and set a budget for each. It tracks one account at a time.

The SQL `account_type = 'Expenses'` / `account LIKE '…'` filters and the column list can be edited too — see the [Dashboard & Widget Recipes](/reference/dashboard-recipes/) reference for the full format.

### Troubleshooting — "my dashboard is empty"

The widgets degrade gracefully (you'll see a short message, never a broken panel). If a budget widget is empty or showing blanks, check, in order:

1. **Budgets are set** for the accounts the widget covers (Budgets view).
2. The selected **month / date range has spending** — the example data may not cover the current month; pick a populated one.
3. The **currency** matches your budgets and postings.
4. For zero-based and burn-down, the **account (or `totalAccount`) exists** in your ledger — those demos use example accounts you need to swap. (Envelopes needs no swap — click any budgeted envelope in its overview to drill in.)

Zero-based also calls out two cases in a **Note** column: *no total budget set on that account*, and *over-allocated* (your named budgets add up to more than the total).

### Or let the AI assistant build it

If you'd rather describe what you want, the assistant can build or adjust a budget dashboard for you — see below.

---

## Asking the AI assistant

If you have [AI configured](/quick-start/#configuring-ai), the assistant can answer budget questions ("what's my Food budget in June?", "am I over budget on groceries this year?") and build or adjust budget dashboards for you. Setting budget *amounts*, though, is done by you in this view — the assistant reads and composes, it doesn't set your numbers.
