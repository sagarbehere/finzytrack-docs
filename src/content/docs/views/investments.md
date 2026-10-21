---
title: Investments
description: Record investment activity, add the metadata the investment dashboards use, and manage prices.
sidebar:
  order: 6
---

The Investments view has three tabs:

- **[Quick Actions](#quick-actions)** — forms that turn an investment event (a buy, a sale, a dividend…) into ledger transactions.
- **[Setup & Metadata](#setup--metadata)** — optional details for your holdings and accounts that add detail to the investment dashboards.
- **[Prices](#prices)** — the prices used to value your holdings: fetch them, add them, change them.

For what each piece of metadata means and what the dashboards do with it, see the
[Investments reference](/reference/investments/).

---

## Quick Actions

Pick an action, fill in the form, and click **Add to review**. Finzytrack builds the
transaction and adds it to a review table below the tabs. Nothing is written to your
ledger yet.

| Action | Records |
|---|---|
| **Buy** | Units of a holding bought at cost, paid from a cash account. |
| **Reinvest** | A reinvested dividend or income that buys more units. No cash moves. |
| **Dividend** | A dividend paid to cash. |
| **Sell** | A sale of units. Choose the lots (FIFO, LIFO, HIFO, or specific lots) and see the realized gain before you add it. The sale must be in the currency the lots were bought in. |
| **CD Matures** | A CD or term deposit paying its principal, and any final interest, to another account. |
| **Interest** | Interest credited to the account itself (compounding) or paid to another account. |
| **Add Holding** | A position you already hold, at its average cost, without its buy history. |
| **Open Deposit** | A new savings, CD or bond account — see [Open Deposit](#open-deposit). |

Each form takes a date and a currency, plus the accounts and amounts for that action.
**Buy** and **Sell** take an optional fee; every form except **Sell** takes an
optional narration.

- **Income account suggestions** come from your metadata, never from account names.
  For a dividend, Finzytrack suggests the income account whose `dividend_of` is that
  holding, or your only `income-type: "dividend"` account. For interest, it suggests
  your only `income-type: "interest"` account. You can always choose another.
- **Review and register.** You can edit the staged transactions in the review table,
  then click **Register** to write them to your ledger. If a transaction doesn't
  balance, you are asked before it is written. **Clear** removes everything staged.

### Open Deposit

Opens a savings, CD or bond account in one step. Enter the new account's name and
type, and optionally its interest rate and (for a CD or bond) its maturity date. The
**Date** and **Currency** at the top of the form are its open date and currency.

- **Create an interest income account for this deposit** (off by default) also
  creates an `Income` account for this deposit's interest, with a suggested name you
  can change, and links the two, so interest is matched to the deposit even when it
  is paid into another account. When it is off, you can pick an existing interest
  income account instead, or none.
- **Record the first deposit** also records the transfer into the new account, from an
  existing `Assets` or `Liabilities` account.

The form shows what will be written to your ledger as you type, and points out
anything that can't be written (for example a name that already exists). If your
accounts change before you click **Create** so that it would write something
different, nothing is written and the form shows the new preview instead. Unlike
the other Quick Actions, it does not go to the review table: **Create** writes it to
your ledger directly.

The **AI** and **Manual** tabs of the [Import](/views/import/) view build investment
transactions the same way, from a statement or from a sentence. They record buys,
sales, dividends, reinvested dividends, interest and CD maturities, but not positions
you already hold; use **Add Holding** for those.

---

## Setup & Metadata

Optional details for your investments. Each one adds detail to the investment
dashboards; nothing here is required. The tab has three sections:

| Section | Lists | Fields |
|---|---|---|
| **Holdings and currencies** | Every commodity except your operating currencies | Asset class, Name, Price symbol, and for I-Bonds, Issue month and Face value |
| **Cash and deposit accounts** | `Assets` accounts that hold only currencies and were never held at cost | Account type; Interest rate for checking, savings, CDs and bonds; Maturity date for CDs and bonds |
| **Income accounts** | All `Income` accounts, including closed ones | Income type, and for dividends, Dividend from |

Each section starts with one short line per field, saying what that field gives you
or when it is needed. An empty field reads **Not set**.

- **Show only items not set** hides items with nothing left to add. It starts on
  when there is something to add. "N more not shown — Show all"
  lists the rest.
- **Fields appear when they apply.** An account is offered Interest rate once its type
  is `checking`, `savings`, `cd` or `bond`, and Maturity date once it is `cd` or
  `bond`. A value that no longer applies stays
  visible, greyed, so you can clear it.
- **Holdings are edited in the table.** Changed cells are highlighted; **Save changes**
  writes them all in one go, and **Discard** drops them. If you leave the page with
  unsaved changes, you are asked first.
- **Accounts are edited one at a time.** **Edit** opens the account form, whose
  **Investment details** section has the same fields. It also has **Interest income
  account** for `savings`, `cd` and `bond` accounts, which is not shown in the table.
- **Cash or holding.** With no `operating_currency` in your ledger, setting a
  commodity's asset class to `cash` or `currency` (or away from it) changes whether
  it counts as cash or as a holding; the tab says so before you save. With operating
  currencies set, only those count as cash — change them in **Settings**.

Some investment dashboards show a short offer when you could add a detail, such as
"Want allocation and returns by asset class? Add an asset class to your holdings."
It links to this tab and can be dismissed.

---

## Prices

One row per holding and quote currency, for every holding you hold or that has a
price:

| Column | Shows |
|---|---|
| **Commodity** | The code, with **Not held** for a holding you no longer hold. |
| **Asset class** | The commodity's `asset-class`, or **Not set**. |
| **Fetch** | How it is priced: **Daily**, **Monthly**, **Computed** (I-Bonds), or **Not fetched**, with the reason. |
| **Latest price** | The newest price, or **No price**. |
| **As of** | Its date and age, e.g. "Oct 14 (6 days ago)", with **Out of date** when it is older than its fetch rate allows, and **In ledger file** when it comes from your ledger file. |

The **Held** filter (the default) shows holdings you hold now; **All** also shows
sold holdings and other priced commodities.

- **Update prices** fetches new prices. The result appears above the table: how many
  holdings were fetched, how many prices were added or updated, which holdings are
  not fetched, and each holding that couldn't be fetched, with the reason. If a
  symbol is wrong, set the **Price symbol** in Setup & Metadata.
- **Add price** adds a price for any commodity, date and currency.
- **Open a row** to see its price history, newest first, 50 per page. From there you
  can add a price, **Edit** a price's date or value, or **Delete** it. Prices from
  your ledger file are read-only. If a date already has a price, you are asked
  before it is replaced. A price added in another currency opens that currency's
  history.

How fetching works, when a price is out of date, and the rules for editing prices are
in the [Investments reference](/reference/investments/#fetching-prices).
