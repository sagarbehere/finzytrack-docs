---
title: Quick Start
description: Get up and running with Finzytrack — from first launch to exploring your finances.
---

This guide walks you through your first session with Finzytrack. It assumes you have already [installed](/installation/) the app.

---

## The Setup Wizard

When you launch Finzytrack for the first time, a setup wizard walks you through three decisions:

### 1. Default Currency

Pick the currency you use most often. This becomes the default for new accounts and imports. You can choose from common currencies or type a custom code.

### 2. Ledger Choice

Finzytrack stores all your financial data in a single plain-text [Beancount](https://beancount.github.io/) ledger file. You have two options:

- **Start fresh** — The app creates a starter ledger pre-loaded with common accounts (checking, savings, credit card, and a set of expense categories like groceries, rent, utilities, and so on). You can rename, add, or remove accounts later.
- **Use an existing Beancount file** — Point the app to a `.beancount` / `.bean` / `.bc` file you already have. The app uses the file directly (no copy is made), so back it up first.

### 3. AI Configuration (Optional)

You can optionally connect an AI model to unlock features like natural-language transaction entry, AI-assisted statement parsing, and automatic import-rule creation. This step can be skipped and configured later from **Settings > AI**.

See [Configuring AI](#configuring-ai) below for details on what models work well and how to set this up.

After completing the wizard, you land on the **Accounts** view with your chart of accounts ready to review.

---

## Two Starting Paths

What you do next depends on whether you brought an existing ledger or started fresh.

### Path A: You Have an Existing Ledger

If you pointed the wizard at an existing Beancount file, your data is already loaded. You can start exploring right away:

- **Dashboards** — Open the [Dashboards](/views/dashboards/) view to see your finances summarized in charts and KPIs. Dashboards are fully customizable; see [Dashboard Recipes](/reference/dashboard-recipes/) for details.
- **Transactions** — Browse, search, and filter your transactions in the [Transactions](/views/transactions/) view.
- **Query** — Run SQL or BQL queries to answer specific questions — top expense categories, spending by month, account balances over time, and more. See [Querying Data](/reference/querying-data/) for the query reference.

When you are ready to import new statements, continue to [Importing Transactions](#importing-transactions) below.

### Path B: Starting Fresh

If you chose "Start fresh", your first task is to set up the right accounts:

1. **Review the starter accounts.** The Accounts view shows the pre-loaded chart of accounts. Rename or remove accounts that do not apply to you, and add any that are missing (your specific bank accounts, credit cards, investment accounts, loan accounts, etc.). For guidance on structuring your accounts, see [Account Hierarchy Design](/reference/account-hierarchy/).

2. **Import your first statement.** Once your accounts look right, head to the [Import](#importing-transactions) section below to bring in transactions from your financial institution.

---

## Importing Transactions

The Import view offers several ways to get transactions into your ledger. The best method depends on the format of your statements and whether you have AI configured.

### OFX Statements (Easiest)

If your financial institution exports statements in OFX or QFX format, this is the simplest path — no setup required.

1. Go to **Import > OFX**.
2. Upload your `.ofx` or `.qfx` file.
3. On the first import, select the Beancount account this statement belongs to (e.g., `Assets:Bank:Checking`) and save the mapping. Future imports from the same source will be auto-detected.
4. Review the parsed transactions, categorize them, and register.

### CSV or XLS Statements (Rules Required)

CSV and Excel files have no standardized structure — every financial institution formats columns differently. Before you can import, you need a **rule file** that tells the app which columns contain the date, amount, payee, and so on.

1. Go to **Settings > Import Rules** and select the CSV or XLS tab.
2. Click **"+ New"** to create a rule. The editor opens with a starter template. You can upload a sample statement to see a preview of the rows and columns — this helps you identify which column numbers to map to which fields (date, amount, payee, memo). See [File Import Rules](/reference/file-import-rules/) for the full reference.
3. Save the rule. It will now appear in the **Import** view under the corresponding CSV or XLS tab.
4. Go to **Import > CSV** (or **XLS**), select your rule, upload the statement, review, and register.

:::note
If you have [AI configured](#configuring-ai), you can ask the AI assistant to [create import rules for you](/views/ai-assistant/#setup-mode-creating-import-rules). Upload a sample statement in the Assistant view and ask it to generate the rule — this is often easier than writing one by hand.
:::

### AI-Assisted Parsing (No Rules Needed)

If you have an AI model configured, you can skip rule creation entirely:

1. Go to **Import > AI**.
2. Upload a statement in any supported format — CSV, Excel, PDF, or even an image of a statement.
3. Select the source account and currency.
4. The AI reads the file and extracts transactions directly.
5. Review the results and register.

This is the most flexible method. It handles formats that would otherwise require manual rule creation, and it works with PDFs and images that the rule-based methods cannot process at all. The trade-off is that it requires an AI model and uses API calls.

### Manual and Natural-Language Entry

For one-off transactions or quick additions:

- **Natural language** (requires AI): Type something like *"Paid $45 for dinner at Olive Garden yesterday"* and the AI parses it into a structured transaction with the right date, amount, payee, and account.
- **Manual entry**: Add a blank row and fill in the fields by hand.

Go to **Import > Manual** to use either method.

### Email Import

Finzytrack can also import transactions from notification emails sent by your financial institution (e.g., purchase alerts, payment confirmations).

:::caution
Email import requires IMAP server configuration and per-institution rule files with regex patterns. It involves significantly more setup than the methods above. We recommend getting comfortable with the app using file-based imports first, and coming back to email import later. See [Email Import Rules](/reference/email-import-rules/) when you are ready.
:::

---

## Configuring AI

AI is entirely optional — every core feature works without it. With AI configured, you also get statement parsing for arbitrary formats (including PDFs and images), AI-generated import rules, natural-language transaction entry, auto-categorization, and a conversational assistant for financial queries.

The model you pick matters a lot. Finzytrack needs a capable model — tool calling, 128k+ context, and roughly 32B+ active parameters. A weaker model is worse than no AI at all. For the full requirements, recommended provider, and trade-offs, see [Choosing an AI Model](/reference/choosing-an-ai-model/).

**The short version:** see the [Tested models](/reference/choosing-an-ai-model/#tested-models) table for model + provider combinations we have verified work well, and configure your pick during the setup wizard or from **Settings > AI**. For what financial data is sent to the model in each feature, see [Data Shared with AI](/reference/ai-data-sharing/).

:::note[Trying AI before committing to a provider]
[OpenRouter](https://openrouter.ai) offers a free tier with no credit card required. Sign up, generate an API key, set the API URL to `https://openrouter.ai/api/v1` in **Settings > AI**, and pick a [free model](https://openrouter.ai/models?q=:free) that meets the requirements. Privacy policies vary across free models — check the model card before sending sensitive data. See [Choosing an AI Model](/reference/choosing-an-ai-model/#trying-ai-before-committing-to-a-provider) for more.
:::

---

## Exploring Your Data

Once you have some transactions in your ledger, here is where to look:

| View | What It Shows |
|------|---------------|
| [Dashboards](/views/dashboards/) | Visual overview — charts, KPIs, and tables in customizable layouts |
| [Transactions](/views/transactions/) | Searchable, filterable list of all transactions |
| [Accounts](/views/accounts/) | Account hierarchy with balances |
| [Query](/views/query/) | Run SQL or BQL queries for custom analysis |
| [AI Assistant](/views/ai-assistant/) | Conversational assistant for financial analysis, import rule creation, dashboard building, and more |

### Global Search

The search field in the top bar is available from any screen. As you type, it shows matching account names in a dropdown — click one to jump to the Accounts view filtered to that account. You can also press Enter or click "Search transactions" to jump to the Transactions view with your search term applied against payee and narration fields. Use the arrow keys to navigate the dropdown and Escape to close it.

### Things to Try

- Open the default [Dashboard](/views/dashboards/) to see spending breakdowns and trends.
- Go to [Transactions](/views/transactions/) and filter by account or date range.
- Go to [Query](/views/query/) and run something like `SELECT account, SUM(CAST(amount AS REAL)) AS total FROM postings WHERE account_type = 'Expenses' GROUP BY account ORDER BY total DESC` to see your top expense categories. See [Querying Data](/reference/querying-data/) for more examples.
- Customize a dashboard by editing its [recipe](/reference/dashboard-recipes/).

---

## Next Steps

- **[Views](/views/)** — Learn what each screen in the app does.
- **[File Import Rules](/reference/file-import-rules/)** — Create rules for your institution's CSV/XLS format.
- **[Dashboard Recipes](/reference/dashboard-recipes/)** — Customize dashboards with charts, tables, and KPIs.
- **[Querying Data](/reference/querying-data/)** — Write SQL and BQL queries against your ledger.
- **[Configuration](/reference/configuration/)** — Full reference for all settings.
