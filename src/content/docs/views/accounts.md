---
title: Accounts
description: The Accounts view — browsing, managing, and inspecting your account hierarchy.
sidebar:
  order: 5
---

The Accounts view shows your full chart of accounts as a hierarchical tree with rolled-up balances. From here you can create, edit, close, and delete accounts, view account statements, and manage balance assertions.

---

## Filter Panel

The filter panel at the top controls which accounts are shown and how balances are computed.

### Date Filter

A date preset selector controls the date range used for computing balances. The default is **YTD** (January 1 of the current year to today). Other presets include This Quarter, This Month, Last 30 Days, All Time, and a custom range.

The date range affects balances differently depending on the account type:
- **Balance sheet accounts** (Assets, Liabilities, Equity) show the cumulative balance up to the end date.
- **Income statement accounts** (Income, Expenses) show the balance within the date range.

### Search

A search box filters accounts by name. Matching accounts and their parent nodes are shown; the rest are hidden. The tree auto-expands to reveal matches.

### Type and Status Filters

- **Type** — filter by account type: Assets, Liabilities, Equity, Income, or Expenses.
- **Status** — filter by Open or Closed.

### New Account

The **New Account** button opens a form to create a new account. Enter the account name (in the format `Type:Category:Name`, e.g., `Assets:Bank:Checking`), open date, currencies, and optional metadata like a description or banking details. See [Account Hierarchy Design](/reference/account-hierarchy/) for guidance on structuring your accounts.

---

## Accounts Table

The table displays accounts as an indented tree. Parent accounts can be expanded or collapsed using the chevron icon. **Expand All** and **Collapse All** buttons above the table let you control the entire tree at once. A **refresh** button reloads account data from the ledger.

### Columns

| Column | Description |
|--------|-------------|
| Account | The account name, indented to show hierarchy. Clickable — opens the [account detail drawer](#account-detail-drawer). |
| Type | Account type badge — Assets (green), Liabilities (red), Equity (purple), Income (blue), or Expenses (amber). |
| Status | Open (green) or Closed (gray). |
| Currencies | The currencies configured for this account. Shows the first three, with a "+N more" indicator if there are additional ones. |
| Balance | The rolled-up balance for this account and all its children, formatted by currency. Shows the top two currencies by absolute value. Click "+N more" to see a full breakdown. Clickable — navigates to the [Transactions](/views/transactions/) view filtered to this account. |
| Actions | Icon buttons for account operations (see below). |

Parent accounts that do not exist as explicit accounts in the ledger (virtual parent nodes) are shown in italic gray text and do not have action buttons.

### Rolled-Up Balances

Each account's balance includes the balances of all its child accounts. For example, if `Assets:Bank:Checking` has a balance of $5,000 and `Assets:Bank:Savings` has $10,000, then `Assets:Bank` shows $15,000 and `Assets` shows at least $15,000 (plus any other asset accounts).

---

## Action Icons

The rightmost column contains icon buttons for each account. Hover over an icon to see its purpose.

### Edit (pencil icon)

Opens the account form where you can change:
- **Account name** — renaming updates all transactions that reference this account.
- **Open date** and **close date**.
- **Currencies** — add or remove currencies.
- **Description** — a free-text note about the account.
- **Banking details** — account number, IFSC code, SWIFT/BIC code.
- **Custom metadata** — arbitrary key-value pairs.

### Account Statement (document icon)

Opens a modal showing the account's transaction history as a running-balance statement. The statement table includes:
- Date, description (payee and narration), and for each currency: the transaction amount and the cumulative running balance.
- A date filter and search box to narrow results.
- For multi-currency accounts, currency toggle chips let you show or hide individual currencies.

### Balance Assertions (scale icon)

Opens a modal for managing **balance assertions** and **pad directives**. These are Beancount directives that verify your ledger balance matches your real-world balance (e.g., a bank statement balance) on a given date.

**Viewing:** The modal lists all existing balance assertions for the account, showing the date, currency, expected balance, whether a pad directive is associated, and the status (pass or fail). Failed assertions show an expandable error message.

**Adding:** Click **Add Balance Assertion** and enter the date, amount, and currency. Optionally check **Include pad directive** and select a source account — this creates a padding transaction that automatically adjusts the balance to match.

**Editing and deleting:** Use the pencil and trash icons on each row to modify or remove existing assertions.

### Close / Reopen (circle-X or arrow-path icon)

- For open accounts: opens a modal to **close the account**. Enter a close date and an optional reason.
- For closed accounts: **reopens the account** directly (no modal).

### Delete (trash icon)

Opens a confirmation modal. If the account has transactions, the modal shows the count and offers a checkbox to **also delete the associated transactions**. Deletion cannot be undone.

---

## Account Detail Drawer

Clicking an account name opens a slide-out drawer on the right side with detailed information:

- **Core info** — open date, close date, and all configured currencies.
- **Balance** — all currency balances for the account, color-coded (green for positive, red for negative).
- **Banking details** — account number, IFSC code, and SWIFT/BIC, if configured.
- **Custom fields** — any custom metadata key-value pairs.
- **Notes** — the account description, if set.

An **Edit Account** button at the bottom opens the edit form directly from the drawer.

---

## Deep Linking

The Accounts view supports URL parameters for deep linking. For example, after completing the setup wizard, the app navigates to `/accounts?expanded=1` to show all accounts expanded. The following parameters are supported:

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `search` | `?search=Bank` | Pre-fill the search filter |
| `type` | `?type=Assets` | Filter by account type |
| `status` | `?status=open` | Filter by status |
| `startDate` | `?startDate=2024-01-01` | Set the date range start |
| `endDate` | `?endDate=2024-12-31` | Set the date range end |
| `preset` | `?preset=YTD` | Select a date preset |
| `expanded` | `?expanded=1` | Expand all accounts on load |
