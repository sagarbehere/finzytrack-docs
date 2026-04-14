---
title: Transactions
description: The Transactions view — browsing, searching, editing, and deleting transactions.
sidebar:
  order: 4
---

The Transactions view lets you browse, search, edit, and delete the transactions in your ledger. It is also where you land when you click through from a dashboard widget.

---

## Filter Panel

The filter panel at the top of the view controls which transactions are shown. By default, the view loads transactions from the last 90 days. You can adjust the filters and click **Apply Filters** to update the results, or **Clear Filters** to reset everything to defaults.

### Date Filters

Quick presets let you jump to common ranges with one click: **Last 90 Days**, **Last 30 Days**, **Last 7 Days**, and **Today**. A dropdown offers additional options:

- **Previous periods** — Previous Month, Previous Quarter, Previous Year.
- **Rolling windows** — Last 30/90/365 Days.
- **Custom rolling** — type a number to see the last N days.

You can also set **Date From** and **Date To** directly for an arbitrary range.

### Text Filters

| Filter | Searches |
|--------|----------|
| Search | Payee and narration (global search) |
| Payee Contains | Payee field only |
| Narration Contains | Narration/description field only |
| Account Contains | Account names across all postings |
| Tags Contains | Transaction tags |
| Links Contains | Transaction links |

All text filters are partial-match and case-insensitive.

### Amount Filters

- **Amount Greater Than** — only show transactions with an amount above this value.
- **Amount Less Than** — only show transactions with an amount below this value.

### Other Filters

| Filter | Options |
|--------|---------|
| Currency | Filter by currency code (e.g., USD, EUR) |
| Flag | Any, `*` (cleared), or `!` (pending) |
| Account Type | All, Assets, Liabilities, Expenses, Income, or Equity |
| Year | Filter to a specific year |
| Quarter | Filter to Q1, Q2, Q3, or Q4 |

### Max Results

Controls the maximum number of transactions returned. Defaults to 1,000. If your query matches more transactions than this limit, a warning appears suggesting you increase the limit or refine your filters.

---

## Deep Linking

When you click through to Transactions from a dashboard widget or any other part of the app, the filters are pre-applied via URL parameters. For example, clicking a bar in the Year Summary chart might open Transactions with the date range and account type already set. You can further refine the filters from there.

---

## Transaction Table

The transaction table works the same way as in the [Import](/views/import/#reviewing-transactions) view — the same columns, column visibility controls, keyboard navigation, and inline editing apply here. See the Import view documentation for a full description of the [table columns](/views/import/#columns) and [editing controls](/views/import/#editing).

---

## Editing Transactions

You can edit any transaction directly in the table — click a cell to change its value. Modified transactions are marked with a pencil icon in the status column.

When you have unsaved changes, the **Save Changes** button appears above the table showing the number of modified transactions (e.g., "Save Changes (3)"). Click it to write your edits back to the ledger. A **Reset** button is also available to discard all edits and reload from the ledger.

If you try to navigate away with unsaved changes, a confirmation dialog asks whether you want to leave or stay.

---

## Deleting Transactions

Click the **−** button on a transaction to delete it. A confirmation dialog shows the transaction's date, payee, and narration and warns that the deletion will immediately update the ledger and cannot be undone. Once confirmed, the transaction is removed from both the table and the ledger.

---

## Summary

Below the table, a summary section shows aggregate information for the currently displayed transactions, including the number of edited and unbalanced transactions and account totals grouped by currency.
