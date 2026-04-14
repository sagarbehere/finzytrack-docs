---
title: Auto-Categorization
description: How automatic transaction categorization works — classifier-based and AI-based engines.
sidebar:
  order: 6
---

When you import transactions, Finzytrack can automatically suggest which expense or income account each transaction belongs to. This is called **auto-categorization**. Two engines are available: a built-in **classifier** trained on your existing ledger, and an **AI engine** that uses your configured language model.

You can choose which engine to use in **Settings > AI > Categorization**.

---

## Classifier Engine

The classifier is a machine-learning model that learns from the categorized transactions already in your ledger. It requires no external services or API calls — everything runs locally.

### How It Works

1. The classifier collects all transactions in your ledger that have an `Expenses:` or `Income:` account and a payee.
2. It combines the payee, memo, and narration of each transaction into a text description and preprocesses it (see technical details below).
3. It trains a [Random Forest](https://en.wikipedia.org/wiki/Random_forest) model using [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) text features — essentially learning which words are associated with which accounts.
4. When new transactions arrive, it preprocesses their descriptions the same way, then predicts the most likely account.

The model is trained fresh each time you run auto-categorization. It is not persisted to disk. See [Technical Details](#technical-details) for more on the algorithm, feature extraction, and confidence calculation.

### Training Requirements

The classifier needs a minimum of **10 categorized transactions** across **at least 2 different accounts** to produce predictions. If your ledger has fewer than this, the classifier will fall back to the default account and show a warning.

### Confidence Scores

Each prediction comes with a confidence score between 0 and 1, representing how certain the classifier is:

| Confidence | Status Column | Meaning |
|-----------|---------------|---------|
| 95% or above | Green circle | High confidence — likely correct |
| 50% to 95% | Indigo circle | Medium confidence — worth reviewing |
| Below 50% | Red circle | Low confidence — probably needs manual correction |

Hover over the icon in the status column to see the exact percentage.

### Accuracy Over Time

The classifier improves as your ledger grows. With only a handful of categorized transactions, predictions will be unreliable. After a few months of regular imports, the classifier typically performs well for recurring merchants and payees.

This approach works especially well for personal finance because most people transact with the same set of merchants repeatedly. Once the classifier has seen a few transactions from a merchant, it reliably categorizes future ones.

---

## AI Engine

The AI engine sends transaction descriptions to your configured language model, which suggests accounts based on its understanding of the payee names and your chart of accounts. This requires [AI to be configured](/quick-start/#configuring-ai).

### How It Works

1. The engine collects all `Expenses:` and `Income:` accounts from your ledger.
2. It batches transactions into groups of up to 20, deduplicating identical descriptions to minimize token usage.
3. For each batch, it sends the transaction descriptions along with the list of valid accounts to the language model.
4. The model returns a suggested account for each transaction.
5. Suggested accounts are validated against your ledger. If the model suggests an account that does not exist, the engine retries up to 2 times, asking the model to correct its answer.
6. If an account is still invalid after retries, the transaction falls back to the default account.

See [Technical Details](#technical-details) for more on batching, deduplication, prompt structure, and the validation/retry flow.

### Confidence Scores

The AI engine does not produce confidence scores. The status column will not show confidence indicators for AI-categorized transactions.

### When to Use AI

The AI engine is useful when:
- You are just starting out and have too few transactions for the classifier to train on.
- You have unusual or one-off transactions that the classifier has not seen before.
- You want to use the language model's general knowledge of merchant names.

The AI engine performs poorly when transaction descriptions lack recognizable merchant names. For example, many UPI transactions in India show the name of an individual rather than a business — a description like *"ICICI Bank Acct XX815 debited for Rs 118.00 on 14-Apr-26; TEJSVINI SWAPNI credited. UPI:201337264625."* gives the AI no useful signal about the category (this was a meal at a small local restaurant). The local classifier, by contrast, would correctly categorize this as `Expenses:EatingOut` if it has seen previous transactions to the same payee. In general, the classifier is stronger for recurring payees with opaque names, while the AI is stronger for first-time payees with descriptive names.

The other trade-off is that AI requires API calls to your configured model, which may be slower and incur costs depending on your provider.

---

## Default Account

When categorization fails or cannot determine a suitable account, the transaction is assigned to the **default account**. By default, this is `Expenses:Unknown`. You can change it in **Settings > General** or in `config.yaml` under `accounts.default_unknown_account`.

Situations where the default account is used:
- Categorization is disabled in settings.
- The classifier has insufficient training data (fewer than 10 transactions or fewer than 2 categories).
- The transaction description is empty after preprocessing (e.g., contains only numbers and special characters).
- The AI engine suggests an account that does not exist (after retries).

---

## Duplicate Detection

Auto-categorization also runs **duplicate detection** alongside the categorization step. Each incoming transaction is compared against your existing ledger using:

- **External ID matching** — if the transaction carries an identifier from the source (e.g., an OFX transaction ID), it is matched against existing transactions with the same ID.
- **Content matching** — transactions with the same date, payee, amount, and account are flagged as potential duplicates.

Duplicates are flagged in the status column of the transaction table. See [Duplicate Detection](/views/import/#duplicate-detection) in the Import view documentation for how to review and resolve them.

---

## Technical Details

<details>
<summary>Classifier engine internals</summary>

**Algorithm:** Random Forest with 100 decision trees, using all available CPU cores for training.

**Feature extraction:** TF-IDF (Term Frequency–Inverse Document Frequency) vectorization converts transaction descriptions into numeric feature vectors. Words that appear frequently in one category but rarely in others receive higher weight.

**Text preprocessing:** Before vectorization, descriptions are cleaned to reduce noise:
- Converted to lowercase
- Specific terms removed (e.g., "aplpay", "com")
- Special characters replaced with spaces
- Words containing numbers removed (e.g., reference numbers, order IDs)
- Single-character words removed
- Multiple spaces collapsed

For example, `"AMAZON.COM Purchase #1234"` becomes `"amazon purchase"`.

**Training data:** The classifier uses transactions from your ledger that have both a payee and an `Expenses:` or `Income:` posting. The payee, memo, and narration are combined into a single text description, and the first matching expense or income account is used as the label.

**Confidence calculation:** The confidence score is the maximum class probability from the Random Forest's `predict_proba` output — essentially, the proportion of the 100 trees that voted for the winning category.

**Stateless training:** The model is built from scratch each time you click Autocategorize. It is not saved to disk. This means it always reflects your latest ledger state, but also means training time scales with ledger size.

</details>

<details>
<summary>AI engine internals</summary>

**Batching:** Transactions are processed in batches of up to 20 per API call. If you import 100 transactions, the engine makes approximately 5 calls (fewer if many transactions share the same description).

**Deduplication:** Before sending to the model, transactions with identical payee, memo, and narration are grouped. Only one representative is sent per unique description. The model's suggestion is then applied to all transactions sharing that description. This significantly reduces token usage for imports with many repeat merchants.

**Prompt structure:** Each API call includes:
- The list of valid `Expenses:` and `Income:` accounts from your ledger (balance sheet accounts are excluded).
- The source account (e.g., `Assets:Bank:Checking`) for context.
- The default account to use when no good match exists.
- The batch of transaction descriptions as a JSON array.

The model returns a JSON array mapping each transaction to a suggested account.

**Validation and retries:** After each response, the engine checks that every suggested account exists in your ledger. If any do not (e.g., due to a typo or hallucination), it sends a follow-up message listing the invalid suggestions and asking the model to correct them. This retry happens up to 2 times. After that, any remaining invalid accounts are replaced with the default account, and a warning is included in the response.

**Provider support:** The AI engine works with OpenAI-compatible providers (OpenAI, Groq, LM Studio, Ollama, Synthetic, etc.) and Anthropic. The same prompt is used for all providers.

</details>

---

## Configuration

Auto-categorization settings live under the AI section in Settings, or in `config.yaml`:

```yaml
ai:
  categorization:
    enabled: true        # Enable or disable auto-categorization
    engine: classifier   # "classifier" or "ai"
```

| Setting | Options | Description |
|---------|---------|-------------|
| `enabled` | `true` / `false` | Whether the Autocategorize button is functional. When disabled, all transactions receive the default account. |
| `engine` | `classifier` / `ai` | Which engine to use. The classifier runs locally; the AI engine requires a configured language model. |

See [Configuration](/reference/configuration/) for the full reference of all settings.
