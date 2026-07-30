---
title: Currencies and investment holdings
description: v0.2.1 tells currencies apart from investment holdings in totals and pickers. If your ledger holds stocks or funds, set your operating currencies to keep reports clean.
sidebar:
  order: 3
---

*Introduced in Finzytrack v0.2.1.*

Finzytrack now distinguishes **currencies** (like `USD`, `INR`) from **investment holdings** (commodities such as `VOO` or `VTI` — stocks and funds you hold a quantity of). Before this release both were treated the same, so a ledger containing investments could show share counts stacked next to money in the KPI cards, and list those holdings in currency dropdowns.

## What you'll see

- KPI totals (Net Worth, Total Assets, and similar) and currency pickers now show **currencies only**.
- Transaction and account views are unchanged — they still show holding quantities, which is what you want there.
- If Finzytrack refreshes your demo dashboards, that's the usual [demo-content refresh](/upgrade-notes/seed-content/); your customized dashboards are never overwritten.

## What to do — only if you hold investments

Tell Finzytrack which commodities are your currencies:

1. Open **Settings → General → Operating Currencies**.
2. Add each currency you track balances in (e.g. `USD`, `INR`) and click **Save**.

Finzytrack writes this to your ledger and immediately treats everything else — your stocks and funds — as holdings, so they drop out of money totals and currency pickers.

If you don't set operating currencies, nothing breaks: Finzytrack treats every commodity as a currency, exactly as before. Note that investment holdings are not yet included in money totals at market value — totals reflect your currency balances. For the full model, see [Commodities and Currencies](/reference/commodities-and-currencies/).
