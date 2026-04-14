---
title: FAQ
description: Frequently asked questions about Finzytrack.
---

:::note
This page is under construction.
:::

## General

### Is all my financial data really stored in a single plain-text file?

Yes. Everything — your accounts, transactions, balance assertions, and metadata — lives in a single [Beancount](https://beancount.github.io/) ledger file. With Finzytrack, you own your data and there is no lock-in. We want your data to be portable so it can be used with other open-source tools from the [plain-text accounting](https://plaintextaccounting.org/) community. Even without any tools, just casually glancing at the ledger file in a text editor will give you a pretty good idea of what information is stored in there and how it all works.

### What is Beancount?

[Beancount](https://beancount.github.io/) is a double-entry bookkeeping system that uses plain-text files. Finzytrack provides a modern UI on top of Beancount, so you get the power of plain-text accounting with a visual interface.

### Do I need to know Beancount to use Finzytrack?

No. Finzytrack handles the Beancount details for you. However, familiarity with double-entry bookkeeping concepts (accounts, transactions, postings) will help you get the most out of the app.

### Can I edit the ledger file directly in a text editor while the app is running?

No. Finzytrack caches the ledger in memory and writes it back as a whole file on every change. If you edit the ledger file externally while the app is running, your edits will be silently overwritten the next time the app writes to the file.

If you want to edit the raw ledger directly, close Finzytrack first, make your changes in a text editor, and then restart the app. Finzytrack will load the updated file on startup.

---

## Transactions

### How do I log an international transfer where currencies differ?

When you transfer money between accounts in different currencies — for example, sending USD from a US bank and receiving INR in an Indian bank — use the `@@` (total price) annotation on the receiving posting.

You know two things: the amount that left your sending account and the amount that arrived in your receiving account. Put `@@` on the receiving side to tell Beancount what the total price was in the sending currency. Beancount will derive the per-unit exchange rate automatically.

Example: You sent $1,000 USD from Bank of America and received ₹83,000 INR in your NRE account.

```beancount
2026-04-08 * "Transfer USD to NRE account"
  Assets:US:BankOfAmerica:Checking  -1000.00 USD
  Assets:India:NRE:Savings           83000.00 INR @@ 1000.00 USD
```

If the send and receive happen on different dates, use an intermediary account to split it into two transactions:

```beancount
2026-04-01 * "Send transfer to India"
  Assets:US:BankOfAmerica:Checking  -1000.00 USD
  Assets:Transfer                    1000.00 USD

2026-04-03 * "Transfer received in NRE"
  Assets:Transfer                   -1000.00 USD
  Assets:India:NRE:Savings           83000.00 INR @@ 1000.00 USD
```

The `@@` means "total price" — the entire 83,000 INR cost 1,000 USD. Beancount derives the per-unit rate (1 INR = 0.01205 USD) from this. You never need to calculate or type the exchange rate yourself.
