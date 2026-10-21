---
title: Tracking investments
description: Set up your investments in Finzytrack, step by step, and keep them current.
sidebar:
  order: 1
---

This guide takes you from a ledger with no investments to three working investment
dashboards. Follow the steps in order; each one adds detail to what the previous one
gave you. You can stop after any step: everything you have recorded is always
counted correctly, and later steps only add detail.

The details behind each step are in the [Investments reference](/reference/investments/)
and the [Metadata reference](/reference/metadata/). The screens are described in
[Investments view](/views/investments/).

## What you will have at the end

- **Holdings & Performance** — what you put into your holdings, what they are worth,
  gain or loss, returns for all holdings and by asset class, and each holding's
  purchase lots and prices.
- **Cash & Deposits** — every cash and deposit account (checking, savings, CDs),
  with rates, maturities, interest earned and the yield you actually got.
- **Returns & Income** — interest and dividends over time, and realized gains from
  sales.
- **Allocation by Asset Class** on the Financial Overview — your mix of holdings and
  cash.

## Two kinds of investment

Finzytrack treats everything you own as one of two kinds:

- A **holding** is something you own a *number of units* of: shares, ETFs, mutual
  funds, crypto, money-market funds, I-Bonds. Its value is units × price, so it
  needs prices.
- A **cash or deposit account** holds a *balance* in a currency: checking, savings,
  CDs. Its value is the balance.

Some things can be either, depending on how you hold them. A CD or bond bought
through a brokerage, held as units with a price, is a holding. A CD at your bank,
held as a balance, is a deposit account.

Finzytrack never decides anything from account names. You can name your accounts
however you like. What an account or a holding *is* comes from a few metadata
values you set, mostly on one screen.

## Step 1: Set your operating currencies

Open **Settings → General → Operating Currencies** and add the currencies you hold
money in, such as `USD`. Finzytrack then treats those as currencies and everything
else as a holding.

Do this first. Without operating currencies, a commodity like `VOO` counts as a
currency until you give it an asset class, so it is not valued and its prices are not
fetched.

## Step 2: Have the accounts you need

Create these in the [Accounts](/views/accounts/) view if you don't have them:

- An `Assets` account for each brokerage or fund account, such as
  `Assets:Brokerage:Fidelity`. It holds your units, and often some cash as well.
  Leave its **Currencies** empty, so it can hold any security. If you do list
  currencies, list every security it holds too (for example `USD` and `VOO`), and add
  each new security before you record it; otherwise registering fails.
- An `Assets` account for each bank account and deposit, such as
  `Assets:Bank:Savings` or `Assets:Bank:CD-2025`.
- `Income` accounts for dividends and interest, such as `Income:Dividends` and
  `Income:Interest`. To count cash dividends toward each holding's asset class, or
  to match interest that a deposit pays into another account, use one income account
  per holding or deposit (steps 6 and 7 explain why).
- An `Equity` account for opening balances, such as `Equity:Opening-Balances`.

## Step 3: Record what you own today

Open **Investments → Quick Actions → Add Holding**. For each position on your latest
brokerage statement, enter:

- the **holding account** and the **security** (its code, such as `VOO`),
- the **units** you hold and the **average cost per unit** (most statements show it,
  or divide the total cost by the units),
- the **opening-balances account**, the **date** and the **currency**.

Click **Add to review**. When all your positions are in the review table, check them
and click **Register**. Each one becomes a transaction like this:

```beancount
2026-10-01 * "Opening holding VOO"
  Assets:Brokerage:Fidelity   25 VOO {412.30 USD}
  Equity:Opening-Balances  -10307.50 USD
```

This is the quickest start. The cost is recorded as invested on that date, so returns
are measured from the day you started tracking, not from your real purchases.

**If you want returns over your whole history**, record each purchase with **Buy**
instead, using the real dates and prices. You can mix the two: Add Holding for old
positions, Buy for everything from now on.

**I-Bonds** are recorded in face dollars at a cost of 1.00 each: $10,000 of bonds is
`10000 IBOND2022 {1.00 USD}`. In Add Holding, that is 10000 units at an average cost
of 1.00.

## Step 4: Describe your holdings

Open **Investments → Setup & Metadata**. Under **Holdings and currencies**, set for
each holding:

- **Asset class** — `stock`, `etf`, `mutual-fund`, `money-market`, `bond`, `cd`,
  `i-bond` or `crypto`. This gives you allocation and returns by asset class, and
  decides how often prices are fetched. Use `cd` or `bond` only for CDs and bonds you
  hold as units in a brokerage account; a bank CD is set up in step 7.
- **Name** — optional, a readable name next to the code.
- **Price symbol** — only if the price service knows the holding by a different
  symbol than its code. For an Indian mutual fund, click **Find**, search by the
  fund's name, and click **Use** on the scheme that matches your plan (Direct or
  Regular) and option (Growth or IDCW). This fills in `amfi:` and its AMFI scheme
  code, such as `amfi:122639` ([more](/reference/investments/#fetching-prices)).

For an **I-Bond**, also set its **Issue month**; Finzytrack then computes its value
each month. **Face value** is optional.

Click **Save changes**. Leave anything you don't know as **Not set**.

## Step 5: Get prices

Open **Investments → Prices** and click **Update prices**. Finzytrack fetches prices
for your holdings, from your first purchase to today, and shows what happened above
the table.

Then read the table:

- **Daily** or **Monthly** with a recent date — all good.
- **Not fetched** — read the reason. A money-market fund is never fetched; it stays
  at about 1.00 and is valued at its cost. "Counts as cash" means that there are no
  operating currencies (step 1) and this holding has no asset class (step 4).
- **Could not fetch** in the update result — usually the symbol. Set the **Price
  symbol** in Setup & Metadata and update again.

A holding is valued only with prices in the currency you bought it in. The price
service sometimes quotes another currency (for example pence for London shares);
then the holding has a second row, and you add prices by hand in your currency.

For anything the service can't price, open the row and add a price by hand. A holding
with no price is valued at what you paid.

## Step 6: Classify your income accounts

Under **Income accounts**, click **Edit** on each income account and set its
**Income type**: `interest`, `dividend`, or another type for other income. Only
`interest` and `dividend` income appears on the Returns & Income dashboard, and only
`interest` income is matched to the accounts that earned it (step 7).

For a **dividend** account, also set **Dividend from** to the holding it pays for,
such as `VOO`. This lets dividends paid as cash count toward that holding's asset
class in returns. Reinvested dividends don't need it.

Dividends that can't be tied to a holding are shown as **Unattributed Dividends** on
Holdings & Performance. They still count in your income and in the portfolio return,
but not in the returns by asset class.

## Step 7: Describe your cash and deposit accounts

To open a **new** savings account, CD or bond account, use **Investments → Quick
Actions → Open Deposit**: it creates the account with its type, rate and maturity
date, and optionally its own interest income account and the first transfer into it,
in one step. For accounts you already have:

Back in **Setup & Metadata**, under **Cash and deposit accounts**, click **Edit** on
each account and set its **Account type**: `checking`, `savings`, `cd`, `bond` or
`cash`. For a checking, savings, CD or bond account you can also set its **Interest
rate**, and for a CD or bond its **Maturity date**. (In the ledger file the account
type is written as `account-type`.)

The account type also lets Finzytrack find the interest each account earned, from
your `interest` income accounts:

- Interest **added to the account** (compounding), and interest paid **when a CD
  matures**, are matched to the account automatically once it has a type such as
  `savings` or `cd`.
- Interest **paid into a different account** (a CD that pays its interest into your
  savings) can't be traced back to the CD. If it lands in a checking or untagged
  account, it is shown as unattributed. If it lands in another savings, CD or bond
  account, it is counted as that account's interest. Either way, give the CD its own
  interest income account and set the CD's **Interest income account** to it:

  ```beancount
  2025-01-15 open Assets:Bank:CD-2025 USD
    account-type: "cd"
    interest_rate: "4.50%"
    maturity_date: 2026-01-15
    interest_account: "Income:Interest:CD-2025"
  ```

Interest that can't be matched is shown as **Unattributed Interest** on Cash &
Deposits. It still counts as income; only its yield is missing.

## Recording new activity

From now on, record each event with a **Quick Action**:

| When | Use |
|---|---|
| You buy units | **Buy** |
| A dividend buys more units | **Reinvest** |
| A dividend is paid as cash | **Dividend** |
| You sell units | **Sell** — choose which lots to sell (FIFO, LIFO, HIFO, or specific lots) and check the gain before adding it |
| Interest is credited | **Interest** |
| A CD matures | **CD Matures** |
| You open a savings account, CD or bond account | **Open Deposit** (written directly, not staged) |

Finzytrack suggests the income account from your metadata: the dividend account
whose **Dividend from** is that holding, or your only dividend account; for interest,
your only interest account. Every transaction goes to the review table first;
nothing is written until you click **Register**.

**With AI** (once AI is set up in Settings), you can skip the typing. In the
[Import](/views/import/) view, the **AI** tab reads a brokerage statement, and on the
**Manual** tab you can type into **Describe a transaction**, such as *"Bought 10 VOO
at 417.45 on March 14"*, and click **Parse & Add**. AI records buys, sales, dividends,
reinvested dividends, interest and CD maturities; it doesn't record positions you
already hold, so use **Add Holding** for those. A sale read by AI sells the oldest
lots first (FIFO), or LIFO or HIFO if you say so. To sell specific lots, use the
**Sell** form.

## Reading the dashboards

**Holdings & Performance**
- *Invested* is what you paid for what you hold now; *Current Value* uses the latest
  price on or before the **As of** date; *Unrealized Gain* is the difference.
- *Portfolio Return* shows the return on all your holdings together, per currency:
  **XIRR** (your yearly return, taking into account when money went in) next to
  simple gain. Cash and deposit accounts are not included.
- *Returns by Asset Class* shows the same two returns for each asset class.
- Click a holding in the *Holdings* table to see its purchase lots and price history.
- **Update prices** in the header fetches prices without leaving the dashboard. Below
  it: the date of the prices in use, and how many holdings need a newer price.

**Cash & Deposits**
- *Total Cash & Deposits* includes every `Assets` account balance in a currency,
  including cash waiting in a brokerage account.
- The *Accounts* table shows each account's interest earned and **effective yield**:
  the interest divided by the account's average balance, per year.
- *Upcoming Maturities* lists accounts that have a maturity date and still hold a
  balance, soonest first.
- Balances are always today's. The **As of** date changes interest earned and yield.

**Returns & Income**
- Interest and dividends by year and by source.
- *Realized Gain* and the *Sales* table come from your recorded sales, split into
  short and long term (held more than a year). They are not a tax document; use your
  broker's statements for tax.

Each holding is valued in the currency it was bought in. Amounts in different
currencies are shown separately, never added together; use the **Currency** filter
to focus on one.

## If something looks wrong

| You see | Check that |
|---|---|
| A holding is missing from Holdings & Performance | It was recorded at a cost (`{...}`) — Quick Actions do this. It is not an operating currency, and, if you have no operating currencies, it has an asset class. |
| Registering fails with a currency error | The account's **Currencies** are empty, or list the security. |
| Current value equals what you paid | It has a price in the currency you bought it in: run **Update prices**, or add a price in the Prices tab. |
| An I-Bond is worth about $1 | It is recorded in face dollars at 1.00 each (step 3). |
| A holding is "unclassified" in allocation or returns | It has an **Asset class**. |
| An account shows as plain "cash" | It has an **Account type**. |
| Interest is unattributed | The interest income account has **Income type** `interest`, and the earning account has an account type. If the interest is paid into another account, the earning account has its **Interest income account** set. |
| Dividends are unattributed | The dividend income account has **Dividend from** set. |
| Income is missing from Returns & Income | The income account's **Income type** is `interest` or `dividend`. |
| A sale shows no realized gain | It was recorded with a sale price (`@`). The **Sell** form does this. |
| A price is **Out of date** | You ran **Update prices**. If it stays out of date, its price symbol is right. |
| XIRR is blank | Time has passed since the money went in. XIRR is blank when all of it went in on the **As of** date, for example holdings added today. |

## A routine that keeps it current

When a statement arrives, record its activity (or import it with AI), register it,
and click **Update prices**. Now and then, open **Setup & Metadata** with **Show
only items not set** on, to describe anything new.

## A complete example

A small ledger with every step done:

```beancount
option "operating_currency" "USD"

2015-12-31 commodity VOO
  name: "Vanguard S&P 500 ETF"
  asset-class: "etf"

2015-12-31 open Assets:Brokerage
2021-03-14 * "Buy VOO"
  Assets:Brokerage   10 VOO {417.45 USD}
  Assets:Brokerage  -4174.50 USD

2019-04-22 open Assets:Savings USD
  account-type: "savings"
  interest_rate: "3.75%"

2023-01-14 open Assets:Deposits:CD1 USD
  account-type: "cd"
  interest_rate: "4.50%"
  maturity_date: 2025-01-14
  interest_account: "Income:Interest:CD1"

2015-12-31 open Income:Dividends:VOO USD
  income-type: "dividend"
  dividend_of: "VOO"
2023-01-14 open Income:Interest:CD1 USD
  income-type: "interest"
2019-04-22 open Income:Interest:Savings USD
  income-type: "interest"
```
