---
title: Configuration
description: Reference for all config.yaml options.
sidebar:
  order: 5
---

Finzytrack is configured via a `config.yaml` file located in the `config/` directory. This file is created automatically on first run from a seed template. Most settings can also be changed through the Settings screen in the app, which writes back to this file.

---

## Ledger File

```yaml
ledger_file: "./data/ledgers/one.beancount"
```

| Field | Type | Default |
|-------|------|---------|
| `ledger_file` | string (file path) | `"./data/ledgers/one.beancount"` |

Path to the main Beancount ledger file. All transactions are stored here. Can be absolute or relative to the working directory. Changing this switches the active ledger without restarting — useful if you maintain separate ledgers.

---

## Accounts

```yaml
accounts:
  default_currency: "USD"
  default_unknown_account: "Expenses:Unknown"
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `default_currency` | string | `"USD"` | Default currency code (e.g., `USD`, `EUR`, `INR`). Used when a currency is not specified during import. |
| `default_unknown_account` | string | `"Expenses:Unknown"` | Fallback account assigned to imported transactions when the category cannot be determined. |

---

## Server

```yaml
server:
  host: "127.0.0.1"
  port: 8001
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `host` | string | `"127.0.0.1"` | Valid network address | Address the backend listens on. Use `0.0.0.0` to allow connections from other devices on the network. |
| `port` | integer | `8000` | 1–65535 | Port the backend listens on. |

:::note
Changing server settings requires a restart to take effect.
:::

---

## AI

The `ai` section controls transaction categorization and AI model settings. All AI features are optional — Finzytrack works fully without any AI configured.

### Categorization

```yaml
ai:
  categorization:
    enabled: true
    engine: "classifier"
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable automatic transaction categorization during import. |
| `engine` | string | `"classifier"` | Which engine to use. See values below. |

**Engine values:**

| Value | Description |
|-------|-------------|
| `"classifier"` | Local scikit-learn classifier trained on your previously categorized transactions. Runs entirely on your machine — no data is sent anywhere. This is the default. |
| `"ai"` | AI-based categorization using your configured LLM (requires the `ai.llm` section to be configured). See [Data Shared with AI](/reference/ai-data-sharing/#autocategorization) for what is sent. |

### LLM

The `ai.llm` section configures the AI model used for natural language features (transaction entry, query generation, file parsing, AI assistant, and AI-based categorization). There are two modes: **Finzytrack AI** (managed service) and **bring-your-own model**.

#### Finzytrack AI

```yaml
ai:
  llm:
    finzytrack_ai: true
    finzytrack_ai_token: "your-token-here"
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `finzytrack_ai` | boolean | `false` | Use the Finzytrack AI managed service. When enabled, all other provider/model fields below are ignored. |
| `finzytrack_ai_token` | string (secret) | `""` | Authentication token for the Finzytrack AI service. |
| `finzytrack_ai_url` | string | `"https://ai.finzytrack.com"` | Finzytrack AI proxy URL. Override only for development or testing. |

When `finzytrack_ai` is `true`, Finzytrack routes AI requests through its server to a cloud model. See [Data Shared with AI](/reference/ai-data-sharing/) for privacy details.

#### Bring Your Own Model

```yaml
ai:
  llm:
    provider: "openai"
    api_url: "http://127.0.0.1:1234"
    api_key: ""
    model: "llama-3.1-8b-instruct"
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `provider` | string | `"openai"` | `"openai"` or `"anthropic"` | LLM provider. Use `"openai"` for any OpenAI-compatible endpoint (OpenAI, LM Studio, Ollama, Groq, etc.) or `"anthropic"` for the Anthropic API directly. |
| `api_url` | string | `""` | Valid URL | API base URL. Only used when `provider` is `"openai"`. Examples: `http://127.0.0.1:1234` (LM Studio), `http://localhost:11434/v1` (Ollama), `https://api.openai.com` (OpenAI). Leave empty for Anthropic. |
| `api_key` | string (secret) | `""` | — | API key. Required for cloud providers (OpenAI, Anthropic, Groq). Leave empty for local LLMs that don't require authentication. |
| `model` | string | `""` | — | Model name. Examples: `gpt-4o`, `claude-sonnet-4-6`, `llama-3.1-8b-instruct`. AI features are disabled when this is empty and `finzytrack_ai` is `false`. |

#### Model Settings (Bring Your Own Only)

These settings apply when using your own model. When Finzytrack AI is enabled, these are controlled by the Finzytrack AI service and any local values are ignored.

```yaml
ai:
  llm:
    temperature: 0.1
    max_tokens: 0
    max_tool_rounds: 12
    timeout_secs: 120
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `temperature` | float | `0.1` | 0.0–2.0 | Sampling temperature. Lower values produce more deterministic output (recommended for parsing and SQL generation). Higher values introduce more variation. |
| `max_tokens` | integer | `0` | >= 0 | Maximum tokens in the LLM response. `0` uses the model's default limit. Anthropic models require a value greater than 0. See [Reasoning Models](/reference/reasoning-models/) for when to raise this. |
| `max_tool_rounds` | integer | `12` | 1–50 | Maximum number of tool-call round-trips per message in the AI assistant. Higher values allow longer multi-step conversations but require models with larger context windows. |
| `timeout_secs` | integer | `120` | 10–600 | Timeout in seconds for LLM API requests. Increase if you experience timeouts with slower models or large inputs. |

When the configured model supports it, the AI Assistant always streams the model's internal reasoning live in a collapsible block. There is no separate setting for this. See [Reasoning Models](/reference/reasoning-models/) for details.

#### Advanced: Extra Request Body (Bring Your Own Only)

```yaml
ai:
  llm:
    extra_request_body:
      chat_template_kwargs:
        enable_thinking: false
      top_p: 0.9
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `extra_request_body` | object \| null | `null` | Provider-specific request parameters to merge into every chat call. Use this to pass options Finzytrack does not expose as first-class fields (for example `top_p`, `frequency_penalty`, `seed`, or vendor-specific switches like `chat_template_kwargs`). |

This is an escape hatch for power users. Whatever object you put here is forwarded to the provider on every request:

- For OpenAI-compatible providers, the keys are sent as additional fields in the request body via the SDK's `extra_body` channel.
- For Anthropic, the keys are merged directly into the SDK call kwargs.

The same object is applied to whichever provider is active. A given setting may be valid for one provider and rejected by another (e.g. `chat_template_kwargs` is meaningless to Anthropic) — if the upstream provider rejects an unknown field, the error is surfaced to you and you can edit the field to remove it.

**Format.** In `config.yaml` the value is a YAML mapping (as shown above). In the **Settings → AI → Advanced** UI it is entered as a JSON object — the two are equivalent and round-trip cleanly. Use whichever is more convenient; if you edit one, the other reflects the change after a reload.

**Ignored under Finzytrack AI.** When `finzytrack_ai: true`, this field is not applied — the managed service controls request parameters and accepts no overrides.

**Protected keys.** Keys that Finzytrack manages itself are silently dropped at request time, with a warning written to the log. These are: `model`, `messages`, `stream`, `tools`, `tool_choice`, `system`, `temperature`, `max_tokens`. To change `temperature` or `max_tokens`, use the dedicated fields above; values placed inside `extra_request_body` for these keys take no effect.

**No validation.** Finzytrack does not check that the keys you set are meaningful for the configured provider — that is between you and the provider's API. The upstream provider's error message will tell you if something is wrong.

**Stored in plaintext.** The contents of this field are written to `config.yaml` unencrypted. Do not paste secrets you would not store on disk.

The field is editable from the **Settings → AI → Advanced** disclosure. It is hidden when Finzytrack AI is enabled, since the managed service ignores it.

A concrete use case: disabling internal reasoning on a vLLM-hosted reasoning model that supports the `enable_thinking` template kwarg — see [Reasoning Models](/reference/reasoning-models/#what-to-try) for when this is appropriate.

---

## Backup

```yaml
backup:
  enabled: true
  retention_count: 100
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `enabled` | boolean | `true` | — | Enable the backup system. When enabled, a backup is created before every write. |
| `retention_count` | integer | `100` | >= 1 | Number of backup versions to keep per file. Older backups are automatically deleted when this limit is exceeded. |

Backups cover all files that Finzytrack writes to: the ledger file, config file, CSV/XLS/email import rules, dashboard recipes, and OFX account mappings. Backups are stored in the `data/backups/` directory.

---

## Logging

```yaml
logging:
  level: "INFO"
  max_file_size_mb: 5
  backup_count: 3
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `level` | string | `"INFO"` | See values below | Application log level. |
| `max_file_size_mb` | integer | `5` | 1–100 | Maximum log file size in megabytes before rotation occurs. |
| `backup_count` | integer | `3` | 0–20 | Number of rotated log files to keep in addition to the current log file. |

**Log levels** (from most to least verbose): `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.

The log file is located at `logs/finzytrack.log`.

---

## Email Import

```yaml
email_import:
  enabled: false
  default_lookback_days: 7
  max_emails: 500
  imap_timeout_secs: 30
  parsing_mode: "regex"
```

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `enabled` | boolean | `false` | — | Enable email import functionality. When disabled, email import endpoints are not available. |
| `default_lookback_days` | integer | `7` | >= 1 | Default number of days to look back when fetching emails. Can be overridden per request. |
| `max_emails` | integer | `500` | >= 1 | Maximum number of emails to fetch per request. Requests exceeding this limit are truncated with a warning. |
| `imap_timeout_secs` | integer | `30` | >= 0 | Socket timeout in seconds for IMAP operations. Set to `0` for no timeout (not recommended — may block indefinitely on network issues). |
| `parsing_mode` | string | `"regex"` | `"regex"` or `"ai"` | Default method for extracting transaction data from emails. `"regex"` uses rule-based extraction; `"ai"` uses the configured LLM. Can be overridden per email account profile. |

Email account credentials (IMAP usernames and passwords) can be stored in `config/.env` as environment variables and referenced from email rule files using `${VAR_NAME}` syntax.

---

## File Locations

These paths are derived from the configuration and are not directly configurable. They are listed here for reference.

| Path | Description |
|------|-------------|
| `config/config.yaml` | Main configuration file |
| `config/.env` | Environment variables (email credentials, etc.) |
| `config/csv_rules/` | CSV import rule files |
| `config/xls_rules/` | Excel (XLS/XLSX) import rule files |
| `config/email_rules/` | Email import account profiles and rules |
| `config/recipes/` | Dashboard and widget recipe files (JSON) |
| `config/ofx_mappings.yaml` | OFX account mappings |
| `data/ledgers/` | Beancount ledger files |
| `data/ledger.db` | SQLite export of the ledger (auto-generated) |
| `data/backups/` | Backups of all files written by Finzytrack |
| `logs/finzytrack.log` | Application log file |

---

## Example config.yaml

A complete configuration file with all defaults shown:

```yaml
setup_complete: true
ledger_file: "./data/ledgers/one.beancount"

accounts:
  default_currency: "USD"
  default_unknown_account: "Expenses:Unknown"

server:
  host: "127.0.0.1"
  port: 8001

ai:
  categorization:
    enabled: true
    engine: "classifier"
  llm:
    finzytrack_ai: false
    provider: "openai"
    api_url: ""
    api_key: ""
    model: ""
    temperature: 0.1
    max_tokens: 0
    max_tool_rounds: 12
    timeout_secs: 120
    extra_request_body: null

backup:
  enabled: true
  retention_count: 100

logging:
  level: "INFO"
  max_file_size_mb: 5
  backup_count: 3

email_import:
  enabled: false
  default_lookback_days: 7
  max_emails: 500
  imap_timeout_secs: 30
  parsing_mode: "regex"
```
