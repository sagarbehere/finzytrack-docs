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

## Recommended model

We have tested with several models and found that **GLM-4.7** (an open-source model by Zhipu AI) works satisfyingly well. We tested it through [Synthetic](https://synthetic.new), a cloud provider that runs open-source models in private datacenters and states that they never train on your data and never store API prompts or completions. We recommend Synthetic, though we are not affiliated with them in any way — just happy users.

If you use a different provider, look for one with similarly strong privacy commitments, since some of your financial data may be included in the prompts. See [Data Shared with AI](/reference/ai-data-sharing/) for details on what is sent in each feature.

:::note[A note about GLM-4.7 and reasoning models]
GLM-4.7 is a *reasoning model* — it thinks at length internally before answering. Most of the time this works fine, but occasionally the model gets stuck reasoning and returns an empty answer or takes much longer than usual. The Finzytrack assistant streams the model's reasoning live so you can see when this is happening; if it occurs frequently, switching to a non-reasoning instruct model on the same provider usually resolves it. On vLLM-hosted deployments (such as Synthetic) you can also try disabling thinking via the **Settings → AI → Advanced → Extra request body** field — see [Reasoning Models — What to try](/reference/reasoning-models/#what-to-try) for the exact JSON.
:::

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
