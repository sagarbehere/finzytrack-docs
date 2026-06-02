---
title: Choosing an AI Model
description: Requirements, recommendations, and trade-offs for picking an AI model to use with Finzytrack.
---

AI is entirely optional in Finzytrack — every core feature works without it. If you do choose to enable it, the model you pick matters a lot. This page covers what AI unlocks, what kind of model is capable enough to be useful, and which models and providers we have tested.

For the YAML schema and field-by-field reference of the `ai` config section, see [LLM Configuration](/reference/configuration/#llm). For what data leaves your machine in each AI feature, see [Data Shared with AI](/reference/ai-data-sharing/).

---

## What AI unlocks

- **Statement parsing** — Upload a CSV, PDF, or image and let the AI extract transactions without writing rules.
- **Import rule creation** — Ask the assistant to generate CSV/XLS import rules from a sample file.
- **Natural-language entry** — Describe transactions in plain English.
- **Auto-categorization** — Let the AI suggest expense/income accounts for imported transactions.
- **Financial queries** — Ask questions about your data in natural language.

---

## Model requirements

Finzytrack's AI features require a capable model. Specifically, the model needs to support:

- **Tool calling** (function calling)
- **Reasoning and coding ability**
- **A context window of 128k tokens or more**
- **32B or more active parameters**

Most smaller models that run locally on typical consumer hardware are unlikely to produce reliable results. The AI features involve complex multi-step tasks like parsing financial statements, creating structured rules, and executing query plans — these require a model with strong instruction-following and tool-use capabilities.

:::caution[Choosing an incapable model is worse than not using AI at all]
If you connect a model that does not meet the requirements above, the AI features will not work as intended and will cause frustration. You'll end up having to read and understand the docs and then manually tweak or rewrite the AI's outputs, making the experience worse than simply not using AI in the first place. Please make sure your chosen model meets or exceeds every requirement listed above before enabling AI features.
:::

---

## Tested models

The table below lists specific models we have used with Finzytrack and found to work acceptably across the full range of AI features (statement parsing, rule creation, natural-language entry, and the assistant). It grows as we test more. Even the models below have occasional hiccups on specific tasks — a malformed rule, a query that needs a second try, a parse that misses a column — so treat the assistant's output as a draft and review it before committing.

| Model | Reasoning? | Notes |
|-------|------------|-------|
| GLM-5 | Yes | Open-source model by Zhipu AI. Works satisfyingly well across all AI features. |
| GLM-4.7 | Yes | Earlier open-source model by Zhipu AI. Also works well across all AI features; GLM-5 is preferred where available. |
| Qwen3-Coder-480B-A35B-Instruct | No | Open-source non-reasoning instruct model by Alibaba. Strong tool calling and structured output, and avoids the reasoning-loop failure mode entirely. A good choice if you've hit reasoning hangs with the GLM models. |

Models marked *Reasoning: yes* can occasionally hang or return empty answers when the model gets stuck thinking; see [Reasoning Models](/reference/reasoning-models/) for the failure mode and what to do.

### A note on providers

We only test against providers with strong privacy commitments, since some of your financial data may be included in prompts. So far that has meant [Synthetic](https://synthetic.new), which runs open-source models in private datacenters and states it never trains on user data and never stores API prompts or completions. We are not affiliated with Synthetic — just happy users.

The specific models above are not tied to Synthetic — they are open-source and may be offered by other providers, and providers routinely sunset specific versions (e.g., a provider might drop GLM-5 in favor of GLM-5.1). Pick the most recent version of a listed family that your provider currently offers. If you choose a provider we haven't mentioned, review its privacy policy carefully; see [Data Shared with AI](/reference/ai-data-sharing/) for what is sent in each feature.

In the future, **Finzytrack AI** will offer a cloud-hosted model that requires no configuration on your part, preserves your privacy, and is well-suited for financial imports and analysis.

---

## Trying AI before committing to a provider

If you want to explore Finzytrack's AI features before signing up with a paid provider, [OpenRouter](https://openrouter.ai) offers a free tier with no credit card required. Sign up, generate an API key, and browse their [free models](https://openrouter.ai/models?q=:free) — look for one that meets the requirements above (tool calling, 128k+ context, 32B+ parameters). Set the API URL to `https://openrouter.ai/api/v1` in **Settings > AI**.

Be aware that privacy policies vary across free models on OpenRouter — some providers may use your prompts for training. Check the model card for the specific model you choose before sending any sensitive financial data. For regular use, we recommend switching to a provider with explicit privacy commitments, such as [Synthetic](https://synthetic.new).

---

## Provider modes

You configure AI during the setup wizard or later from **Settings > AI**. There are two provider modes:

- **OpenAI-compatible** — Works with cloud providers (Synthetic, OpenAI, Groq, etc.) and local servers (LM Studio, Ollama). Enter the API URL, API key (if required), and model name.
- **Anthropic** — Direct connection to Anthropic's API. Enter your API key and model name.

See [LLM Configuration](/reference/configuration/#llm) for the full reference of AI settings.

---

## See also

- [LLM Configuration](/reference/configuration/#llm) — full YAML reference for AI settings
- [Reasoning Models](/reference/reasoning-models/) — failure modes specific to reasoning models and how to react
- [Data Shared with AI](/reference/ai-data-sharing/) — what is sent to your model in each feature
- [AI Assistant](/views/ai-assistant/) — the conversational view that drives most AI features
