---
title: Reasoning Models
description: How reasoning models work in Finzytrack, why they occasionally produce empty answers or hang, and what to do about it.
---

Some modern AI models are *reasoning models* — they generate an internal chain of thought before producing a visible answer. GLM-5, DeepSeek-R1, OpenAI's o-series, and Qwen3 (in thinking mode) are common examples. They can be very capable, but they have a failure mode worth understanding before you choose one.

## What you'll see in the assistant

When the AI Assistant talks to a reasoning model, you'll see a small expanded block labelled **Model is reasoning**. While the model is thinking, the block shows three things:

- A **live character counter** that climbs steadily — the model is "alive" as long as this number is going up.
- The **first ~500 characters** of the model's internal monologue, captured once at the start of reasoning. This stays static and gives you a quick sense of how the model is approaching the task ("The user wants me to create a rule file for an ICICI bank XLS file…").
- A note that the **full reasoning will appear when the model finishes**.

We deliberately do not stream the entire reasoning text live. Reasoning models can produce hundreds of thousands of characters of internal monologue, far faster than anyone can read, and rendering all of it live makes the UI feel janky on long runs. The counter is the alive signal; the snippet is the diagnostic peek; the full text appears in one go at the end.

When the model finishes, the block auto-collapses and the actual answer takes its place. You can re-expand the block at any time to read the full reasoning.

## Why a reasoning model might fail

Every model on a hosted provider has a maximum number of tokens it can produce in a single response. Reasoning and answer share that one budget. If a reasoning model wanders too long during its internal monologue, it can run out of budget *before* it gets to the answer. The provider then cuts the response off, and the model has produced thousands of reasoning tokens but zero visible content.

A particular variant of this failure mode is the model getting **stuck in a reasoning loop** — re-considering the same question, second-guessing its own conclusions, or repeatedly restarting an outline — and never breaking out before `max_tokens` is exhausted. From the outside this looks identical to a model that's just thinking hard: the character counter keeps climbing. The tell is that it climbs for an unusually long time and then ends with the no-message-body error described below rather than an answer.

You will recognise this when:

- The character counter in the **Model is reasoning** block climbs for a long time (often a minute or more) into the tens or hundreds of thousands of characters, and then…
- The assistant shows an error like *"The model used its entire token budget on internal reasoning (360,040 chars) and never produced an answer."*

This is not a Finzytrack bug. It is a consequence of the model's sampling behaviour combined with the provider's token cap. The same prompt can succeed quickly one minute and fail the next — reasoning paths are probabilistic.

## What to try

### 1. Try again

Reasoning length on the same prompt can vary by 100× between runs. A request that hung once will often succeed on a retry. If your model fails occasionally but not consistently, this may be all you need.

### 2. Switch to a non-reasoning model

If retries don't help — or if failures happen often enough to be annoying — switch to a non-reasoning *instruct* model on the same provider. Instruct models answer immediately without an internal monologue, are usually faster, and don't have this failure mode at all.

Look for models whose names contain *Instruct*, *Chat*, or *V3* (rather than *Reasoning*, *R1*, *Thinking*, or numeric suffixes that indicate reasoning variants). Most providers list both reasoning and non-reasoning versions of the same base model. Tasks like rule creation, transaction parsing, and most query generation do not benefit from chain-of-thought — they're structured-output tasks where reasoning is overhead.

### 3. Raise `max_tokens`

In **Settings → AI**, the *max_tokens* setting controls the upper bound on a single response. The default (`0`) lets the provider apply its own cap, which is usually enough for non-reasoning models but can be too low for reasoning models on long prompts. Try `16000` or `32000` and see whether the model gets enough room to finish reasoning *and* produce an answer. Note that not all providers honour values above their internal cap.

### 4. Try to turn reasoning off (advanced)

If your provider exposes a switch that disables reasoning, you can attempt to use it via the **Settings → AI → Advanced → Extra request body** field. Whatever JSON object you put there is forwarded with every chat request. The exact key depends on the provider and the model:

- **vLLM-hosted Qwen3 / GLM-family models** — `{ "chat_template_kwargs": { "enable_thinking": false } }`
- **OpenAI o-series** — `{ "reasoning_effort": "low" }` (lowers, does not fully disable)
- **Anthropic extended-thinking models** — `{ "thinking": { "type": "disabled" } }`, or simply pick a non-extended-thinking model
- **DeepSeek-R1 and similar** — no documented switch; only the model choice matters

This is an escape hatch, not a guaranteed fix. There is no way for Finzytrack to confirm the switch took effect — if the provider silently ignores the key, the model still reasons. If it isn't working, the live reasoning indicator in the assistant will tell you. See [Extra Request Body](/reference/configuration/#advanced-extra-request-body-bring-your-own-only) for the full reference.

### 5. Try a higher temperature

Finzytrack's default `temperature` (`0.1`) is tuned for deterministic parsing and SQL generation. Reasoning models at very low temperature can deterministically follow the same reasoning path on each retry — including a bad one that loops. Raising `temperature` to `0.3`–`0.7` (in **Settings → AI → Advanced**) introduces enough variation that retries diverge, which can help when a particular prompt consistently triggers a loop. Some providers (for example, DeepSeek) explicitly recommend this range for their reasoning models.

This is a small experiment, not a fix. Higher temperature also makes structured-output tasks (rule creation, query generation) less reliable — only raise it if reasoning failures are a recurring problem, and consider lowering it again once the troublesome prompt is past.

## Why the assistant doesn't expose a single "disable reasoning" toggle

Finzytrack could surface a single toggle that maps to whatever provider-specific switch is in fashion (`enable_thinking=false`, `reasoning_effort=low`, and so on). We chose not to, for two reasons:

1. **It doesn't reliably work.** Each provider exposes the switch differently, providers change without notice, and there's no way to verify silently whether the switch took effect.
2. **Hiding makes it worse.** A tool that *looks* like it's working but silently failing is harder to debug than one that shows you what's happening. By keeping a live reasoning indicator in front of you and surfacing clear errors when budgets are exhausted, we let you see the problem and react — either by retrying, switching models, raising the budget, or using the **Extra request body** escape hatch above to pass the provider's specific switch directly.

The single knob the assistant gives you front and centre is the model itself. Picking the right model for the task is the most reliable way to avoid this failure mode.

## See also

- [Quick Start — Configuring AI](/quick-start/#configuring-ai) — choosing a provider and model
- [LLM Configuration](/reference/configuration/#llm) — full reference for AI settings
- [AI Data Sharing](/reference/ai-data-sharing/) — what data is sent to your model in each feature
