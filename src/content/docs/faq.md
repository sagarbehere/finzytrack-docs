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

### Does Finzytrack automatically download transactions and balances from my bank?

**Short answer:** Not at the moment.

**Long answer:** Three obstacles, each currently blocking a different path:

1. **US-style aggregators** (Plaid, Yodlee, etc.) require sharing your bank login credentials with a third party. We haven't yet found a way to do this that we're confident about from a privacy and risk standpoint. We'll enable it if/when we can.
2. **Direct bank connections** are possible in some countries (e.g., open-banking APIs in the EU/UK). The developer doesn't currently hold accounts in those countries, so lacks both the testing access and the personal motivation to build this.
3. **Regulated frameworks** like India's Account Aggregator system allow direct bank-to-app retrieval, but require a level of regulatory compliance (entity registration, security audits) that is impractical for a solo indie developer without a business entity.

We're always watching for ways to enable one-click retrieval and will share updates when a promising direction emerges. In the meantime, [Import](/views/import/) supports OFX/QFX, CSV, XLS, PDF, and email-based ingest.

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

### How do I record a GST invoice with TDS deduction?

When you issue a consulting invoice that includes GST and the client deducts TDS before paying, you need two transactions: one to raise the invoice and one to record the payment.

**Example numbers:**

| Item | Amount |
|---|---|
| Consulting fee | 1,00,000 INR |
| GST @ 18% | 18,000 INR |
| Invoice total | 1,18,000 INR |
| TDS @ 10% on 1,00,000 | 10,000 INR |
| Amount received | 1,08,000 INR |

**Step 1 — Raise the invoice:**

```beancount
2025-03-01 * "Client ABC" "Consulting invoice #42"
  Assets:Receivable:Work             118000 INR
  Income:Consulting                 -100000 INR
  Liabilities:GST                    -18000 INR
```

**Step 2 — Record the payment received:**

```beancount
2025-03-15 * "Client ABC" "Payment for invoice #42"
  Assets:Bank:Current                108000 INR
  Assets:Receivable:TDS               10000 INR
  Assets:Receivable:Work            -118000 INR
```

**Notes:**

- TDS is deducted on the base fee only (1,00,000 INR), not on GST.
- After Step 2, `Assets:Receivable:Work` is fully cleared — the invoice is settled.
- The 10,000 INR in `Assets:Receivable:TDS` stays on your books until you file your ITR, at which point it is applied as a credit against your tax liability and clears against `Equity:Taxes:India`.
- Verify your running `Assets:Receivable:TDS` balance against Form 26AS periodically to catch any discrepancies early.
- The 18,000 INR in `Liabilities:GST` is remitted to the government separately when you file your GSTR-3B, net of any `Assets:Receivable:GST` input credit you have accumulated.
