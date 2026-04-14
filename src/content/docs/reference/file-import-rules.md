---
title: File Import Rules (CSV / XLS)
description: Complete reference for CSV and XLS/XLSX import rules — file format, field reference, amount handling, and worked examples.
sidebar:
  order: 3
---

:::note
If you have [AI configured](/quick-start/#configuring-ai), you can ask the AI assistant to create import rules for you — upload a sample statement and describe which account it belongs to. You can also skip rules entirely and use [AI-assisted parsing](/quick-start/#ai-assisted-parsing-no-rules-needed) to extract transactions directly. If you prefer to create rules manually, or want to understand and fine-tune what the assistant generates, read on.
:::

Import rules tell Finzytrack how to read CSV and XLS/XLSX files exported by your financial institution and extract transactions from them. Each rule is a YAML file that maps columns in the source file to transaction fields (date, amount, payee, etc.).

Rules live in your config directory:

- **CSV rules:** `config/csv_rules/*.yaml`
- **XLS rules:** `config/xls_rules/*.yaml`

You can create and edit rules through the Finzytrack UI or by writing YAML files directly.

---

## Quick start

Here is a minimal CSV rule that imports a simple bank statement with three columns — date, description, and amount:

```yaml
name: "My Bank Checking"
date_format: "%m/%d/%Y"
columns:
  date: 1
  payee: 2
  amount: 3
default_account: "Assets:Bank:Checking"
default_currency: "USD"
```

And an equivalent XLS rule for a spreadsheet version of the same statement:

```yaml
name: "My Bank Checking (Excel)"
sheet_index: 0
date_format: "%m/%d/%Y"
columns:
  date: 1
  payee: 2
  amount: 3
default_account: "Assets:Bank:Checking"
default_currency: "USD"
```

That's all you need for a basic import. The sections below cover every field and option.

---

## Rule file format

Rules are YAML files with a `.yaml` extension. The filename becomes the rule's identifier (e.g., `bofa-checking.yaml`). Use lowercase names with hyphens for readability.

### CSV rule — complete field reference

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | **yes** | — | Human-readable label shown in the UI |
| `separator` | string | no | `","` | Column delimiter. Use `","` for CSV, `"\t"` for TSV |
| `encoding` | string | no | `"utf-8"` | File encoding. Common values: `utf-8`, `utf-8-sig`, `latin-1`, `cp1252` |
| `skip_lines_start` | integer | no | `0` | Number of lines to skip at the top of the file (metadata, headers) |
| `skip_lines_end` | integer | no | `0` | Number of lines to skip at the bottom (footers, summaries) |
| `date_format` | string | no | `"%Y-%m-%d"` | Date format using Python strftime tokens (see [Date formats](#date-formats)) |
| `decimal_separator` | string | no | `"."` | Decimal separator: `"."` for most locales, `","` for European formats |
| `columns` | object | **yes** | — | Column index mappings (see [Column mappings](#column-mappings)) |
| `default_account` | string | **yes** | — | Beancount account this file belongs to (e.g., `Assets:Bank:Checking`) |
| `default_currency` | string | no | `"USD"` | Currency code for all transactions |
| `negate_amounts` | boolean | no | `false` | Flip the sign of all amounts (see [Negating amounts](#negating-amounts)) |

### XLS rule — complete field reference

XLS rules share most fields with CSV rules, but replace `separator` and `encoding` with sheet selection fields.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | **yes** | — | Human-readable label shown in the UI |
| `sheet_index` | integer | no | `0` | Zero-based sheet index to read from (0 = first sheet) |
| `sheet_name` | string | no | — | Sheet name to read from. **Overrides `sheet_index`** if both are provided |
| `skip_lines_start` | integer | no | `0` | Number of rows to skip at the top (metadata, headers) |
| `skip_lines_end` | integer | no | `0` | Number of rows to skip at the bottom (footers, summaries) |
| `date_format` | string | no | `"%Y-%m-%d"` | Date format using Python strftime tokens (see [Date formats](#date-formats)) |
| `decimal_separator` | string | no | `"."` | Decimal separator for string-valued amount cells |
| `columns` | object | **yes** | — | Column index mappings (see [Column mappings](#column-mappings)) |
| `default_account` | string | **yes** | — | Beancount account this file belongs to |
| `default_currency` | string | no | `"USD"` | Currency code for all transactions |
| `negate_amounts` | boolean | no | `false` | Flip the sign of all amounts |

**Fields exclusive to each rule type:**
- CSV only: `separator`, `encoding` (these will be rejected in XLS rules)
- XLS only: `sheet_index`, `sheet_name` (these will be rejected in CSV rules)

---

## Column mappings

The `columns` object maps transaction fields to 1-based column indices. Column 1 is the leftmost column (column A in a spreadsheet).

### Required: date column

Every rule must specify a `date` column:

```yaml
columns:
  date: 1
```

### Required: amount columns

You must provide **one** of two amount schemes:

**Option A — Single amount column** (for files where one column has signed values):

```yaml
columns:
  date: 1
  amount: 3       # positive = deposit, negative = withdrawal
```

**Option B — Separate debit and credit columns** (for files that put withdrawals and deposits in different columns):

```yaml
columns:
  date: 1
  amount_debit: 4    # money out (withdrawals)
  amount_credit: 5   # money in (deposits)
```

You cannot mix both schemes. Specifying `amount` together with `amount_debit`/`amount_credit` is a validation error.

### Optional text columns

| Column field | Description |
|---|---|
| `payee` | Counterparty name (who the money went to or came from) |
| `narration` | Longer transaction description |
| `memo` | Memo, reference number, or additional notes |

All three are optional. If omitted, the field defaults to an empty string. You can use any combination.

### Column mapping examples

A file with columns: Date, Description, Amount
```yaml
columns:
  date: 1
  payee: 2
  amount: 3
```

A file with columns: Sl.No, Date, Memo, Particulars, DR, CR, Balance
```yaml
columns:
  date: 2
  memo: 3
  payee: 4
  amount_debit: 5
  amount_credit: 6
  # columns 1 (Sl.No) and 7 (Balance) are ignored
```

---

## Date formats

The `date_format` field uses Python strftime tokens to describe how dates appear in the source file.

### Supported tokens

| Token | Meaning | Example |
|---|---|---|
| `%Y` | 4-digit year | `2024` |
| `%y` | 2-digit year | `24` (interpreted as 2024; values 70–99 map to 1970–1999) |
| `%m` | Month as number (1 or 2 digits) | `1`, `01`, `12` |
| `%d` | Day as number (1 or 2 digits) | `5`, `05`, `31` |
| `%b` | Abbreviated month name | `Jan`, `Feb`, `Dec` (case-insensitive) |

### Common date format strings

| Date example | Format string |
|---|---|
| `2024-01-15` | `"%Y-%m-%d"` |
| `01/15/2024` | `"%m/%d/%Y"` |
| `15-01-2024` | `"%d-%m-%Y"` |
| `15/01/2024` | `"%d/%m/%Y"` |
| `15/Jan/2024` | `"%d/%b/%Y"` |
| `01-15-24` | `"%m-%d-%y"` |

The separator character in the format string (e.g., `-`, `/`) must match the separator used in the actual data.

---

## Amount parsing

The parser handles a variety of amount formats. Understanding these rules helps you choose the right settings.

### Decimal separator

Set `decimal_separator` to match your file's number format:

| Setting | Input | Parsed as |
|---|---|---|
| `"."` (default) | `1,234.56` | 1234.56 |
| `","` | `1.234,56` | 1234.56 |

When `decimal_separator` is `","`, periods are treated as thousands separators and stripped.

### Automatic cleanup

The parser automatically strips:
- Currency symbols (`$`, `€`, `₹`, etc.)
- Thousands separators (commas or periods, depending on `decimal_separator`)
- Whitespace and other non-numeric characters

### Accounting-style negatives

Amounts wrapped in parentheses are treated as negative:

| Input | Parsed as |
|---|---|
| `(1,234.56)` | -1234.56 |
| `$(500.00)` | -500.00 |

### Debit/credit column logic

When using `amount_debit` and `amount_credit`:

- If the credit column has a non-zero value, the amount is **positive** (money in)
- If the debit column has a non-zero value, the amount is **negative** (money out)
- If both columns are empty or zero, the row is skipped

When credit has a value, it takes precedence over debit.

### Negating amounts

Set `negate_amounts: true` when your bank's sign convention is the opposite of what you'd expect. This is most common with **credit card statements**, where charges (money you owe) appear as positive numbers.

With `negate_amounts: true`, every parsed amount has its sign flipped after all other processing.

---

## Skipping header and footer rows

Bank exports often have metadata rows before the actual data and summary rows after it.

### `skip_lines_start`

The number of lines to skip at the top of the file. Count **all** lines from the top, including blank lines and the column header row. The data should start on the line immediately after the skipped lines.

**Example:** A CSV file that looks like this:

```
Account Statement                        ← line 1 (metadata)
Account: 1234567890                      ← line 2 (metadata)
Period: Jan 2024 – Dec 2024             ← line 3 (metadata)
                                         ← line 4 (blank)
Date,Description,Amount                  ← line 5 (column headers)
01/15/2024,Grocery Store,-45.00          ← line 6 (first data row)
```

Set `skip_lines_start: 5` to skip lines 1–5 and start parsing at line 6.

### `skip_lines_end`

The number of lines to skip at the bottom of the file.

**Example:** If the last 3 lines are:

```
01/31/2024,Gas Station,-35.00            ← last data row
                                         ← blank line
Total: -1,234.56                         ← summary line
```

Set `skip_lines_end: 2` to exclude the blank line and summary.

### Tips for determining skip values

1. Open the file in a text editor (for CSV) or spreadsheet app (for XLS)
2. Count the lines from the top until the first data row — that's your `skip_lines_start`
3. Count the lines from the bottom after the last data row — that's your `skip_lines_end`
4. When in doubt, use a slightly higher value and verify that transactions parse correctly

---

## File encoding (CSV only)

Most modern bank exports use UTF-8. If you see garbled characters (mojibake), try one of these encodings:

| Encoding | When to use |
|---|---|
| `utf-8` | Default. Works for most files |
| `utf-8-sig` | UTF-8 with BOM (byte order mark). Some Windows-generated files |
| `latin-1` | ISO-8859-1. Older European bank exports |
| `cp1252` | Windows Western European. Common in older Windows software |

Any Python-supported codec name is accepted.

---

## Sheet selection (XLS only)

For XLS/XLSX files with multiple sheets, you can target a specific sheet:

```yaml
# By index (0-based — 0 is the first sheet)
sheet_index: 0

# Or by name (overrides sheet_index if both are provided)
sheet_name: "Statement"
```

If neither is specified, the first sheet (index 0) is used.

---

## Row filtering and error handling

The parser is lenient — it silently skips rows that can't be parsed rather than failing the entire import. A row is skipped if:

- It doesn't have enough columns for the date field
- The date cell is empty or can't be parsed with the specified `date_format`
- The amount cell(s) are empty, non-numeric, or can't be parsed
- For split debit/credit: both columns are empty or zero

This means you don't need to perfectly account for every irregular row. If you set your skip values to roughly exclude headers and footers, the parser will handle stray blank rows or sub-headers within the data.

---

## Complete examples

### Example 1: US bank with single amount column

**Source file** (CSV):

```
Beginning balance as of 01/01/2024,,5000.00
,,
Date,Description,Amount,Running Bal.
01/02/2024,Direct Deposit,3500.00,8500.00
01/03/2024,Grocery Store,-85.50,8414.50
01/05/2024,Electric Company,-120.00,8294.50
,,
Ending balance as of 01/31/2024,,8294.50
```

**Rule:**

```yaml
name: "BofA Checking"
separator: ","
encoding: "utf-8"
skip_lines_start: 3
skip_lines_end: 2
date_format: "%m/%d/%Y"
decimal_separator: "."
columns:
  date: 1
  payee: 2
  amount: 3
default_account: "Assets:Liquid:Checking:BofA"
default_currency: "USD"
negate_amounts: false
```

**Reasoning:**
- 3 lines skipped at start (balance line, blank line, header row)
- 2 lines skipped at end (blank line, ending balance)
- Single `amount` column — positive values are deposits, negative are withdrawals
- Column 4 (Running Bal.) is ignored because it's not mapped

### Example 2: Indian bank with separate debit/credit columns

**Source file** (CSV, 19 header lines and 20 footer lines):

```
...19 lines of bank metadata and headers...
15-01-2024,NEFT TRANSFER,John Doe,,50000.00
16-01-2024,ATM WITHDRAWAL,ATM-Mumbai,10000.00,
18-01-2024,UPI PAYMENT,Amazon,2500.00,
...20 lines of footer...
```

**Rule:**

```yaml
name: "Axis Bank NRE Savings"
separator: ","
encoding: "utf-8"
skip_lines_start: 19
skip_lines_end: 20
date_format: "%d-%m-%Y"
decimal_separator: "."
columns:
  date: 1
  memo: 2
  payee: 3
  amount_debit: 4
  amount_credit: 5
default_account: "Assets:Liquid:Savings:AxisBank:NRE"
default_currency: "INR"
negate_amounts: false
```

**Reasoning:**
- Uses separate `amount_debit` (column 4) and `amount_credit` (column 5) instead of a single amount
- Date format is day-month-year (`%d-%m-%Y`)
- Two text fields are captured: `memo` for the transfer type and `payee` for the counterparty

### Example 3: XLS file with sheet name selection

**Source file** (XLSX with a sheet named "Statement"):

```
...18 rows of bank metadata and headers...
Row 19: | Sl.No | Date       | Memo          | Particulars | DR        | CR        | Balance   |
Row 20: | 1     | 15-01-2024 | NEFT TRANSFER | John Doe    |           | 50,000.00 | 1,50,000  |
Row 21: | 2     | 16-01-2024 | ATM WDL       | ATM-Mumbai  | 10,000.00 |           | 1,40,000  |
...28 footer rows...
```

**Rule:**

```yaml
name: "Axis Bank NRO"
sheet_name: "Statement"
skip_lines_start: 18
skip_lines_end: 28
date_format: "%d-%m-%Y"
columns:
  date: 2
  payee: 4
  memo: 3
  amount_debit: 5
  amount_credit: 6
default_account: "Assets:Liquid:Savings:AxisBank:NRO"
default_currency: "INR"
```

**Reasoning:**
- Uses `sheet_name` to select the "Statement" sheet (ignoring other sheets in the workbook)
- Column 1 (Sl.No) and column 7 (Balance) are not mapped and are ignored
- No `separator` or `encoding` fields — those are CSV-only

### Example 4: XLS file with abbreviated month dates

**Source file** (XLS):

```
...17 rows of headers...
Row 18: | ... | ... | ... | 15/Jan/2024 | ... | Transaction details | Payee name | 5,000.00 |          | ... |
...37 footer rows...
```

**Rule:**

```yaml
name: "ICICI Bank Current Account"
sheet_index: 0
skip_lines_start: 17
skip_lines_end: 37
date_format: "%d/%b/%Y"
columns:
  date: 4
  memo: 6
  payee: 7
  amount_debit: 8
  amount_credit: 9
default_account: "Assets:Liquid:Checking:ICICI"
default_currency: "INR"
```

**Reasoning:**
- Uses `%b` token for abbreviated month name (Jan, Feb, etc.)
- Data columns start at column 4 — earlier columns are not needed
- High `skip_lines_end: 37` because this bank puts extensive disclaimers after the data

### Example 5: Credit card with negated amounts

**Source file** (CSV):

```
Transaction Date,Posted Date,Description,Amount
01/15/2024,01/16/2024,Restaurant,45.00
01/18/2024,01/19/2024,Payment Received,-500.00
```

In this file, charges (money you spent) are **positive** and payments are **negative** — the opposite of what Beancount expects for a liability account.

**Rule:**

```yaml
name: "Chase Credit Card"
separator: ","
encoding: "utf-8"
skip_lines_start: 1
date_format: "%m/%d/%Y"
columns:
  date: 1
  payee: 3
  amount: 4
default_account: "Liabilities:CreditCard:Chase"
default_currency: "USD"
negate_amounts: true
```

**Reasoning:**
- `negate_amounts: true` flips all signs so that charges become negative (money out from your perspective) and payments become positive
- Column 2 (Posted Date) is ignored — only the transaction date is mapped
- `skip_lines_start: 1` skips just the header row

---

## Step-by-step guide: writing a new rule

Follow these steps when creating a rule for a new bank export format:

1. **Get a sample file.** Export or download a statement from your bank.

2. **Open and inspect the file.** For CSV, open in a text editor. For XLS/XLSX, open in a spreadsheet application.

3. **Identify the data region.**
   - Count lines from the top until the first transaction row → `skip_lines_start`
   - Count lines from the bottom after the last transaction row → `skip_lines_end`
   - For XLS with multiple sheets, note the sheet name or index

4. **Identify the columns.** For each column in the data, determine if it contains a date, amount, payee, description, or other information. Note the 1-based column index.

5. **Determine the amount scheme.**
   - If there's a single column with positive and negative values → use `amount`
   - If debits and credits are in separate columns → use `amount_debit` and `amount_credit`

6. **Check the date format.** Look at how dates are written and construct a format string using the [tokens table](#supported-tokens).

7. **Check the number format.** Is the decimal separator a period or comma? Does the file use accounting-style parentheses for negatives?

8. **Determine the Beancount account.** This is the account in your chart of accounts that represents this bank account (e.g., `Assets:Bank:Checking`, `Liabilities:CreditCard:Amex`).

9. **Create the rule file.** You have two options:
   - **From the UI:** Go to **Settings > Import Rules** and create the rule there. The file is automatically saved to the correct directory.
   - **Manually:** Write a YAML file and place it in the appropriate config directory — `config/csv_rules/` for CSV rules or `config/xls_rules/` for XLS rules. Use a descriptive filename like `bankname-accounttype.yaml`. Start with the [quick start](#quick-start) template and fill in your values.

10. **Reload and test.** If you created the rule manually (or edited it outside the UI), go to the relevant import tab (CSV Import or XLS Import) and click the **Reload rules** button to pick up the new file. Then select the rule, import the sample file, and verify that dates, amounts, and payees are parsed correctly. Adjust `skip_lines_start`/`skip_lines_end` if rows are missing or garbage rows appear.

---

## Validation rules

The system validates rules when they are loaded. A rule is invalid if:

- `name` is missing
- `columns` is missing or empty
- `columns.date` is missing
- Neither `columns.amount` nor both `columns.amount_debit` and `columns.amount_credit` are specified
- Both `columns.amount` and `columns.amount_debit`/`columns.amount_credit` are specified (mutually exclusive)
- `default_account` is missing
- A CSV-only field (`separator`, `encoding`) appears in an XLS rule, or vice versa (`sheet_index`, `sheet_name` in a CSV rule)

Invalid rule files are reported in the UI with an error message but do not prevent other valid rules from loading.

---

## AI agent instructions

This section is for AI coding agents creating import rules from sample files.

### Given a CSV file

1. Read the first 30–50 lines and last 10–20 lines of the file to understand the structure.
2. Identify the header/metadata region at the top. Count the exact number of lines before the first data row (including the column header row) → `skip_lines_start`.
3. Identify any footer/summary region at the bottom. Count those lines → `skip_lines_end`.
4. Look at the column header row to identify which columns contain: date, payee/description, amount (or debit/credit), memo/reference.
5. Map each relevant column to its 1-based index.
6. Examine several date values to determine the format. Build the `date_format` string.
7. Examine amount values to determine `decimal_separator` (`.` or `,`) and whether amounts need negating.
8. Ask the user for `default_account` and `default_currency` if not obvious from context.
9. Write the rule as a YAML file. Use a descriptive filename like `bankname-accounttype.yaml`.

### Given an XLS/XLSX file

Same as CSV, with these differences:
- Note the sheet name or index where transaction data lives.
- Use `sheet_name` (preferred) or `sheet_index` instead of `separator`/`encoding`.
- Column indices are still 1-based, corresponding to spreadsheet column letters (A=1, B=2, etc.).

### Rule output format

```yaml
name: "<Bank Name> <Account Type>"
# Include separator and encoding only for CSV rules:
separator: ","
encoding: "utf-8"
# Include sheet_index or sheet_name only for XLS rules:
# sheet_index: 0
# sheet_name: "Statement"
skip_lines_start: <number>
skip_lines_end: <number>
date_format: "<format string>"
decimal_separator: "."
columns:
  date: <column index>
  # Use ONE of these amount schemes:
  amount: <column index>
  # OR:
  # amount_debit: <column index>
  # amount_credit: <column index>
  payee: <column index>
  narration: <column index>    # if a separate description column exists
  memo: <column index>         # if a memo/reference column exists
default_account: "<Beancount account path>"
default_currency: "<currency code>"
negate_amounts: false
```
