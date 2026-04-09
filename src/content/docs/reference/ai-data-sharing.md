---
title: Data Shared with AI
description: What financial data Finzytrack sends to AI models in each feature.
---

Finzytrack uses AI for several optional features. All AI calls are made from the backend — your API key is not exposed to the browser. This page documents what data is sent to your configured AI model in each feature, so you can make informed decisions about what you share.

:::note
If you use Finzytrack AI, your data is routed through Finzytrack's server to a cloud AI model selected and configured by Finzytrack. Finzytrack's server acts as a pass-through — it forwards your request to the cloud model and returns the response without inspecting, storing, or using your data. Finzytrack selects providers with strong privacy commitments. If you configure your own API key (OpenAI-compatible or Anthropic), data bypasses Finzytrack's server entirely — communication is directly between your computer and your AI provider. In either case, the data described below is what gets sent.
:::

---

## Natural Language Transaction Entry

**What it does:** Converts a plain-language description like "Paid $50 for dinner at Olive Garden" into a structured Beancount transaction.

**Sent to AI:**
- Your typed text (the natural language description)
- Your account names, grouped by type (Assets, Expenses, Income, etc.)
- Your ledger's currency list and default currency
- Today's date

**Not sent:**
- Transaction history
- Account balances
- Amounts from existing transactions
- Payee or merchant history

---

## AI File Import

**What it does:** Extracts transactions from an uploaded file (CSV, Excel, PDF, image, or email) using AI.

**Sent to AI:**
- The full contents of the uploaded file (text for CSV/Excel/email, base64-encoded for PDF/images)
- The account name and currency you selected in the import form

**Not sent:**
- Your existing transactions
- Your account names (other than the one you selected)
- Account balances
- Any other ledger data

---

## Query Assistant

**What it does:** Translates a natural language question like "What did I spend on food last month?" into a SQL or BQL query.

**Sent to AI:**
- Your natural language question
- The database schema (column names, types, and query syntax rules)
- The current date and year (for resolving relative references like "last month")

**Not sent:**
- Your actual transaction data
- Account names, balances, or payees
- Query results — the AI generates the query, but your data is only accessed when you execute it locally

---

## Email Import (AI Parsing)

**What it does:** Extracts transaction details (amount, payee, date) from a bank notification email when rule-based extraction is not configured.

**Sent to AI:**
- The email subject line
- The email body text

**Not sent:**
- Your account names or structure
- Other emails
- Transaction history
- Account balances

---

## Autocategorization

**What it does:** Suggests an expense or income account for imported transactions based on the payee name.

:::note
By default, autocategorization uses a local scikit-learn classifier trained on your own previously categorized transactions — it runs entirely on your machine and no data is sent anywhere. AI-based categorization is only used if you have explicitly selected it in Settings.
:::

**Sent to AI:**
- Payee names, memo text, and narration from the transactions being categorized
- Your expense and income account names (the category list)
- The source account name (e.g., "Assets:Liquid:Checking:BofA")
- The default/fallback account name

**Not sent:**
- Transaction amounts — amounts are explicitly excluded
- Transaction dates
- Account balances
- Transaction history or patterns

Transactions with the same payee/memo/narration are deduplicated before sending, so each unique description is sent only once per batch.

---

## AI Assistant — Creating Import Rules

**What it does:** Helps you create and refine import rules for CSV files, Excel files, and bank notification emails by examining a sample file.

**Sent to AI:**
- The contents of the file you are setting up rules for (CSV/Excel data or email body)
- Your account names
- The file type (csv, xls, email)

**Not sent:**
- Your existing transactions or balances
- Other files in your ledger
- Transaction amounts or payees from your ledger

---

## AI Assistant — Analyst Mode

**What it does:** Answers financial questions and builds dashboard visualizations by querying your data.

**Sent to AI:**
- Your natural language question or request
- The database schema and query syntax rules

**Fetched by AI via tools during the conversation:**
- **Ledger context** (fetched once at conversation start): your account names with current balances per currency, the date range of your transactions, and your default currency
- **Query results**: the AI writes SQL queries and executes them against your local database to answer your questions — the results (which may include amounts, payees, dates, and other transaction details) are sent back to the AI so it can interpret them
- **Dashboard recipes**: existing recipe JSON files, for reading and modifying dashboards

This is the only feature where the AI can access your actual financial data (balances, transaction details, amounts). It does so incrementally through tool calls — only the data needed to answer your specific question is queried and shared.

---

## Summary

| Feature | Account names | Amounts | Payees | Balances | File contents | Transaction data |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| NL Transaction Entry | Yes | — | — | — | — | — |
| AI File Import | Selected only | — | — | — | Yes | — |
| Query Assistant | — | — | — | — | — | — |
| Email Import (AI) | — | — | — | — | Email only | — |
| Autocategorization | Expense/Income | — | Yes | — | — | — |
| Assistant (Setup) | Yes | — | — | — | Yes | — |
| Assistant (Analyst) | Yes | Via queries | Via queries | Via queries | — | Via queries |

**Key:** "Yes" = always sent. "Via queries" = only sent when the AI executes a query to answer your question. "—" = never sent. "Selected only" = only the single account you chose in the UI. "Expense/Income" = only expense and income account names, not asset or liability accounts. "Email only" = the email being imported, not financial files.
