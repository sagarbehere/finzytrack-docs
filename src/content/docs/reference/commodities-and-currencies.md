---
title: Commodities and Currencies
description: How Finzytrack distinguishes currencies from investment holdings, and how the operating-currency list controls totals and currency pickers.
sidebar:
  order: 6
---

Finzytrack uses Beancount ledgers, where every amount is denominated in a
**commodity** — a code such as `USD`, `INR`, `VOO`, or `VUSXX`. A commodity can
be a **currency** (money you total and report in) or a **holding** (a security
you own a quantity of, such as a stock or fund).

The distinction matters on screens that add amounts together or offer a currency
to choose. Adding "84.75 VOO" to a dollar total is meaningless, and a currency
picker should not list a share code. Finzytrack keeps currencies and holdings
apart using the **operating-currency** list.

## Operating currencies

Your operating currencies are the commodities you track balances and net worth
in. Finzytrack treats every commodity on this list as a currency, and every
other commodity as a holding.

The list is stored in your ledger as `operating_currency` options, for example:

```beancount
option "operating_currency" "USD"
option "operating_currency" "INR"
```

This is the single source of truth. Finzytrack reads it from the ledger and
never keeps a separate copy.

### Setting your operating currencies

Open **Settings → General → Operating Currencies**. Add a currency code, or
remove one, then **Save**. Finzytrack writes the change back to your ledger.

The setup wizard also records your chosen currency as an operating currency when
it creates a new ledger.

## How Finzytrack decides what is a currency

For each commodity, Finzytrack resolves a currency/holding role in this order:

1. **If your ledger lists operating currencies**, a commodity is a currency when
   its code is on that list, and a holding otherwise. The list is the complete
   whitelist.
2. **Otherwise, if the commodity declares an asset-class**, it is a currency
   when that class is `cash` or `currency`, and a holding otherwise.
3. **Otherwise**, the commodity is treated as a currency.

The third rule means a brand-new ledger with no operating currencies shows every
commodity as a currency — nothing is hidden. Once you set your operating
currencies, the whitelist takes over.

## What changes when a commodity is a holding

- **Totals** such as Net Worth, Total Assets, and Total Liabilities include only
  currencies. Holdings are excluded from these figures.
- **Currency pickers** in dashboards and forms list only currencies.
- **Transaction and account views** are unaffected: they continue to show
  holding quantities (for example, your `VOO` purchases), because those views
  report amounts as recorded, not as combined totals.

## Asset class

You can label a commodity with an `asset-class` metadata value on its
`commodity` directive:

```beancount
1970-01-01 commodity VOO
  name: "Vanguard S&P 500 ETF"
  asset-class: "etf"
```

Finzytrack recognises these values: `cash`, `currency`, `stock`, `etf`,
`mutual-fund`, `bond`, `cd`, `crypto`. Only `cash` and `currency` mark a
commodity as a currency, and only when no operating currencies are set. Asset
class is optional.
