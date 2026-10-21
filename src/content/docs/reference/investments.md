---
title: Investments
description: How Finzytrack models investments — holdings and currencies, prices, interest and dividend attribution, and realized gains.
sidebar:
  order: 6
---

This page describes how Finzytrack models investments: which commodities are
holdings, how prices are fetched and stored, how interest and dividends are matched
to what earned them, and how realized gains are found. To get started, read the
[Tracking investments guide](/guides/investments/). Every metadata key is listed in
[Metadata](/reference/metadata/).

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
  bonds recorded as a cash balance.

Whether a commodity is a holding or a currency follows one rule
([Commodities and Currencies](/reference/commodities-and-currencies/) has the details):

- With `operating_currency` set in your ledger, every commodity in that list is a
  currency, and every other commodity is a holding.
- Without it, a commodity is a holding only if its `asset-class` is set to something
  other than `cash` or `currency`. An untagged commodity counts as a currency, so
  it is not valued as a holding and its prices are not fetched.

## Holdings — securities you own a quantity of

A holding is a commodity that is not a currency (see above). Record it in the usual
Beancount way, buying **at a cost** (`{...}`). A holding posted without a cost is not
valued, and doesn't appear on the investment dashboards.

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
  price movement, so Finzytrack never fetches them. Without a price they are valued
  at what you paid, which at a cost of 1.00 equals their unit count.
- **I-Bonds** (`asset-class: "i-bond"`) accrue by a formula. Record them in **face
  dollars at a cost of 1.00 each** — $10,000 of bonds is `10000 IBOND202205
  {1.00 USD}` — and give the commodity an **`issue_date`**. Finzytrack then computes
  the value of one face dollar each month, in USD. The `denomination` (face value)
  is optional; it only affects rounding:

  ```beancount
  2022-05-01 commodity IBOND202205
    name: "Series I Savings Bond — May 2022"
    asset-class: "i-bond"
    issue_date: "2022-05"
    denomination: "10000"
  ```

### Fetching prices

**Update prices** (on the Prices tab, or on the Holdings & Performance and Financial Overview dashboards)
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
  and adds the days since. For monthly prices, a newer price in a month also removes
  any earlier price in that month, including one entered by hand. For a holding you have sold, fetching stops at the last
  transaction. Days before the newest price are never fetched again, so deleting an
  older price leaves a gap.
- **Which currency:** prices are stored in the currency the price service quotes. A
  holding is valued only with prices in the currency you bought it in, and its fetch
  dates follow its prices in that currency. If the service quotes a different
  currency (for example pence for London shares), the holding stays at cost; add its
  prices by hand in your currency. A price you enter in another currency is kept but
  never fetched or replaced.
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
  account-type: "savings"
  interest_rate: "4.50%"

2023-01-14 open Assets:Deposits:ValleyCU-CD1 USD
  account-type: "cd"
  interest_rate: "4.50%"
  maturity_date: 2025-01-14
```

Account-level keys:

- **`account-type`** — the account type: `checking`, `savings`, `cd`, `bond`, or
  `cash`. This routes the account to the right group. An untagged account shows as
  plain cash, and interest it earns is not matched to it (see below).
- **`interest_rate`** — the stated rate, shown next to the *realized* yield so you
  can compare what was promised with what you earned.
- **`maturity_date`** — for term instruments (CDs, bonds); drives the maturity
  view and the maturity column.
- **`interest_account`** — links this account to its interest income (explained
  in the next section).

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
Income from an account without `income-type: "interest"` or `"dividend"` does not
appear on the Returns & Income dashboard. It still counts everywhere else, such as
in your income totals on other dashboards.
:::

### Attributing interest to the account that earned it

For a per-account **interest earned** figure and an **effective yield**, Finzytrack
needs to know which account produced each interest payment. It works this out in
order:

1. **Interest added back to the account (compounding).** If the interest is
   credited to the deposit account itself, that account is the earner.
2. **Interest at maturity.** If a term deposit closes and pays out its principal
   plus interest, the deposit being drawn down is the earner.

   Both cases need only the deposit's account type: an `account-type` other than
   `checking` or `cash`, such as `savings`, `cd` or `bond`. Interest on a checking
   account, or on an untagged account, is not matched to it.
3. **Interest paid out to another account.** If a CD pays its interest into another
   account, the transaction contains no reference to the CD, so the CD can't be
   found from it. Without a link, the interest goes to the receiving account if that
   account has a type other than `checking` or `cash` (it counts as that account's
   interest), and is unattributed otherwise. To tie it to the CD, put an
   **`interest_account`** on the earning deposit, pointing at its own income
   account:

   ```beancount
   2022-01-03 open Assets:Deposits:AxisBank-FD USD
     account-type: "cd"
     interest_rate: "5.25%"
     interest_account: "Income:Interest:AxisBank-FD"

   2022-01-03 open Income:Interest:AxisBank-FD USD
     income-type: "interest"
   ```

   For this to work, give each such deposit its **own** interest income account —
   a shared account cannot tell two paid-out deposits apart.

Only interest booked to an income account with `income-type: "interest"` is matched
at all. Interest that cannot be tied to a single account is shown as **unattributed
interest** on the Cash & Deposits dashboard
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
and in the portfolio return; it is left out of the returns by asset class. A large figure there is your cue to add a `dividend_of` link.

## Returns

Holdings & Performance shows two returns, for all your holdings together (the
**Portfolio Return** table, one row per currency) and for each asset class (the
**Returns by Asset Class** table):

- **Simple gain** — market value minus cost basis, and that as a percentage.
- **XIRR** — the money-weighted yearly return, which takes into account when money
  went in and came out. Its cash flows are:
  - money in: a buy's cash payment, and a holding added at cost against an `Equity`
    account (Add Holding), on its date;
  - money out: a sale's proceeds and a cash dividend;
  - a reinvested dividend has no cash flow;
  - the market value on the **As of** date, as the final amount.

  A holding added with Add Holding counts as bought on that date at its average
  cost, so its XIRR is the return since you started tracking it.

The portfolio return covers holdings only — every commodity that is not a currency,
including money-market funds and I-Bonds — the same holdings as the *Invested* and
*Current Value* figures. Cash and deposit accounts, and cash waiting in a brokerage
account, are not part of it. It counts every cash dividend from an `income-type:
"dividend"` account.

For an asset class, a transaction counts toward the class of the holding it touches.
A cash dividend counts toward a class only through its income account's
`dividend_of`; otherwise it counts only toward the portfolio return. XIRR is blank when it
can't be computed: flows that all go one way, or no solution — for example when all
the money went in on the **As of** date.

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

A sale counts as realized when a posting reduces a holding and carries both the lot's
cost (`{...}`) and the sale price (`@`). The gain is the units sold times the
difference between the two. A sale recorded without the `@` price is not counted, and
a fee booked to an expense account does not reduce the gain.

The holding period (from the lot's purchase date to the sale) determines the
short- versus long-term split: more than 365 days is long term.

:::caution
The realized-gains view is derived from your ledger and is **not a tax document.**
It applies no wash-sale rules and no broker lot-selection method, so it can differ
from your 1099-B. For tax, use your broker's official statements.
:::

## Related pages

- [Tracking investments](/guides/investments/) — the guide: setting up and keeping
  your investments current.
- [Metadata](/reference/metadata/) — every key, its values, and what uses it.
- [Investments view](/views/investments/) — the Quick Actions, Setup & Metadata and
  Prices tabs.
- [Commodities and Currencies](/reference/commodities-and-currencies/) — how
  Finzytrack decides what is a currency and what is a holding.
- [Dashboards](/views/dashboards/) — using the dashboards these settings feed.
- [Account Hierarchy Design](/reference/account-hierarchy/) — naming and
  structuring your accounts.
