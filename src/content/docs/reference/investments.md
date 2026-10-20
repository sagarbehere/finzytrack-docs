---
title: Investments
description: How Finzytrack tracks investment instruments, the metadata you can add to your ledger, and what each investment dashboard needs to show its numbers.
sidebar:
  order: 6
---

This is the page to read **before** the investment dashboards. The dashboards are
a faithful picture of your ledger — no more, no less. A few small additions to
your ledger unlock a lot of that picture, and this page explains exactly what to
add and why.

The good news: **nothing is hidden if you add nothing.** Your balances and totals
are always correct. The metadata described here only adds *richer* detail — types,
rates, yields, allocation. You can adopt it gradually, one account at a time.

## How Finzytrack thinks about investments

Finzytrack never tries to answer the subjective question *"is this an
investment?"* — reasonable people disagree about whether a savings account or a
checking account that pays interest counts. Instead it presents **facts by type**:
here are your holdings, here are your cash and deposit accounts, here is the income
they produced.

It also **never guesses from account names.** An account called
`Assets:Investments:Brokerage` gets no special treatment, and an account called
`Income:Interest:MyBank` is not assumed to be interest. You are free to name your
accounts however you like. Classification comes from **metadata** you add, or from
the **structure** of your transactions — never from a name.

Every investment fits one of two shapes:

- **Holdings** — things you own a *quantity* of, priced per unit. Their value is
  `quantity × price`. Examples: ETFs, mutual funds, individual stocks, crypto,
  money-market funds, I-Bonds.
- **Cash & deposit accounts** — a *balance* held in a currency. Their value is the
  balance itself. Examples: checking, savings/HYSA, certificates of deposit (CDs),
  cash-modelled bonds.

Which commodities count as holdings versus currencies is decided by your
operating-currency list, described in
[Commodities and Currencies](/reference/commodities-and-currencies/). That page is
Layer 1; this page builds on it.

## The metadata, at a glance

Beancount lets you attach free-form metadata to `commodity` and `open` directives.
Finzytrack reads a small, standard set. **Where you put a key matters** — a key in
the wrong place is simply not found.

| Where it goes | Keys | Describes |
|---|---|---|
| On the `commodity` | `asset-class`, `name`, `fetch_symbol`, `issue_date`, `denomination` | The security itself |
| On an asset account `open` | `asset-class`, `interest_rate`, `maturity_date`, `compounding`, `interest_account`, `institution`, `registration` | One held position |
| On an income account `open` | `income-type`, `dividend_of` | The kind of income, and which security a dividend account pays for |

Each is covered below. Every key is optional.

## Holdings — securities you own a quantity of

A holding is any commodity that is **not** one of your operating currencies. You
record it in the usual Beancount way, buying at a cost:

```beancount
2015-12-31 commodity VOO
  name: "Vanguard S&P 500 ETF"
  asset-class: "etf"
  fetch_symbol: "VOO"

2021-03-14 * "Buy ETF"
  Assets:Brokerage       10 VOO {417.45 USD}
  Assets:Brokerage:Cash  -4174.50 USD
```

On the **`commodity`** directive you can add:

- **`asset-class`** — what kind of security it is. Use one of `stock`, `etf`,
  `mutual-fund`, `money-market`, `bond`, `cd`, `i-bond`, `crypto`. This is the
  grouping key for allocation charts. (The values `cash` and `currency` mark a
  commodity as money rather than a holding.)
- **`name`** — a readable name, such as `"Vanguard S&P 500 ETF"`, shown in place
  of the bare code.
- **`fetch_symbol`** — the ticker to request when fetching prices, **only if it
  differs from the commodity code.** For `VOO` the code already is the ticker, so
  this is optional; it earns its place for codes that do not match their ticker.

### Prices give holdings a market value

A holding shows a market value only when Finzytrack has a **price** for it. A
holding with no price is valued at its cost.

Prices live in a **price file** next to your ledger: for `one.beancount` it is
`one.prices.beancount`. Your ledger does not `include` it, so other Beancount tools
don't see these prices. `price` directives written in your ledger file also count.

You see and change prices in **Investments → Prices**: one row per holding and
quote currency, with how it is fetched, its latest price, and how old that price is.
Open a row to see its history.

Two special cases need no fetching:

- **Money-market funds** (`asset-class: "money-market"`) hold a price of about
  `1.00`. Their growth comes from reinvested income you already book, not from
  price movement, so Finzytrack values them at their unit count and never fetches
  them.
- **I-Bonds** (`asset-class: "i-bond"`) accrue by a formula. Give the commodity an
  **`issue_date`** and a **`denomination`** (its face value), and Finzytrack
  computes the accrued value for you:

  ```beancount
  2022-05-01 commodity IBOND202205
    name: "Series I Savings Bond — May 2022"
    asset-class: "i-bond"
    issue_date: "2022-05"
    denomination: "10000"
  ```

### Fetching prices

**Update prices** (on the Prices tab, or on the Holdings & Performance dashboard)
fetches prices from Yahoo Finance. It fetches each holding by its `fetch_symbol`, or
by its code when `fetch_symbol` is not set. How often a holding gets a price depends
on its `asset-class`:

| `asset-class` | Prices |
|---|---|
| `stock`, `etf`, `mutual-fund`, `crypto`, or not set | One per trading day |
| `bond`, `cd` | One per month |
| `i-bond` | Computed, one per month (see above) |
| `money-market`, `cash`, `currency` | Not fetched |

- **What is fetched:** holdings only, never currencies. With no `operating_currency`
  in your ledger, a commodity without an `asset-class` counts as cash, so it is not
  fetched. Give it an asset class to fetch it.
- **Which days:** the first fetch covers the time since your first purchase. After
  that, each fetch starts at the newest stored price, replaces it with the new value,
  and adds the days since. For a holding you have sold, fetching stops at the last
  transaction. Days before the newest price are never fetched again, so deleting an
  older price leaves a gap.
- **Which currency:** a holding is fetched in the currency you bought it in. A price
  you enter in another currency is kept, but never fetched or replaced.
- **Rounding:** fetched prices are rounded to 4 decimal places (more for very small
  prices).
- A fetch never changes a price in your ledger file.

A held holding's latest price is **out of date** when it is more than 7 days old
(daily prices) or more than 45 days old (monthly and I-Bond prices), or when there is
no price at all. Sold holdings and holdings that are not fetched are never out of
date.

### Entering and changing prices

On the Prices tab you can add a price, and change or delete any price in the price
file, including fetched ones.

- A price is one number per holding, quote currency and date. Changing a price's
  date moves it; if the new date already has a price, you are asked before it is
  replaced.
- Prices in your ledger file are listed as **In ledger file** and can't be changed
  on the tab. Change them in the ledger file. A price on the same date as one in the
  ledger file is not accepted.
- A price can't be dated after today.
- The next fetch replaces the newest price of a fetched holding, even a price you
  entered by hand.
- Every save rewrites the price file. Your edits to it are kept; comments are not.
  If the file has lines Finzytrack can't read, it is not rewritten until you fix them.

## Cash & deposit accounts

A cash or deposit account holds a balance in a currency, so its **type cannot come
from the commodity** — the currency is shared across many accounts. Instead the
type goes on the account's **`open`** directive:

```beancount
2019-04-22 open Assets:Savings:HighYield USD
  asset-class: "savings"
  interest_rate: "4.50%"
  institution: "Ally"

2023-01-14 open Assets:Deposits:ValleyCU-CD1 USD
  asset-class: "cd"
  interest_rate: "4.50%"
  maturity_date: 2025-01-14
  compounding: "monthly"
```

Account-level keys:

- **`asset-class`** — the account type: `checking`, `savings`, `cd`, `bond`, or
  `cash`. This routes the account to the right group. An untagged account simply
  shows as plain cash.
- **`interest_rate`** — the stated rate, shown next to the *realized* yield so you
  can compare what was promised with what you earned.
- **`maturity_date`** — for term instruments (CDs, bonds); drives the maturity
  view and the maturity column.
- **`compounding`** — how often interest is added (e.g. `"monthly"`), for your
  reference.
- **`interest_account`** — links this account to its interest income (explained
  in the next section).
- **`institution`**, **`registration`** — grouping and display labels.

## Income: interest, dividends, and how they are classified

Interest and dividends look identical in a ledger — both are an `Income` posting
paired with cash. Nothing in the transaction itself says which is which, so
Finzytrack reads the **kind of income from metadata** on the income account's
`open`:

```beancount
2020-01-01 open Income:Interest:TermDeposits USD,INR
  income-type: "interest"

2015-12-31 open Income:Dividends:VOO USD
  income-type: "dividend"
```

The **`income-type`** key accepts: `interest`, `dividend`, `capital-gains`,
`rental`, `royalty`, `business`, `salary`, `other`. The investment dashboards use
`interest` and `dividend` today; the others let you classify the rest of your
income consistently.

You tag the **account**, not each transaction — one line covers all of that
account's history, past and future.

:::note
If you do not tag an income account, its income still appears in the "income by
source" list (your account name is the label). What tagging adds is the
interest-versus-dividend split and the per-account interest yield described next.
:::

### Attributing interest to the account that earned it

For a per-account **interest earned** figure and an **effective yield**, Finzytrack
needs to know which account produced each interest payment. It works this out in
order:

1. **Interest added back to the account (compounding).** If the interest is
   credited to the deposit account itself, that account is obviously the earner.
   No extra metadata is needed.
2. **Interest at maturity.** If a term deposit closes and pays out its principal
   plus interest, the deposit being drawn down is the earner. Again, no metadata
   needed.
3. **Interest paid out to another account.** If a CD pays its interest into your
   savings account, the transaction contains no reference to the CD — so nothing
   structural can recover the earner. This is the one case that needs a link. Put
   an **`interest_account`** on the earning deposit, pointing at its own income
   account:

   ```beancount
   2022-01-03 open Assets:Deposits:AxisBank-FD USD
     asset-class: "cd"
     interest_rate: "5.25%"
     interest_account: "Income:Interest:AxisBank-FD"

   2022-01-03 open Income:Interest:AxisBank-FD USD
     income-type: "interest"
   ```

   For this to work, give each such deposit its **own** interest income account —
   a shared account cannot tell two paid-out deposits apart.

Interest that cannot be tied to a single account is **never guessed onto the wrong
account.** It is shown as **unattributed interest** on the Cash & Deposits dashboard
— a headline figure plus an "Unattributed Interest by Account" list, grouped by the
income account that recorded it. Click an account in that list to see its
transactions. The interest still counts in your income totals; it simply has no
per-account yield. A large figure there is your cue to add an `interest_account`
link to the earning instrument.

**Effective yield** is the interest you actually earned divided by the account's
average balance over the period, expressed as an annual rate. It is shown beside
the stated `interest_rate` so you can see promised against delivered.

### Attributing dividends to the holding that paid them

The returns view groups performance by asset class, so each dividend needs to be tied
to the holding that paid it. How that happens depends on how the dividend is paid:

- **Reinvested dividends** buy more units of the holding, so the transaction already
  names the security — it is attributed automatically, no metadata needed.
- **Cash dividends** are paid into a cash account and leave the holding untouched, so
  the transaction contains no reference to the security. To attribute these, add a
  **`dividend_of`** key to the dividend income account, naming the commodity it pays
  for:

  ```beancount
  2015-12-31 open Income:Dividends:VOO USD
    income-type: "dividend"
    dividend_of: "VOO"
  ```

  Give each such holding its **own** dividend income account so the link is
  unambiguous.

A cash dividend with no `dividend_of` link is shown as **unattributed dividends** on
the Holdings & Performance dashboard — a headline figure plus an "Unattributed
Dividends by Account" list, grouped by the income account that recorded it. Click an
account in that list to see its transactions. The dividend still counts in your income
and in your overall portfolio return; it is only left out of the per-asset-class
return. A large figure there is your cue to add a `dividend_of` link.

## Realized gains need no metadata

When you sell a holding, Finzytrack derives the realized gain **structurally** from
the sale — the difference between the price you sold at and the cost you bought at,
both already in the posting. You do not tag anything. Record the sale in the normal
Beancount way, with the cost and the sale price:

```beancount
2024-03-01 * "Sell ETF"
  Assets:Brokerage        -5 VOO {417.45 USD} @ 560.00 USD
  Assets:Brokerage:Cash    2800.00 USD
  Income:CapitalGains:VOO  -712.75 USD
```

The holding period (from the lot's purchase date to the sale) determines the
short- versus long-term split.

:::caution
The realized-gains view is derived from your ledger and is **not a tax document.**
It applies no wash-sale rules and no broker lot-selection method, so it can differ
from your 1099-B. For tax, use your broker's official statements.
:::

## What each dashboard needs

Use this as a checklist. The left column is what you want to see; the right column
is what to add.

| To see this | Add this to your ledger |
|---|---|
| Holdings with market value and unrealized gain | Buy at cost (`{...}`); let Finzytrack fetch prices, or enter them by hand |
| Allocation by asset class | `asset-class` on your commodities and cash accounts |
| Cash accounts grouped by type, with rate and maturity | Account-level `asset-class`, plus `interest_rate` and `maturity_date` |
| Interest earned and effective yield per account | `income-type: "interest"` on the interest income account; `interest_account` for paid-out interest |
| The interest-versus-dividend income split | `income-type` on your income accounts |
| Cash dividends grouped by asset class in returns | `dividend_of: "<SYMBOL>"` on each cash-dividend income account |
| Realized capital gains, short vs long term | Nothing — just record sales with their cost and sale price |
| An I-Bond's accrued value | `asset-class: "i-bond"`, `issue_date`, and `denomination` on the commodity |

## A worked example

A small but fully tagged ledger. Everything below the balances is optional — it is
what turns correct numbers into a rich picture.

```beancount
option "operating_currency" "USD"

; --- Securities ---
2015-12-31 commodity VOO
  name: "Vanguard S&P 500 ETF"
  asset-class: "etf"

; --- A brokerage holding ---
2015-12-31 open Assets:Brokerage USD,VOO
2021-03-14 * "Buy ETF"
  Assets:Brokerage   10 VOO {417.45 USD}
  Assets:Brokerage  -4174.50 USD

; --- A CD that pays interest into savings ---
2023-01-14 open Assets:Deposits:CD1 USD
  asset-class: "cd"
  interest_rate: "4.50%"
  maturity_date: 2025-01-14
  interest_account: "Income:Interest:CD1"

2019-04-22 open Assets:Savings USD
  asset-class: "savings"
  interest_rate: "3.75%"

; --- Income accounts, classified by kind ---
2015-12-31 open Income:Dividends:VOO USD
  income-type: "dividend"
  dividend_of: "VOO"
2023-01-14 open Income:Interest:CD1 USD
  income-type: "interest"
2019-04-22 open Income:Interest:Savings USD
  income-type: "interest"
```

## Adopting it gradually

You do not need to do any of this at once. A sensible order:

1. Add **`asset-class`** to your commodities and cash accounts — this powers
   allocation and the type-based grouping.
2. Add **`income-type`** to your interest and dividend income accounts — this
   powers the income split and per-account interest.
3. Add **`interest_rate`** and **`maturity_date`** to CDs and savings for the rate
   and maturity detail.
4. Add **`interest_account`** links only where interest is paid *out* to a
   separate account and you want its yield, and **`dividend_of`** links only where
   dividends are paid out as cash and you want them grouped by asset class in
   returns.

At every step, everything you have not tagged still shows — just with less detail.

## Related pages

- [Commodities and Currencies](/reference/commodities-and-currencies/) — how
  Finzytrack decides what is a currency and what is a holding.
- [Dashboards](/views/dashboards/) — using the dashboards these settings feed.
- [Account Hierarchy Design](/reference/account-hierarchy/) — naming and
  structuring your accounts.
