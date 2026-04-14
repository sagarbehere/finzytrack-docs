---
title: Import
description: The Import view — bringing financial data into your ledger.
sidebar:
  order: 3
---

The Import view is where you bring financial data into your ledger. It offers six import methods organized as tabs — **OFX**, **CSV**, **XLS**, **Email**, **Manual**, and **AI** — all of which feed into a shared transaction review table where you edit, categorize, and register transactions.

Each tab works independently. You can import from multiple sources in a session and all parsed transactions accumulate in the same review table.

---

## OFX

OFX (Open Financial Exchange) is a standardized format supported by many financial institutions. Importing OFX files requires no prior setup — no rules or configuration needed.

1. **Upload** your `.ofx` or `.qfx` file by dragging it into the drop zone or clicking to browse.
2. **Review the file details** that appear after parsing — transaction count, date range, detected balance, and currency.
3. **Select the Beancount account** this statement belongs to (e.g., `Assets:Bank:Checking`). Only asset and liability accounts are shown.
4. **Select the currency** if not auto-detected.
5. **Learn Account** (optional) — click this to save the mapping between the OFX source and your Beancount account. Future imports from the same source will auto-detect the account and currency.
6. Click **Proceed** to load the transactions into the review table.

---

## CSV

CSV files have no standardized column structure, so you need a **rule file** that tells the app which columns contain the date, amount, payee, and so on. Rules are created in **Settings > Import Rules**. See [File Import Rules](/reference/file-import-rules/) for the full reference.

1. **Select a rule** from the dropdown. The dropdown lists all configured CSV rules.
2. **Upload** your `.csv` file.
3. **Preview** — a table showing the first few parsed transactions appears so you can verify the rule is working correctly.
4. **Select the account and currency** (pre-filled from the rule's defaults, but you can override).
5. Click **Proceed** to load the transactions into the review table.

If no rules are configured, a banner appears with a link to the documentation and a shortcut to **Settings > Import Rules** where you can create one. The **reload button** (circular arrow) re-reads rule files from disk — useful after editing rules in Settings without leaving the Import view.

---

## XLS

Works identically to the CSV tab but for Excel files (`.xls`, `.xlsx`). Requires its own set of XLS rule files, also managed in **Settings > Import Rules**. See [File Import Rules](/reference/file-import-rules/) for details.

---

## Email

Imports transactions from notification emails sent by your financial institution — purchase alerts, payment confirmations, and similar. This tab requires email import rules to be configured first, which define the IMAP connection and extraction patterns.

1. **Select a profile** from the dropdown. Each profile corresponds to one email account / financial institution pair.
2. **Set the date range** — emails outside this range are ignored. Defaults to the last 7 days.
3. **Select the currency** if you want to override the profile's default.
4. **Choose the parsing mode** — **Regex** (rule-based extraction) or **AI** (uses your configured AI model to extract fields from the email body).
5. Optionally click **Test Connection** to verify the IMAP connection before fetching.
6. Click **Fetch** to retrieve and parse emails.

After fetching, a results summary shows:
- Number of emails fetched and transactions parsed.
- **Unmatched emails** — emails that were fetched but did not match any rule. Expand to see details (sender, subject, date, reason).
- **Extraction errors** — emails that matched a rule but failed during field extraction. Expand to see the error details.

Successfully parsed transactions are loaded into the review table.

:::note
Email import involves more initial setup than file-based methods, but it is largely a one-time effort. Once you have configured the IMAP connection and created rules for each type of email your financial institution sends, they rarely need to change. See [Email Import Rules](/reference/email-import-rules/) for the full reference on configuring profiles, IMAP connections, and extraction patterns.
:::

---

## Manual

For entering transactions by hand or using natural language.

### Natural Language Entry

If you have [AI configured](/quick-start/#configuring-ai), type a description of the transaction in the text area — for example, *"Paid $45 for dinner at Olive Garden yesterday on Chase credit card"*. Click **Parse & Add** (or press Cmd/Ctrl+Enter) and the AI converts it into a structured transaction with the date, amount, payee, and accounts filled in.

Use currency symbols like `$` or `€` to hint the currency. Always review the parsed result — AI can make mistakes.

If AI is not configured, the text area is disabled and a banner links to Settings where you can enable it.

### Blank Transaction Entry

Below the natural language input, you can add a blank transaction manually:

1. Select a **source account** (asset or liability).
2. Select a **currency**.
3. Click **Add Transaction** to insert an empty row in the review table, ready for manual editing.

---

## AI

Parses statements using your configured AI model, extracting transactions without any rule files. This is the most flexible method — it handles formats that the rule-based methods cannot, including PDFs and images.

1. **Upload** a file — supported formats include CSV, Excel, PDF, EML (email files), and images (JPG, PNG, GIF, WebP). Image support depends on the underlying AI model — not all models can process images.
2. **Select the Beancount account** this statement belongs to.
3. **Select the currency**.
4. Click **Parse with AI** to send the file to your AI model for extraction.

The AI reads the document and returns a list of transactions. Review them carefully — the AI infers structure from the document layout, so occasional errors are possible, especially with unusual formats.

Requires [AI to be configured](/quick-start/#configuring-ai). If not configured, a banner links to Settings.

---

## Reviewing Transactions

After any import method proceeds, the parsed transactions appear in a shared table below the tabs. This is where you review, edit, categorize, and finalize before committing to the ledger.

### Columns

Click the **column visibility button** (adjustments icon) at the top of the table to choose which columns are shown. By default, the most commonly used columns are visible. You can toggle any column on or off and reset to defaults at any time. Your column choices are saved across sessions.

**Transaction-level columns** (shared across all postings of a transaction):

| Column | Default | Description |
|--------|---------|-------------|
| Status | Visible | Warning icons for duplicates or validation issues. Always visible. |
| # | Visible | Row number for reference. |
| Date | Visible | Transaction date. |
| Flag | Hidden | Beancount transaction flag (`*` for complete, `!` for needs review). Useful if you want to mark some transactions for later attention. |
| Payee | Visible | Who you paid or received money from. |
| Memo | Hidden | Internal reference or note from the source statement. |
| Narration | Visible | Human-readable description of the transaction. |
| Tags/Links | Hidden | Beancount tags (`#tag`) and links (`^link`). Useful for grouping related transactions. |

**Posting-level columns** (one row per posting within a transaction):

| Column | Default | Description |
|--------|---------|-------------|
| Account | Visible | The ledger account for this posting (e.g., `Expenses:Groceries`). Offers autocomplete from your chart of accounts. |
| Amount | Visible | The monetary amount. Positive amounts show in green, negative in red. |
| Currency | Visible | The currency code for this posting. |
| Cost Amount | Hidden | Cost basis amount. Used for tracking investments or foreign currency purchases at a specific cost. |
| Cost Currency | Hidden | The currency of the cost basis. |
| Cost Date | Hidden | The date of the cost basis. |
| Price Amount | Hidden | Unit or total price. Used for currency conversions or investment valuations. |
| Price Currency | Hidden | The currency of the price. |
| Price Type | Hidden | Whether the price is per-unit (`@`) or total (`@@`). |

Most imports only need the default visible columns. The cost and price columns are relevant when dealing with investments, foreign currency transactions, or other situations where you need to track the price at which something was acquired.

### Editing

Every field in the table is editable inline — click a cell to edit it. Account fields offer autocomplete from your chart of accounts.

The table supports full keyboard navigation so you can review and edit all transactions without reaching for the mouse. Use **Arrow keys** to move between cells, **Enter** to confirm an edit and move down, **Tab** / **Shift+Tab** to move forward and back, **F2** to start editing the selected cell, and **Escape** to cancel an edit.

Use the **+** button on a transaction to add a posting, or the **x** button to remove one. Use the **−** button to remove an entire transaction from the import.

### Autocategorize

Click the **Autocategorize** button above the table to let the app suggest expense/income accounts for each transaction. This runs the configured categorization engine — either a local classifier trained on your existing ledger history, or your AI model if configured. See [Auto-Categorization](/reference/auto-categorization/) for details on how both engines work.

The built-in classifier learns from the categorized transactions already in your ledger. It will not perform well when you are just starting out and have few or no categorized transactions, but it improves as your ledger grows. In practice, this approach works well for personal finance because most people transact with the same set of merchants repeatedly — once the classifier has seen a few transactions from a merchant, it reliably categorizes future ones. After categorization, the status column shows a confidence indicator for each transaction: a green circle for high confidence, an indigo circle for medium confidence, or a red circle for low confidence. Hover over the icon to see the exact percentage. Pay extra attention to transactions with low confidence — those are the ones most likely to need manual correction.

Autocategorization also runs **duplicate detection**, flagging transactions that may already exist in your ledger.

### Duplicate Detection

Transactions flagged as potential duplicates show a warning icon in the status column. Click the icon to open a side-by-side comparison:

- **Left panel** — the new transaction from your import.
- **Right panel** — the existing transaction(s) in your ledger that look similar.

For each pair you can **Keep** the new transaction or **Remove** it as a duplicate. If multiple transactions are flagged, use the arrow buttons to navigate between them.

### Registering

When you are satisfied with the transactions, click **Register Transactions** (green button below the table) to commit them to your ledger.

If there are unresolved issues (pending duplicates or unbalanced transactions), a confirmation dialog lists them and asks whether to proceed anyway or go back to fix them.

On success, the transactions are written to the ledger, the table clears, and the import form resets. On failure, error details are shown and the transactions remain in the table for correction.

### Reset

The **Reset** button restores all transactions to their original parsed state, undoing all manual edits and categorization. Use it if you want to start the review over.
