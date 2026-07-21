---
title: Budgets
description: Set budgets per account and currency, and track spending against them.
sidebar:
  order: 6
---

The Budgets view lets you set a budget for any account, separately for each currency, so your actual spending can be tracked against it using dashboards. The unit of a budget is an **(account, currency)** pair, so the same account can carry an independent budget in each currency you use (see [Multiple currencies](#multiple-currencies)); each is **effective from a date and holds until you change it** (see [Effective-dating](#effective-dating)). Budgets are saved into your ledger, so they travel with your data. For the exact storage format and the full semantics, see the [Budgeting reference](/reference/budgeting/).

---

## Setting a budget

Open **Budgets** from the sidebar. The view lists one row per **(account, currency)** pair you budget, with two amount columns:

- **Budget** — what's in effect for that account and currency, as of the date in the **Budget as of** filter (today by default). This column is read-only.
- **New budget** — enter an amount here (with an interval and effective date) to change the budget *going forward*. Saving adds a new budget effective from that date; the earlier budget still governs the earlier period. A row with a pending entry is marked **Edited**.

Stage as many changes as you like across rows, then click **Save Changes** below the table to commit them together; **Reset** discards the staged entries. A per-row status icon shows Edited, Saved, or — if a write fails — an error you can hover for the reason.

- **Quick-add row** (top): budget an account and currency you haven't budgeted yet — enter account, currency, interval, amount, and effective date, then **Add**.
- **Filters:** narrow by account name, set the **Budget as of** date, and — when you budget in more than one currency — filter by **Currency**.

The budget editor is also reachable from the **Accounts** view: open an account's detail drawer and click **Manage** in the **Budget** section.

### Managing budget history

Setting a **New budget** always adds a budget going forward; it never rewrites the past. To correct or remove an earlier budget, expand a row with its **▸** chevron to open **Manage history** — the full timeline for that account and currency. There you can:

- **Edit or delete** an individual past or current budget in place. These changes apply immediately (they are corrections to the record, not staged forward changes).
- **End budget** — stop budgeting this account and currency from a date you choose, keeping the earlier budgets (see [Ending a budget](#ending-a-budget)).

---

## Good to know

These concepts affect what your budgets mean and what the dashboards show. They're summarized here in plain terms; for the full detail — including the exact directive format Finzytrack writes into your ledger — see the [Budgeting reference](/reference/budgeting/).

### Effective-dating

A budget applies from its effective date until a later budget for the **same account and currency** replaces it. To change an amount mid-year, add a new budget with a later date — the earlier one still governs the earlier months. That's exactly what the **New budget** column does: it adds a budget going forward without touching the past.

### Ending a budget

**End budget** — in a row's [Manage history](#managing-budget-history) — stops budgeting an account and currency from a date you choose, without deleting the record of what you budgeted before. From that date the account drops out of budget-vs-actual tracking, while the earlier budgets remain for the periods they governed.

Ending is different from budgeting **0**. A budget of 0 is a real target of zero — spending against it counts as over budget. An end means there is *no budget at all* from that date. To resume budgeting, set a new budget with a later effective date; to undo an end, delete it in **Manage history**.

### Inheritance

A budget on a parent account is compared against spending on that account **and all of its sub-accounts**. A budget on `Expenses:Food` covers `Expenses:Food`, `Expenses:Food:Restaurants`, and so on. If you also budget a child account, that child is tracked as its own line *and* still counts toward the parent — they overlap by design.

To set **one total budget for a whole area** — the top-down / zero-based way — just budget the grouping account: pick it from the account dropdown when setting a budget. You can even budget your entire expenses by selecting the **Expenses** account ([how the root is stored](/reference/budgeting/#total-budgets-and-the-account-root)). The **[Budget: Zero-based](#choosing-a-budgeting-style)** dashboard turns such a total into named carve-outs plus an "Unbudgeted" remainder, with a sunburst carving it all the way down. Total budgets are shown only in that top-down view — the other (bottom-up) dashboards ignore them so they don't double-count.

### Multiple currencies

A budget applies only to its own currency; spending in other currencies is ignored for that budget. The **same account can carry a separate budget in each currency**, tracked side by side — for example a USD budget and an INR budget on `Expenses:Food`, each compared only against spending in its own currency. Budget dashboards work in one currency at a time (a **Currency** parameter), since amounts in different currencies can't be summed into a single variance.

---

## Choosing a budgeting style

Budget *tracking* is done with dashboards. Finzytrack ships a demo dashboard for each common style — open the **Dashboards** view, pick the one that matches how you like to budget, and copy/tweak it if needed. The "allocation philosophy" (how you arrive at the numbers — zero-based, 50/30/20, pay-yourself-first) is just how you choose what to enter; the tracking is the same machinery.

| If you budget like this… | Use this demo dashboard | What it shows |
|---|---|---|
| A fixed amount per account each month, at a glance | **Budget: Overview** | Headline KPIs — total budgeted, spent, remaining — a per-account progress list, and the spending that falls outside any budget |
| Unspent money rolls over to next month | **Budget: Envelopes** | Every envelope's balance at a glance; click one to drill into its month-by-month available, spent, and carryover |
| One total for an area, a few named sub-budgets, rest lumped together | **Budget: Zero-based** | Named carve-outs plus an "Unbudgeted" bucket that sums back to the total, with a sunburst carving it all the way down |
| "How have I done, month by month?" | **Budget: History** | Budget vs actual month by month over any window (defaults to the trailing year), plus a per-account adherence heat-map (green under, red over) |

**Two more popular styles don't need their own dashboard** — they're quick recipes over the *same* machinery, covered under [Build your own](#other-styles-build-your-own) below:

- **50/30/20** (and pay-yourself-first) — the Overview dashboard with budgets set on your Needs/Wants/Savings group accounts, plus a proportion donut. Same no-rollover math, just three groups and different labels.
- **Pace / burn-down** ("am I on track this month?") — a cumulative line of budget vs actual for one account, built as a single widget.

---

## Build your own budget dashboard

The demo dashboards **just work once you've set your budgets** — they already cover every budgeted account, so most people never edit one. Change a dashboard only to show something *different* from the demo; when you do, copy a demo and adjust it.

### 1. Set your budgets first

A budget dashboard only has something to show once you've set budgets. Add them in this **Budgets** view (above) for the accounts you want to track. Then make sure you're looking at a month or date range that actually has spending, in the right currency.

### 2. Copy the demo that matches your style

Open **Settings → Dashboards**, select the demo from the list (e.g. *Budget: Overview*), and copy its JSON. Either edit it in place, or — to keep the original as a reference — paste it into a new dashboard and give it a new `id` and `title`. The editor validates as you go and shows a live preview.

### 3. Adjust it — usually nothing to change

With your budgets set, the demos work as-is; adjust the parameters to taste:

- **Overview / History** — no structural change. They cover *every* budgeted expense account (and, for Overview, the whole-expenses "Unbudgeted" remainder) automatically. Set the **From/To** and **Currency** parameters to taste.
- **Envelopes** — no structural change either; it lists every budgeted account with its current balance, so click any envelope to drill into its trend. Balances accumulate from each envelope's **first budget** (so what you see is the real balance, not a window that resets); use **As of** to evaluate at a past date, and **Start fresh** to deliberately reset an envelope to empty on a chosen date.
- **Zero-based (catch-all)** — pick your umbrella account in the **Total account** selector: a grouping account like `Expenses:Insurance`, or your whole expenses by selecting the **Expenses** root. Set a total budget on it plus budgets on the children you want named; everything else rolls into **Unbudgeted**.

To change accounts, columns, or the underlying SQL, see the [Dashboard & Widget Recipes](/reference/dashboard-recipes/) reference for the full format.

### Other styles (build-your-own)

Two popular styles are recipes over the same building blocks rather than seeded dashboards:

- **50/30/20** — group your expenses under Needs / Wants / Savings accounts and set a monthly budget on each of the three groups. The **Overview** dashboard then tracks them like any other budget (inclusive-parent covers each group's subtree). Add a **proportion donut** to see the actual split against the 50/30/20 ideal: a `pie` chart (`radius: ["40%","68%"]`) over a query of actual spend per group. It's the same no-rollover math — only which numbers you enter changes.
- **Pace / burn-down** — "am I pacing to stay under this month?" is one widget: a `query` for per-period actuals + a `budget_for_range` (`groupBy: "period"`) step, joined with `joinByPeriod`, then `runningSum` (`fields: ["budget","actual"]`, `orderBy: "period"`) to get cumulative series, plotted as a `line` chart. The actual line crossing above the budget line means you're pacing over. Drop it into the Overview (or any dashboard) as an extra widget rather than a whole dashboard.

### Troubleshooting — "my dashboard is empty"

The widgets should degrade gracefully (you'll see a short message, not a broken panel). If a budget widget is empty or showing blanks, check, in order:

1. **Budgets are set** for the accounts the widget covers (Budgets view).
2. The selected **month / date range has spending** — the example data may not cover the current month; pick a populated one.
3. The **currency** matches your budgets and postings.
4. For zero-based, the **Total account** you picked has a budget (a grouping account, or the Expenses root). If your named budgets add up to more than the total, that's *over-allocation* — the top-level "Unbudgeted" slice goes negative (and drops out of the sunburst). (Overview, Envelopes, and History need no swap — they cover every budgeted account automatically.)

### Or let the AI assistant build it

If you'd rather describe what you want, the assistant can build or adjust a budget dashboard for you — see below.

---

## Asking the AI assistant

If you have [AI configured](/quick-start/#configuring-ai), the assistant can answer budget questions ("what's my Food budget in June?", "am I over budget on groceries this year?") and build or adjust budget dashboards for you. Setting budget *amounts*, though, is done by you in this view — the assistant reads and composes, it doesn't set your numbers.
