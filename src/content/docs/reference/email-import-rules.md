---
title: Email Import Rules
description: Complete reference for email-based transaction import rules — IMAP configuration, email matching, regex and AI extraction, and worked examples.
sidebar:
  order: 4
---

Email import rules tell FinzyTrack how to connect to an email account, find transaction alert emails from your bank, and extract transaction data from them. Each rule is a YAML file that covers one bank account — it defines the IMAP connection, which emails to match, and how to extract fields like amount, date, and payee from the email body.

Rules live in your config directory at `config/email_rules/*.yaml`.

---

## How it works

The email import pipeline has four stages:

1. **Fetch** — Connect to your IMAP server and search for emails from the configured bank sender addresses within the lookback period.
2. **Match** — For each fetched email, check it against the transaction types defined in the rule. The first type whose `email_filter` matches wins.
3. **Extract** — Pull transaction fields (amount, date, payee, reference) from the matched email using either regex patterns or an AI/LLM.
4. **Import** — The extracted transactions are categorized and presented for review. You can inspect, adjust, and correct both the extracted data and the assigned categories before committing anything to your Beancount ledger.

---

## Quick start

Here is a minimal email rule that imports debit alerts from a bank:

```yaml
metadata:
  name: "My Bank Alerts"
  beancount_account: "Assets:Bank:Checking"
  default_currency: "USD"

imap_server:
  server: "imap.gmail.com"
  port: 993
  username: "${IMAP_USERNAME}"
  password: "${IMAP_PASSWORD}"

bank_emails:
  - "alerts@mybank.com"

transaction_types:
  - name: "Debit"
    email_filter:
      subject_regex: "Debit.*Alert"
    extraction:
      amount:
        pattern: 'amount of \$\s?([\d,]+\.\d{2})'
        type: "float"
        cleanup: "remove_commas"
      timestamp:
        pattern: 'on (\d{2}/\d{2}/\d{4})'
        type: "datetime"
        format: "%m/%d/%Y"
      payee:
        pattern: 'to ([A-Za-z0-9 ]+)'
        type: "string"
        optional: true
    mapping:
      amount: "amount"
      timestamp: "date"
      payee: "payee"
    amount_sign:
      field: "fixed"
      value: "negative"
    error_handling:
      required_fields: ["amount", "timestamp"]
```

The sections below cover every field and option.

---

## Rule file structure

An email rule YAML file has these top-level sections:

| Section | Required | Description |
|---|---|---|
| `metadata` | **yes** | Display name, Beancount account, currency |
| `imap_server` | **yes** | IMAP connection credentials |
| `bank_emails` | **yes** | Sender addresses to match |
| `transaction_types` | **yes** | List of email formats to match and extract |
| `lookback_days` | no | Override the global lookback period |
| `body_keyword` | no | Server-side IMAP pre-filter |
| `parsing_mode` | no | Default extraction mode for this account (`"regex"` or `"ai"`) |

---

## metadata

Account-level information displayed in the UI.

```yaml
metadata:
  name: "Axis Bank NRE"
  beancount_account: "Assets:Liquid:Savings:AxisBank:NRE"
  default_currency: "INR"
  institution: "Axis Bank"              # optional, informational
  description: "NRE savings alerts"     # optional, informational
  version: "1.0"                        # optional
```

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | **yes** | — | Human-readable label shown in the UI |
| `beancount_account` | **yes** | — | Target Beancount account for imported transactions |
| `default_currency` | no | `"USD"` | Currency code for all transactions |
| `institution` | no | `""` | Bank/institution name (informational only) |
| `description` | no | `""` | Description (informational only) |
| `version` | no | `"1.0"` | Schema version |

---

## imap_server

IMAP connection details for fetching emails. Credentials support environment variable expansion using `${VAR_NAME}` syntax — this keeps secrets out of the YAML file.

```yaml
imap_server:
  server: "imap.gmail.com"
  port: 993
  username: "${IMAP_USERNAME}"
  password: "${IMAP_PASSWORD}"
  folder: "INBOX"
```

| Field | Required | Default | Description |
|---|---|---|---|
| `server` | **yes** | — | IMAP server hostname |
| `port` | no | `993` | IMAP port (993 = SSL/TLS) |
| `username` | **yes** | — | IMAP username (use `${ENV_VAR}` for secrets) |
| `password` | **yes** | — | IMAP password or app password (use `${ENV_VAR}` for secrets) |
| `folder` | no | `"INBOX"` | IMAP folder to search |

### Environment variable expansion

Use `${VAR_NAME}` syntax to reference environment variables:

```yaml
username: "${FASTMAIL_EMAIL_USERNAME}"
password: "${FASTMAIL_EMAIL_PASSWORD}"
```

You can set these variables in either of two ways:

- **`config/.env` file (recommended):** Create a `config/.env` file and add your variables there. This file is automatically loaded at backend startup.
  ```
  FASTMAIL_EMAIL_USERNAME=you@example.com
  FASTMAIL_EMAIL_PASSWORD=your-app-password
  ```
- **Shell environment:** Export the variables in your shell before starting the backend.
  ```bash
  export FASTMAIL_EMAIL_USERNAME="you@example.com"
  export FASTMAIL_EMAIL_PASSWORD="your-app-password"
  ```

The `config/.env` approach is preferred because the values persist across restarts without needing to re-export them each time.

If a variable is not set, the rule still loads (for offline use) but IMAP connections will fail. The UI shows a warning for unset credentials.

### Common IMAP servers

| Provider | Server | Notes |
|---|---|---|
| Gmail | `imap.gmail.com` | Requires app password (not regular password) |
| Fastmail | `imap.fastmail.com` | Requires app password |
| Outlook/Hotmail | `outlook.office365.com` | Requires app password |

### IMAP folder

If you filter bank emails into a specific folder (recommended for performance), set `folder` to that folder name:

```yaml
folder: "Finalerts"       # a custom folder
folder: "INBOX"           # default
folder: "INBOX.Alerts"    # subfolder (format varies by server)
```

---

## bank_emails

A list of sender email addresses to match. An incoming email matches this rule if its `From` address contains any of these strings (case-insensitive substring match).

```yaml
bank_emails:
  - "alerts@mybank.com"
  - "noreply@mybank.com"
```

You can also include forwarding addresses if you forward bank SMS alerts to email:

```yaml
bank_emails:
  - "customercare@icicibank.com"
  - "myself@example.com"           # self-forwarded SMS alerts
```

---

## body_keyword

An optional plain-text string used for **server-side** IMAP pre-filtering. This is added to the IMAP `SEARCH` command as a `BODY "..."` filter, so only emails containing this string are downloaded.

```yaml
body_keyword: "XX7317"    # masked account number
```

This is useful when you receive many emails from the same bank but only want those mentioning a specific account. It significantly reduces the number of emails fetched.

**Note:** This is a plain string, not a regex. It is matched by the IMAP server, not by FinzyTrack.

---

## lookback_days

Override the global lookback period (default: 7 days) for this account. Controls how far back the IMAP search goes.

```yaml
lookback_days: 30    # fetch emails from the last 30 days
```

The lookback period is resolved with this priority (highest first): **UI date range** > **account-level rule** > **global config default**. When you set a custom date range in the Email Import tab, it overrides the `lookback_days` value entirely.

---

## parsing_mode

The default extraction mode for all transaction types in this rule. Can be overridden per transaction type.

```yaml
parsing_mode: "regex"    # or "ai"
```

| Value | Description |
|---|---|
| `"regex"` | Extract fields using regex patterns defined in `extraction` (default) |
| `"ai"` | Send the email to a configured LLM, which returns structured transaction data |

The mode is resolved with this priority (highest first): **UI selection** > **transaction type** > **account** > **global config**. When you select a parsing mode in the Email Import tab, it overrides all rule-level settings for that fetch.

---

## transaction_types

The core of an email rule. Each entry defines one format of transaction email from this bank. A single bank often sends different email formats for different transaction types (UPI debits, NEFT credits, credit card charges, etc.), and each needs its own matching and extraction rules.

```yaml
transaction_types:
  - name: "UPI_Debit"
    description: "UPI payment sent"
    email_filter: { ... }
    extraction: { ... }
    mapping: { ... }
    amount_sign: { ... }
    error_handling: { ... }

  - name: "UPI_Credit"
    description: "UPI payment received"
    email_filter: { ... }
    extraction: { ... }
    mapping: { ... }
    amount_sign: { ... }
    error_handling: { ... }
```

**Matching order:** Transaction types are tested in the order they appear. The **first match wins** — once an email matches a type's `email_filter`, no further types are tested. Order your types from most specific to least specific.

### Transaction type fields

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | **yes** | — | Identifier for this transaction type (used in logs and `source_rule`) |
| `description` | no | `""` | Human-readable description |
| `version` | no | `"1.0"` | Schema version |
| `parsing_mode` | no | — | Override the account/global parsing mode for this type |
| `email_filter` | no | match all | Regex filters to identify this email format |
| `extraction` | no | `{}` | Regex patterns to extract fields (used in regex mode) |
| `mapping` | no | `{}` | Map extracted field names to output field names (used in regex mode) |
| `amount_sign` | no | — | How to determine the sign (debit/credit) of the amount |
| `error_handling` | no | see below | Required fields and partial match behavior |

### email_filter

Regex filters that determine whether an email matches this transaction type. Both filters are case-insensitive. If a filter is omitted, it matches all emails.

```yaml
email_filter:
  subject_regex: "was debited from your"
  body_regex: "XX7317"
```

| Field | Required | Description |
|---|---|---|
| `subject_regex` | no | Regex tested against the email subject line |
| `body_regex` | no | Regex tested against the email body (plain text) |

Both are standard regex patterns (not just plain strings). If both are specified, both must match.

#### Tips for writing email filters

- Use `subject_regex` as the primary discriminator — it's the most reliable way to distinguish email formats from the same bank.
- Use `body_regex` to further narrow matches, e.g., to a specific account number (`"XX7317"`) when you have multiple accounts at the same bank.
- Patterns are tested with `re.search()`, so they match anywhere in the text (no need for `.*` at the start/end).
- Invalid regex patterns are logged as errors and treated as non-matching (the type is effectively disabled, not the whole rule).

### extraction

Defines how to extract transaction fields from the email using regex patterns. Each key is a field name you choose (used in the `mapping` section), and each value describes how to find and parse that field.

```yaml
extraction:
  amount:
    pattern: 'Amount Debited:\s+INR ([\d,]+\.\d+)'
    type: "float"
    source: "body"
    cleanup: "remove_commas"
  timestamp:
    pattern: 'Date & Time:\s+(\d{2}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2}) IST'
    type: "datetime"
    source: "body"
    format: "%d-%m-%y, %H:%M:%S"
    timezone: "+05:30"
  payee:
    pattern: 'to ([A-Za-z0-9 ]+)'
    type: "string"
    source: "body"
    optional: true
  reference:
    pattern: 'UPI/P2[A-Z]/([0-9]+)/'
    type: "string"
    source: "body"
    optional: true
```

**This section is only used in regex parsing mode.** When using AI parsing mode, `extraction` can be empty or omitted — see [AI parsing mode](#ai-parsing-mode).

#### Extraction field options

| Field | Required | Default | Description |
|---|---|---|---|
| `pattern` | yes* | — | Regex with exactly **one capture group** `(...)`. *Not needed if `source` is `email_header_date` |
| `type` | no | `"string"` | Data type: `string`, `float`, `integer`, or `datetime` |
| `source` | no | `"body"` | Where to search: `body`, `subject`, or `email_header_date` |
| `cleanup` | no | — | Post-extraction cleanup: `"remove_commas"` or `"strip_whitespace"` |
| `multiline` | no | `false` | If `true`, `.` in the regex matches newlines (enables `re.DOTALL`) |
| `optional` | no | `false` | If `true`, a missing match does not cause an extraction error |
| `format` | conditional | — | **Required** when `type` is `datetime` and `source` is `body` or `subject`. Python strptime format string |
| `timezone` | no | — | Timezone offset for datetime fields, e.g., `"+05:30"`, `"-08:00"` |

#### Capture group rule

Every `pattern` must have exactly **one** capture group — the parenthesized portion `(...)` that captures the value you want. The rest of the pattern is context that helps locate the value but is not extracted.

```yaml
# Good: one capture group around the amount
pattern: 'Amount Debited:\s+INR ([\d,]+\.\d+)'
#                                ^^^^^^^^^^^^^^^^ captured

# Bad: no capture group
pattern: 'Amount Debited:\s+INR [\d,]+\.\d+'

# OK: non-capturing groups (?:...) don't count
pattern: 'amount of (?:USD|\$)\s?([\d,]+\.\d{2})'
#                    ^^^^^^^^^^^ non-capturing (OK)
#                                ^^^^^^^^^^^^^^^^ captured
```

#### Field types

| Type | Description | Example input | Result |
|---|---|---|---|
| `string` | Plain text after optional cleanup | `"ACME Corp"` | `"ACME Corp"` |
| `float` | Decimal number (stored as `Decimal` for precision) | `"1,234.56"` | `Decimal('1234.56')` (with `remove_commas` cleanup) |
| `integer` | Whole number | `"42"` | `42` |
| `datetime` | Date/time parsed via strptime `format` | `"15-01-24, 14:30:00"` | `datetime(2024, 1, 15, 14, 30)` |

#### Source types

| Source | Description |
|---|---|
| `body` | Search the email body (HTML is converted to plain text before matching) |
| `subject` | Search the email subject line |
| `email_header_date` | Use the email's `Date` header directly as a datetime — no pattern or format needed |

Using `email_header_date` is a fallback for emails that don't contain a transaction date in the body:

```yaml
timestamp:
  source: "email_header_date"
  type: "datetime"
```

#### Cleanup functions

| Value | Description | Example |
|---|---|---|
| `remove_commas` | Remove all commas | `"1,234,567.89"` → `"1234567.89"` |
| `strip_whitespace` | Trim leading/trailing whitespace | `"  ACME Corp  "` → `"ACME Corp"` |

#### Datetime format and timezone

For `datetime` fields extracted from `body` or `subject`, you must provide a `format` string using Python strptime tokens:

```yaml
timestamp:
  pattern: 'on (\d{2}/\d{2}/\d{4})'
  type: "datetime"
  format: "%d/%m/%Y"
  timezone: "+05:30"
```

Common format tokens:

| Token | Meaning | Example |
|---|---|---|
| `%Y` | 4-digit year | `2024` |
| `%y` | 2-digit year | `24` |
| `%m` | Month (01–12) | `03` |
| `%d` | Day (01–31) | `15` |
| `%b` | Abbreviated month name | `Mar` |
| `%H` | Hour 24h (00–23) | `14` |
| `%I` | Hour 12h (01–12) | `02` |
| `%M` | Minute (00–59) | `30` |
| `%S` | Second (00–59) | `45` |
| `%p` | AM/PM | `PM` |

The `timezone` field is a UTC offset string (e.g., `"+05:30"` for IST, `"-08:00"` for PST). If omitted, the datetime is treated as naive (no timezone).

### mapping

Maps extracted field names to the output field names expected by the import pipeline. Most entries follow the pattern `extraction_field: "output_field"`, but two special keys (`external_id_type` and `payee_template`) behave differently — see below.

```yaml
mapping:
  amount: "amount"            # extraction field "amount" → output field "amount"
  timestamp: "date"           # extraction field "timestamp" → output field "date"
  payee_raw: "payee"          # extraction field "payee_raw" → output field "payee"
  reference: "external_id"    # extraction field "reference" → output field "external_id"
  external_id_type: "UPI"     # special key — sets output "external_id_type" to literal "UPI"
  payee_template: "{payee_raw} ({reference})"  # special key — fallback if payee is empty
```

#### Regular entries

For most entries, the key is an extraction field name (matching a key in `extraction`) and the value is the output field name to map it to.

#### Output fields

| Output field | Description |
|---|---|
| `amount` | Transaction amount (sign applied by `amount_sign`) |
| `date` | Transaction date. Falls back to the email header date if not mapped |
| `payee` | Counterparty name |
| `external_id` | Unique transaction reference (used for duplicate detection) |
| `masked_account` | Masked account number from the email (e.g., `"XX7317"`) |

#### Special key: `external_id_type`

The key `external_id_type` is a special case. It does **not** refer to an extraction field. Instead, the value is used as a literal string and assigned directly to the `external_id_type` output field. This labels what kind of reference the `external_id` is:

```yaml
mapping:
  reference: "external_id"      # map extracted "reference" → output "external_id"
  external_id_type: "UPI"       # set output "external_id_type" to literal string "UPI"
```

Common values: `"UPI"`, `"NEFT"`, `"IMPS"`, `"CARD"`.

#### Special key: `payee_template`

The key `payee_template` is another special case. Its value is a Python format string used as a **fallback** when the primary payee mapping produces an empty value. The template can reference any extraction field name:

```yaml
mapping:
  payee_raw: "payee"
  payee_template: "{payee_raw}_{reference}"    # fallback if payee_raw is empty
```

The template uses Python `str.format()` syntax. It is only evaluated when the primary payee is empty.

**This section is only used in regex parsing mode.** When using AI parsing mode, `mapping` can be empty or omitted — see [AI parsing mode](#ai-parsing-mode).

### amount_sign

Determines whether the extracted amount should be positive (credit/deposit) or negative (debit/withdrawal). Amounts extracted from emails are always treated as absolute values — `amount_sign` applies the direction.

#### Fixed sign

Use when a transaction type is always a debit or always a credit:

```yaml
amount_sign:
  field: "fixed"
  value: "negative"     # always a debit (money out)
```

```yaml
amount_sign:
  field: "fixed"
  value: "positive"     # always a credit (money in)
```

#### Field-based sign

Use when the same email format can be either a debit or credit, and a field in the email indicates which:

```yaml
extraction:
  direction:
    pattern: 'XX815\s+(?:is\s+)?(debited|credited)'
    type: "string"

amount_sign:
  field: "direction"
  negative_values: ["debited"]
  positive_values: ["credited"]
```

The extracted field value is matched case-insensitively against the lists. If it matches a `negative_values` entry, the amount becomes negative; if it matches `positive_values`, it becomes positive.

**This section is used in both regex and AI parsing modes.** In AI mode, when `field` is `"fixed"`, it overrides the LLM's own debit/credit inference.

### error_handling

Controls which fields are required and how to handle partial extraction failures.

```yaml
error_handling:
  required_fields: ["amount", "timestamp"]
  partial_match_allowed: true
```

| Field | Default | Description |
|---|---|---|
| `required_fields` | `["amount", "timestamp"]` | List of extraction field names that must be present. If any are missing, the email is rejected |
| `partial_match_allowed` | `true` | If `true`, emails with some optional fields missing are still accepted. Also enables fallback to the email's Message-ID as `external_id` when no reference is extracted |

The field names in `required_fields` refer to your extraction field names (the keys in `extraction`), not the mapped output names.

---

## AI parsing mode

When `parsing_mode` is `"ai"`, the email subject and body are sent to a configured LLM, which returns structured transaction data directly. This is useful when email formats are too varied or complex for reliable regex patterns.

### What the LLM extracts

The LLM returns a JSON object with these fields:

| Field | Type | Description |
|---|---|---|
| `amount` | number | Positive absolute value |
| `is_debit` | boolean | `true` if money left the account |
| `payee` | string or null | Counterparty name |
| `date` | string or null | Transaction date as `YYYY-MM-DD` |
| `reference` | string or null | Transaction reference/ID |
| `masked_account` | string or null | Masked account number |

### Minimum rule content for AI mode

When using AI parsing, the `extraction` and `mapping` sections are **not used** — the LLM handles all field extraction. A transaction type needs only:

```yaml
transaction_types:
  - name: "Debit"
    parsing_mode: "ai"
    email_filter:
      subject_regex: "Debit.*Alert"
    amount_sign:
      field: "fixed"
      value: "negative"
    error_handling:
      required_fields: ["amount", "timestamp"]
```

**Required for AI mode:**
- `name` — always required
- `email_filter` — still needed to match emails to this type (the LLM only extracts; it doesn't decide which emails to process)

**Optional but recommended for AI mode:**
- `amount_sign` with `field: "fixed"` — overrides the LLM's `is_debit` inference. Useful when the transaction type is always a debit or always a credit, since you're already filtering by subject
- `error_handling` — `required_fields` still apply to the LLM output

**Not used in AI mode:**
- `extraction` — can be omitted or empty
- `mapping` — can be omitted or empty

### When to use AI vs regex

| Factor | Regex | AI |
|---|---|---|
| **Email format** | Consistent, structured text with predictable patterns | Variable format, free-form text, or complex layouts |
| **Reliability** | Highly deterministic — same input always gives same output | May vary between LLM calls; better for "good enough" extraction |
| **Speed** | Fast (local regex matching) | Slower (API call per email) |
| **Cost** | Free | LLM API costs per email |
| **Setup effort** | Higher — requires writing and testing regex patterns | Lower — just configure the filter and sign |
| **Maintenance** | May break if bank changes email format | More resilient to minor format changes |

You can mix modes within the same rule — set `parsing_mode: "regex"` at the account level and override specific transaction types with `parsing_mode: "ai"`, or vice versa.

---

## Complete examples

### Example 1: UPI debit alerts with regex extraction

A bank sends emails with subject "Your account was debited" containing structured text like:

```
Amount Debited: INR 2,500.00
Account Number: XX7317
Date & Time: 15-01-26, 14:30:00 IST
UPI/P2M/109348018106/ACME_STORE/
```

**Rule (one transaction type shown):**

```yaml
metadata:
  name: "Axis Bank NRE"
  beancount_account: "Assets:Liquid:Savings:AxisBank:NRE"
  default_currency: "INR"
  institution: "Axis Bank"

imap_server:
  server: "imap.fastmail.com"
  port: 993
  username: "${FASTMAIL_EMAIL_USERNAME}"
  password: "${FASTMAIL_EMAIL_PASSWORD}"
  folder: "Finalerts"

lookback_days: 7

bank_emails:
  - "alerts@axis.bank.in"

body_keyword: "XX7317"

transaction_types:
  - name: "UPI_Debit"
    description: "UPI debit transactions"
    email_filter:
      subject_regex: "was debited from your"
      body_regex: "XX7317"
    extraction:
      amount:
        pattern: 'Amount Debited:\s+INR ([\d,]+\.\d+)'
        type: "float"
        cleanup: "remove_commas"
      timestamp:
        pattern: 'Date & Time:\s+(\d{2}-\d{2}-\d{2}, \d{2}:\d{2}:\d{2}) IST'
        type: "datetime"
        format: "%d-%m-%y, %H:%M:%S"
        timezone: "+05:30"
      reference:
        pattern: 'UPI/P2[A-Z]/([0-9]+)/'
        type: "string"
        optional: true
      payee_raw:
        pattern: 'UPI/P2[A-Z]/[0-9]+/([^/\n]+)'
        type: "string"
        cleanup: "strip_whitespace"
        optional: true
      masked_account:
        pattern: 'Account Number:\s+(XX\w+)'
        type: "string"
        optional: true
    mapping:
      reference: "external_id"
      external_id_type: "UPI"
      payee_raw: "payee"
      timestamp: "date"
      amount: "amount"
    amount_sign:
      field: "fixed"
      value: "negative"
    error_handling:
      required_fields: ["amount", "timestamp"]
      partial_match_allowed: true
```

**Reasoning:**
- `body_keyword: "XX7317"` pre-filters at the IMAP server so only emails mentioning this account are downloaded
- `email_filter.body_regex` further confirms the account number in FinzyTrack
- `reference` and `payee_raw` are optional because some UPI emails may not include them
- `external_id_type: "UPI"` is a literal value (not an extracted field) — it labels the reference for duplicate detection
- `amount_sign.field: "fixed"` and `value: "negative"` because this type is always a debit

### Example 2: Debit and credit in one rule with field-based sign

Some banks use a single email format for both debits and credits, with a word like "debited" or "credited" in the body. You can handle this with field-based `amount_sign`:

```
Acct XX815 debited Rs 18400.00 on 28-Mar-26; WAKE FIT INNOVA credited. UPI:184324769423
```

```yaml
transaction_types:
  - name: "Finalert_UPI"
    description: "UPI debit/credit via forwarded SMS alerts"
    email_filter:
      subject_regex: "Finalert"
      body_regex: 'UPI:\d+'
    extraction:
      amount:
        pattern: 'Rs\s*([\d.]+)'
        type: "float"
      direction:
        pattern: 'XX815\s+(?:is\s+)?(debited|credited)'
        type: "string"
      payee_raw:
        pattern: '\d{2}-[A-Za-z]{3}-\d{2}[;. ]+(?:from\s+)?([A-Za-z][A-Za-z ]+?)\s*(?:credited|\.|\s+UPI:)'
        type: "string"
        cleanup: "strip_whitespace"
        optional: true
      reference:
        pattern: 'UPI:(\d+)'
        type: "string"
        optional: true
      timestamp:
        pattern: 'on (\d{2}-[A-Za-z]{3}-\d{2})'
        type: "datetime"
        format: "%d-%b-%y"
        timezone: "+05:30"
    mapping:
      reference: "external_id"
      external_id_type: "UPI"
      payee_raw: "payee"
      timestamp: "date"
      amount: "amount"
    amount_sign:
      field: "direction"
      negative_values: ["debited"]
      positive_values: ["credited"]
    error_handling:
      required_fields: ["amount", "timestamp", "direction"]
      partial_match_allowed: true
```

**Reasoning:**
- `direction` is extracted from the email body and used by `amount_sign` to determine the sign
- `direction` is added to `required_fields` because the amount is meaningless without knowing the sign
- The `email_filter.body_regex` matches `UPI:\d+` to distinguish UPI transactions from NEFT or other types in the same Finalert format

### Example 3: Multiple transaction types for one bank

A real-world rule often has several transaction types to handle different email formats from the same bank. Here's a condensed example showing four types:

```yaml
metadata:
  name: "Axis Bank NRE"
  beancount_account: "Assets:Liquid:Savings:AxisBank:NRE"
  default_currency: "INR"

imap_server:
  server: "imap.fastmail.com"
  port: 993
  username: "${FASTMAIL_EMAIL_USERNAME}"
  password: "${FASTMAIL_EMAIL_PASSWORD}"
  folder: "Finalerts"

bank_emails:
  - "alerts@axis.bank.in"

body_keyword: "XX7317"

transaction_types:
  - name: "UPI_Debit"
    email_filter:
      subject_regex: "was debited from your"
      body_regex: "XX7317"
    # ... extraction, mapping, amount_sign (negative)

  - name: "UPI_Credit"
    email_filter:
      subject_regex: "was credited to your"
      body_regex: "XX7317"
    # ... extraction, mapping, amount_sign (positive)

  - name: "NEFT_Debit"
    email_filter:
      subject_regex: "Debit transaction alert"
      body_regex: "XX7317"
    # ... different extraction patterns, amount_sign (negative)

  - name: "NEFT_Credit"
    email_filter:
      subject_regex: "Credit transaction alert"
      body_regex: "XX7317"
    # ... different extraction patterns, amount_sign (positive)
```

**Key points:**
- All four types share the same `bank_emails` and `body_keyword`
- Each type has a unique `subject_regex` to distinguish the email format
- UPI and NEFT emails have different body layouts, so each needs its own `extraction` patterns
- The types are ordered most-specific-first so matching works correctly

### Example 4: AI parsing mode

A minimal rule where the LLM handles all extraction:

```yaml
metadata:
  name: "My Bank Alerts"
  beancount_account: "Assets:Bank:Checking"
  default_currency: "USD"

imap_server:
  server: "imap.gmail.com"
  port: 993
  username: "${IMAP_USERNAME}"
  password: "${IMAP_PASSWORD}"

bank_emails:
  - "alerts@mybank.com"

parsing_mode: "ai"

transaction_types:
  - name: "Debit"
    email_filter:
      subject_regex: "Debit"
    amount_sign:
      field: "fixed"
      value: "negative"

  - name: "Credit"
    email_filter:
      subject_regex: "Credit"
    amount_sign:
      field: "fixed"
      value: "positive"
```

No `extraction` or `mapping` needed. The `email_filter` still matches emails to types, and `amount_sign` overrides the LLM's sign inference for reliability.

---

## Step-by-step guide: writing a new rule

### For regex mode

1. **Get sample emails.** Save a few transaction alert emails from your bank as `.eml` files, or note down the subject lines and body text.

2. **Identify the sender address.** Look at the `From` field — this goes in `bank_emails`.

3. **Group email formats.** Look at the different subject lines your bank uses. Each distinct format becomes a `transaction_type`. Common groupings:
   - Debit vs credit
   - UPI vs NEFT vs card transactions
   - Different subject line patterns

4. **Write email filters.** For each transaction type, write a `subject_regex` that uniquely matches that format. Add `body_regex` if needed to distinguish further (e.g., by account number).

5. **Write extraction patterns.** For each field you want to extract:
   - Find the text in the email body
   - Write a regex with one capture group around the value
   - Choose the appropriate `type` and `cleanup`
   - For dates, determine the `format` string and `timezone`
   - Mark fields as `optional: true` if they may not always be present

6. **Write the mapping.** Map your extraction field names to the standard output fields (`amount`, `date`, `payee`, `external_id`).

7. **Set the amount sign.** Use `field: "fixed"` if the type is always debit or credit. Use field-based sign if the email indicates direction.

8. **Configure IMAP.** Set up the server, credentials (via environment variables), and folder.

9. **Create the rule file.** You have two options:
   - **From the UI:** Go to **Settings > Import Rules** and create the rule there. The file is automatically saved to the correct directory.
   - **Manually:** Write a YAML file and place it in `config/email_rules/`. Use a descriptive filename like `bankname-accounttype.yaml`.

10. **Reload and test.** If you created or edited the rule outside the UI, go to the **Email Import** tab and click the **Reload rules** button to pick up the changes. Then use the trial extraction feature to test your rule against sample `.eml` files before running a full fetch.

### For AI mode

1. Follow steps 1–4 above (sender, grouping, filters).
2. Skip steps 5–6 (extraction and mapping).
3. Set `parsing_mode: "ai"` at the account or transaction type level.
4. Set `amount_sign` with `field: "fixed"` for each type where the direction is known from the subject line.
5. Configure IMAP (step 8), create the rule file (step 9), and reload and test (step 10).

---

## Validation rules

A rule file is invalid if:

- `metadata.name` is missing
- `metadata.beancount_account` is missing
- `imap_server.server` is missing
- `imap_server.username` or `imap_server.password` is missing
- `bank_emails` is empty
- A `transaction_type` is missing `name`
- A regex pattern in `email_filter` or `extraction` fails to compile
- An extraction pattern has no capture group (for `body`/`subject` sources)
- A `datetime` extraction field is missing `format` (when source is `body` or `subject`)

Invalid rule files are reported in the UI with an error message but do not prevent other valid rules from loading.

---

## AI agent instructions

This section is for AI coding agents creating email import rules from sample `.eml` files or email body text.

### Workflow

1. **Check existing rules first.** Before creating a new rule, check if the sender already matches an existing rule (use the trial extraction endpoint or check `bank_emails` across all rules). If the sender is known but the email format is new, add a new `transaction_type` to the existing rule rather than creating a new file.

2. **Identify the email format.** Look at:
   - The `From` address → `bank_emails`
   - The `Subject` line → `email_filter.subject_regex`
   - The body structure → `extraction` patterns
   - Whether the email is a debit or credit → `amount_sign`

3. **Write extraction patterns.** For each field:
   - Find a reliable anchor phrase near the value (e.g., `"Amount Debited:"`, `"Date & Time:"`)
   - Write a regex with exactly one capture group around the value
   - Use non-capturing groups `(?:...)` for alternatives
   - Test the pattern against the sample email
   - Mark truly optional fields (payee, reference) as `optional: true`

4. **Ask the user for:**
   - `beancount_account` and `default_currency` (if not obvious)
   - IMAP server details and credential environment variable names
   - IMAP folder name
   - Whether they want regex or AI parsing mode
   - `body_keyword` for server-side filtering (often a masked account number)

5. **Use a descriptive filename** like `bankname-accounttype.yaml` (e.g., `axis-bank-nre-savings.yaml`).

### Rule output format

```yaml
metadata:
  name: "<Bank Name> <Account Type>"
  beancount_account: "<Beancount account path>"
  default_currency: "<currency code>"
  institution: "<Bank Name>"
  description: "<brief description>"

imap_server:
  server: "<imap server>"
  port: 993
  username: "${<ENV_VAR_USERNAME>}"
  password: "${<ENV_VAR_PASSWORD>}"
  folder: "<IMAP folder>"

# lookback_days: 7
bank_emails:
  - "<sender address>"

# body_keyword: "<optional server-side filter>"

transaction_types:
  - name: "<Type_Name>"
    description: "<description>"
    email_filter:
      subject_regex: "<pattern>"
      # body_regex: "<pattern>"
    extraction:
      amount:
        pattern: '<regex with one capture group>'
        type: "float"
        cleanup: "remove_commas"       # if amounts have commas
      timestamp:
        pattern: '<regex with one capture group>'
        type: "datetime"
        format: "<strptime format>"
        timezone: "<offset>"           # e.g. "+05:30"
      payee:
        pattern: '<regex with one capture group>'
        type: "string"
        optional: true
      reference:
        pattern: '<regex with one capture group>'
        type: "string"
        optional: true
    mapping:
      amount: "amount"
      timestamp: "date"
      payee: "payee"
      reference: "external_id"
      external_id_type: "<type label>"  # literal: "UPI", "NEFT", etc.
    amount_sign:
      field: "fixed"
      value: "negative"                 # or "positive"
    error_handling:
      required_fields: ["amount", "timestamp"]
      partial_match_allowed: true
```
