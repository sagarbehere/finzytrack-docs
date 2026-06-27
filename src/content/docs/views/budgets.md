---
title: Budgets
description: Set budgets for any account and track spending against them.
sidebar:
  order: 6
---

The Budgets view lets you set a budget for any account, effective from a date, and track actual spending against it. Budgets are stored directly in your ledger as standard Beancount `custom "budget"` directives, so they stay compatible with Fava and travel with your data.

---

## Setting a budget

Open **Budgets** from the sidebar. The view is a single editable table of every budget you've set.

- **Quick-add row** (top): enter an account, currency, interval, amount, and effective date, then **Add**.
- **Inline editing:** change an existing budget's amount, interval, or effective date directly in its row. Edited rows are highlighted; click **Save Changes** to commit them all at once.
- **Delete:** remove a budget with the row's **Delete** button.
- **Filter:** narrow the table by account name.

You can also set a budget for a single account from the **Accounts** view: open an account's detail drawer and use the **Budget** section's **Manage** link, which jumps to the Budgets view pre-filtered to that account.

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

### Inheritance (inclusive-parent)

A budget on a parent account is compared against spending on that account **and all of its descendants**. A budget on `Expenses:Food` covers `Expenses:Food`, `Expenses:Food:Restaurants`, and so on. If you also budget a child account, that child is tracked as its own line *and* still counts toward the parent — they overlap by design.

:::note
Beancount accounts need at least one subaccount, so you cannot budget the bare `Expenses` root. To budget a whole area, budget a real grouping account (for example `Expenses:Insurance`).
:::

### Multiple currencies

A budget applies only to its own currency; spending in other currencies is ignored for that budget. One account can carry several budgets — one per currency — and they're tracked side by side.

### Period normalization

A budget can use any interval (`daily`, `weekly`, `monthly`, `quarterly`, `yearly`). For an aligned period with a single active budget, the period total is exactly the amount you set. For other ranges, Finzytrack uses the same full-precision daily-equivalent normalization Fava does (`monthly ÷ days-in-that-month`, etc.), so arbitrary date ranges are computable.

---

## Choosing a budgeting style

Budget *tracking* is done with dashboards. Finzytrack ships a demo dashboard for each common style — open the **Dashboards** view, pick the one that matches how you like to budget, and copy/tweak it. The "allocation philosophy" (how you arrive at the numbers — zero-based, 50/30/20, pay-yourself-first) is just how you choose what to enter; the tracking is the same machinery.

| If you budget like this… | Use this demo dashboard | What it shows |
|---|---|---|
| A fixed amount per account each month | **Budget — This Month** | Budget vs actual per account, with remaining and % used |
| One total for an area, a few named sub-budgets, rest lumped together | **Budget — Zero-based (catch-all)** | Named carve-outs plus a single "Unbudgeted" bucket that sums back to the total |
| "Am I pacing to budget?" over a span | **Budget — Burn-down** | Cumulative actual vs cumulative budget, month by month |
| Unspent money rolls over to next month | **Budget — Envelopes** | Per-month available, spent, and carryover |

50/30/20 and pay-yourself-first are the **This Month** dashboard with budgets set on your Needs/Wants/Savings groups (or your savings account) — no different machinery, just different numbers and labels.

To tweak a demo, open it, adjust the parameters (month range, currency, account), or edit its recipe in **Settings → Dashboards**. To build a budget dashboard from scratch — or have the AI assistant build one — see [Dashboard & Widget Recipes](/reference/dashboard-recipes/).

---

## Asking the AI assistant

If you have [AI configured](/quick-start/#configuring-ai), the assistant can answer budget questions ("what's my Food budget in June?", "am I over budget on groceries this year?") and build or adjust budget dashboards for you. Setting budget *amounts*, though, is done by you in this view — the assistant reads and composes, it doesn't set your numbers.
