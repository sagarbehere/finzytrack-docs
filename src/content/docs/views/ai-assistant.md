---
title: AI Assistant
description: Conversational assistant for financial analysis, import rule creation, dashboard building, and more.
sidebar:
  order: 7
---

The AI Assistant is a conversational interface for working with your financial data. It requires [AI to be configured](/quick-start/#configuring-ai). If AI is not configured, a warning banner appears with a link to Settings. The model you pick has a large effect on how well the assistant works — see [Choosing an AI Model](/reference/choosing-an-ai-model/) for requirements and recommendations.

The assistant operates in two modes depending on whether you attach a file:

- **Setup mode** — activated when you upload a CSV, XLS, or EML file. The assistant helps you create import rules for that file.
- **Analyst mode** — the default when no file is attached. The assistant answers financial questions, runs queries, and builds dashboards.

---

## Chat Interface

The view is a chat-style interface with messages displayed chronologically. Your messages appear on the right in indigo, and assistant responses appear on the left in gray. The assistant's responses support markdown formatting including bold, italic, code blocks, and tables.

### Input Area

Type your message in the text area at the bottom. Press **Enter** to send, or **Shift+Enter** to insert a new line. The text area auto-resizes as you type.

To the left of the text area, a **paperclip button** lets you attach a file. To the right, a **send button** submits your message.

### New Chat

Click the **New Chat** button in the header to clear the conversation and start fresh. This resets the mode, clears any attached file, and closes the sidebar.

---

## Attaching Files

Click the paperclip button to attach a file. The primary file types are `.csv`, `.xls`, `.xlsx`, and `.eml` — these activate setup mode for creating import rules. You can also attach `.yaml` or `.yml` files to share an existing rule file with the assistant for review or modification. The attached file appears as a pill-shaped badge above the input area. Click the X on the badge to remove it.

When you attach a CSV, XLS, or EML file, the assistant switches to **setup mode** — focused on creating and saving an import rule for that file type — and a file preview sidebar opens automatically (for CSV and XLS files). The sidebar shows the file contents in a table with row numbers and column indices — this helps you and the assistant identify which columns map to which fields.

For multi-sheet Excel files, sheet tabs appear at the top of the preview so you can switch between sheets.

The file preview sidebar is resizable — drag the handle between the chat and the sidebar to adjust the split. You can close the sidebar with the X button and reopen it by clicking the filename in your message.

### Rule Quick-Fill Fields

When a CSV, XLS, or EML file is attached, quick-fill fields appear above the input area. All fields are optional, but filling them in gives the assistant useful context and saves back-and-forth:

- **Save as** — the filename for the rule (pre-filled from the uploaded filename, e.g., `statement.yaml`).
- **Account** — the Beancount account this statement belongs to (e.g., `Assets:Bank:Checking`).
- **Currency** — the default currency for transactions.
- **Expected txns** (CSV/XLS only) — the number of transactions you know are present in the statement. This is used to verify that the created rule parses the statement and at least identifies all the known transactions.

When you send your first message with a file attached, an initial prompt is automatically constructed from these fields telling the assistant to create a rule for parsing this kind of file. You can add additional instructions in the text area if needed, or simply send with the auto-generated prompt. The quick-fill values are also used during rule validation after the rule is saved.

---

## Setup Mode: Creating Import Rules

When you attach a statement file, the assistant examines its structure and helps you create an import rule. The typical flow is:

1. **Attach the file** and fill in the quick-fill fields (account, currency, expected count). For CSV and XLS files, a **file preview panel** opens in the sidebar showing the file contents with row numbers and column indices. Use this preview to verify the assistant's guesses or to answer its questions — for example, you can see which column number contains dates or amounts.
2. **The assistant analyzes the file** — it identifies header rows, column structure, date formats, and amount columns, then presents a checklist of its guesses for you to confirm or correct.
3. **Confirm or adjust** — refer to the file preview panel and tell the assistant if anything looks wrong (e.g., "the date is in column 3, not 2" or "amounts are in Indian format with commas").
4. **The assistant saves the rule** — it writes the YAML rule file using the filename from the quick-fill fields.
5. **Automatic validation** — after saving, the assistant automatically validates the rule by parsing your uploaded statement with it. The results appear inline.

### Rule Validation Results

After the assistant saves a rule, a validation section appears in the chat showing:

- **Status line** — a green checkmark if validation succeeded, or an amber/red warning if there are issues. Shows the number of transactions found and the date range. If you entered an expected transaction count, it compares against that.
- **Parsed transactions table** — a preview of the first 15 transactions extracted by the rule, showing date, description, and amount (green for credits, red for debits).
- **Raw file content** (for reference) — the first 60 lines of the file with line numbers, so you can cross-check against the parsed results.

For email rules, the validation shows **extracted fields** instead — a table of each field (amount, date, payee, etc.) and whether it was successfully extracted from the email.

### Tool Execution Badges

As the assistant works, small badges appear above its response showing which tools it is using — for example, "Writing CSV rule..." or "Reading existing rule file...". Each badge shows a spinner while in progress, then a green checkmark on success or a red X on failure.

### Supported Rule Types

- **CSV rules** — for `.csv` files. See [File Import Rules](/reference/file-import-rules/) for the rule format.
- **XLS rules** — for `.xls` and `.xlsx` files. See [File Import Rules](/reference/file-import-rules/) for the rule format.
- **Email rules** — for `.eml` files. The assistant first checks whether existing rules already handle this type of email before creating a new one. See [Email Import Rules](/reference/email-import-rules/) for the rule format.

### Validation Details

<details>
<summary>Import rule validation checks</summary>

**CSV and XLS rules** are validated against the following checks before saving:
- The YAML must parse correctly.
- Required fields must be present: at least a date column, a default account, and a default currency.
- Column indices must be 1 or greater.
- The rule must specify either a single amount column or a debit/credit column pair, not both.
- The date format must be a valid strftime pattern.
- CSV-specific fields (like `separator` and `encoding`) are rejected in XLS rules, and vice versa.
- The file path is checked for safety (no directory traversal, must end in `.yaml`).
- If a rule file with the same name already exists, the assistant asks before overwriting. A backup is created automatically.

After saving, the rule is tested against the uploaded statement. If zero transactions are parsed, or the count does not match the expected count, a warning is shown.

**Email rules** undergo additional validation:
- Every regex extraction pattern must compile successfully and contain exactly one capture group.
- Type conversions (float, integer, datetime) are tested against the extracted values.
- All extraction patterns are re-tested against the original email text. If any required field fails to extract, the rule is rejected and not saved.
- Before creating a new rule, the assistant checks existing rules to determine if the email sender is already known and whether this is a new transaction type for an existing rule or an entirely new rule file.

</details>

---

## Analyst Mode: Financial Queries

When no file is attached, the assistant operates in analyst mode. Ask questions about your finances in natural language — for example:

- *"What were my top 5 expense categories last year?"*
- *"How much did I spend on groceries each month in 2025?"*
- *"What is my current net worth?"*
- *"Show me all transactions to Amazon over $100."*

The assistant translates your questions into SQL queries, executes them against your ledger, and presents the results. It can handle follow-up questions and progressively refine queries based on your feedback. For simple, single-shot queries without conversation, the [Query](/views/query/) view may be more convenient.

### Response Validation

After the assistant responds, its answer is automatically checked against the actual data. If the assistant's response contains potential inaccuracies, amber warning cards appear below the response. Each warning can be expanded for details:

- **Unknown account** — the response mentions account names that do not exist in your ledger.
- **Date out of range** — the response references dates outside the range of your ledger data.
- **Amount mismatch** — the response cites amounts that are significantly larger than what the query actually returned.
- **Wrong currency** — the response uses currency symbols or codes not found in your ledger.

These warnings are informational — they flag possible hallucinations so you can verify the answer. You can dismiss them by clicking the X button.

<details>
<summary>Validation details: analyst responses</summary>

The assistant's responses are validated against ground truth collected from its own tool calls:

- **Account names** are compared against the full list of accounts returned by `get_ledger_context`. Any Beancount-formatted account name (e.g., `Expenses:Something`) in the response that is not in the ledger triggers a warning.
- **Currencies** are detected via symbols (`₹`, `$`, `€`, `£`, `¥`) and ISO codes (e.g., `USD`, `INR`). Any currency not found in the ledger triggers a warning.
- **Dates** are matched as month+year (e.g., "Jan 2026"), quarters (e.g., "Q1 2026"), or bare years. Dates outside the ledger's min/max transaction date range trigger a warning.
- **Amounts** are compared to the maximum value from the last query result. Amounts cited in the response that exceed 3x the maximum query result (and are over 1,000) trigger a warning. This catches cases where the assistant fabricates or misreads numbers.
- **No tool use** — if the assistant answered a financial question without executing any query, a warning flags that the answer may be fabricated.

Validation only runs in analyst mode and only after the assistant produces a final text response. It does not block the response — warnings appear alongside it.

</details>

---

## Analyst Mode: Building Dashboards

The assistant can create dashboard and widget recipes for you. Describe what you want to visualize — for example:

- *"Create a dashboard that shows my monthly income and expenses as a bar chart."*
- *"Build a widget showing my top 10 spending categories as a horizontal bar chart."*
- *"Make a dashboard with net worth, total assets, and total liabilities as KPI cards, plus a monthly spending trend line chart."*

### Dashboard Preview

When the assistant generates a recipe, it validates the recipe and renders a **live preview** in the sidebar. The preview shows the actual dashboard layout with real data from your ledger — KPI cards, charts, tables, and pivot tables all render as they would on the Dashboards view.

You can review the preview, ask the assistant to make changes (e.g., "change the bar chart to a line chart" or "add a currency filter"), and iterate until you are satisfied. The assistant then saves the recipe to disk and updates the dashboard manifest.

After saving, the new dashboard appears in the [Dashboards](/views/dashboards/) view — click the **+** button in the tab bar to add it.

<details>
<summary>Validation details: dashboard recipes</summary>

Before previewing or saving, dashboard and widget recipes are validated:

- **Structural validation** — required fields must be present, enum values (widget types, chart types, transform names) must be valid, and the layout must be consistent (grid areas must reference defined widgets, grid positions must be within bounds).
- **ID format** — recipe IDs must contain only lowercase letters, hyphens, and numbers.
- **SQL dry-run** — every widget query is executed with placeholder parameter values to catch SQL syntax errors before saving. This means queries with typos or references to non-existent columns are caught at preview time, not after the recipe is already saved.
- **Widget-to-layout mapping** — for dashboards, every widget referenced in the layout must be defined either inline or as a standalone widget, and every defined widget must be referenced in the layout.

If validation fails, the assistant receives the error details and attempts to fix the recipe automatically before re-previewing.

</details>

---

## Sidebar

The right-side sidebar serves two purposes depending on the context:

- **File preview** — shows the uploaded CSV or XLS file contents in a table with row and column numbers. Useful for referencing column positions during rule creation.
- **Dashboard preview** — shows a live rendering of a dashboard or widget recipe the assistant has generated.

The sidebar is resizable by dragging the handle between the chat and sidebar panes. Close it with the X button in the sidebar header. File previews can be reopened by clicking the filename link in your message.

---

## Tips

- **Start with the quick-fill fields.** When creating import rules, filling in the account, currency, and expected transaction count upfront saves back-and-forth with the assistant.
- **Review validation results carefully.** After rule creation, check the parsed transactions table to make sure dates, amounts, and descriptions look right.
- **Iterate on dashboards.** Ask the assistant to preview first, review the live rendering, then ask for adjustments before saving.
- **Use analyst mode for exploration.** Ask broad questions first ("What does my spending look like this year?"), then drill down based on the results.
- **Check warning cards.** Amber warnings on analyst responses flag potential inaccuracies — expand them to see what triggered the warning.
