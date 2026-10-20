---
title: Metadata
description: Every metadata key Finzytrack reads or writes — where it goes, its values, and what uses it.
sidebar:
  order: 6
---

Beancount lets you attach `key: value` metadata to a directive. Finzytrack reads a
fixed set of keys, and writes a few of its own on transactions. This page lists them
all, by where they go.

## General rules

- **Every key is optional.** Nothing breaks without metadata; it only adds detail.
- **Recognized, never required or checked.** Finzytrack never rejects a key or value.
  An unrecognized value is kept and simply has no effect.
- **Your own keys are kept.** You can add any other metadata; Finzytrack keeps it when
  it rewrites the file.
- **Where a key goes matters.** A key on the wrong directive (for example
  `income-type` on a `commodity`) is not found.
- **Write values in lowercase, as listed.** Most values are matched in any case, but
  some charts group by the exact text, so `Savings` and `savings` would show apart.
  The [Setup & Metadata tab](/views/investments/#setup--metadata) writes them this way.
- **Key names** start with a lowercase letter and use letters, digits, `-` and `_`
  (Beancount's rule). `filename` and `lineno` are reserved by Beancount.
- **Values** are strings in quotes, except dates, which are written unquoted
  (`maturity_date: 2027-01-14`).

The `operating_currency` option is not metadata, but it decides which commodities are
currencies; see [Commodities and Currencies](/reference/commodities-and-currencies/).

## On a `commodity`

```beancount
2015-12-31 commodity VOO
  name: "Vanguard S&P 500 ETF"
  asset-class: "etf"
  fetch_symbol: "VOO"
```

| Key | Values | Used for |
|---|---|---|
| `asset-class` | `stock`, `etf`, `mutual-fund`, `money-market`, `bond`, `cd`, `i-bond`, `crypto`, `cash`, `currency` | Grouping in allocation and returns by asset class (untagged: `unclassified`). `cd` and `bond` here mean CDs and bonds held as priced units (for example in a brokerage); a CD held as a balance is an account with `account-type: "cd"`. How often prices are fetched ([table](/reference/investments/#fetching-prices)). With no `operating_currency`, `cash` and `currency` make the commodity a currency, and an untagged commodity is also a currency. |
| `name` | Text | A readable name shown next to the code. |
| `fetch_symbol` | A ticker, e.g. `"BRK-B"` | The symbol requested when fetching prices, when it differs from the code. |
| `issue_date` | `MM/YYYY`, `YYYY-MM` or `YYYY-MM-DD` | I-Bonds (`asset-class: "i-bond"`): the issue month. Needed to compute the bond's value, per face dollar (record I-Bonds as face dollars at a cost of 1.00 each). |
| `denomination` | A whole number, e.g. `"10000"` | I-Bonds: the face value. Optional; it only affects rounding (1000 if not set). |

## On an `Assets` account's `open`

These describe a cash or deposit account: one that holds a balance in a currency.

```beancount
2023-01-14 open Assets:Deposits:ValleyCU-CD1 USD
  account-type: "cd"
  interest_rate: "4.50%"
  maturity_date: 2025-01-14
```

| Key | Values | Used for |
|---|---|---|
| `account-type` | `checking`, `savings`, `cd`, `bond`, `cash` | The account's type in Cash & Deposits and in allocation (untagged: `cash`). An account with any type other than `checking`, `cash` or `currency` earns interest: interest added to it, or paid when it matures, is counted as its interest. |
| `interest_rate` | Text, e.g. `"4.50%"` | Shown as the stated rate in Cash & Deposits, beside the yield actually earned. (A checking account shows its rate, but its interest is not matched to it, so it has no yield.) |
| `maturity_date` | A date, e.g. `2025-01-14` | The maturity date in Cash & Deposits, and the Upcoming Maturities list. |
| `interest_account` | An income account name | Links interest paid out to another account back to this one. See [Attributing interest](/reference/investments/#attributing-interest-to-the-account-that-earned-it). |

The Setup & Metadata tab offers `interest_rate` for `checking`, `savings`, `cd` and
`bond` accounts, `maturity_date` for `cd` and `bond` accounts, and `interest_account`
for `savings`, `cd` and `bond` accounts.

`account-type` is a different key from the commodity's `asset-class`: an account
holds a balance, a commodity is a security. Some values look alike (`cash`, `cd`,
`bond`) but mean different things — `asset-class: "cash"` on a commodity can make it a
currency, while `account-type: "cash"` only labels an account.

## On an `Income` account's `open`

```beancount
2015-12-31 open Income:Dividends:VOO USD
  income-type: "dividend"
  dividend_of: "VOO"
```

| Key | Values | Used for |
|---|---|---|
| `income-type` | `interest`, `dividend`, `capital-gains`, `rental`, `royalty`, `business`, `salary`, `other` | Which income counts as interest or dividends. Only `interest` and `dividend` income appears on the Returns & Income dashboard, and only `interest` is matched to the accounts that earned it. The other values describe the account but don't change any figure. |
| `dividend_of` | A commodity code, e.g. `"VOO"` | The holding a cash dividend comes from, so it counts toward that holding's asset class in returns. |

## On any account's `open`

Written by the account form in the Accounts view.

| Key | Values | Used for |
|---|---|---|
| `description` | Text | The account's description. |
| `account_number` | Text | Shown in the account's details. |
| `ifsc_code` | Text | Shown in the account's details. |
| `swift_bic` | Text | Shown in the account's details. |

## On a transaction

Finzytrack writes these keys. You don't need to add them by hand.

| Key | Written when | Used for |
|---|---|---|
| `id` | A transaction is created in Finzytrack | A permanent identifier, so the transaction can be found again after the file changes. Transactions without one get an identifier computed when the ledger is read. |
| `content_hash` | A transaction is created | A fingerprint of its date, payee, amount, account and narration. |
| `source_account` | A transaction is created | The `Assets` or `Liabilities` account it came from. |
| `external_id` | An import provides a reference | The bank's or broker's transaction reference. A new transaction with the same reference and amount is flagged as a duplicate. |
| `external_id_type` | Together with `external_id` | Where the reference came from, e.g. `OFX` or `UPI`. For information only; duplicates match on `external_id` and amount, whatever the type. |
| `memo` | An imported row has a memo | The statement's memo text. |
| `note` | An investment entry carries a note | Free text. The Quick Action forms and AI entry don't set it today. |
| `document`, `document2`, … | You attach documents | The attached files' paths, in order. See [Documents](/reference/documents/). |

An older key, `ofx_id`, is still read as an `external_id` of type `OFX`.
