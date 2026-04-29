---
title: Reasoning Models
description: How reasoning models work in Finzytrack, why they occasionally produce empty answers or hang, and what to do about it.
---

Some modern AI models are *reasoning models* — they generate an internal chain of thought before producing a visible answer. GLM-4.7, DeepSeek-R1, OpenAI's o-series, and Qwen3 (in thinking mode) are common examples. They can be very capable, but they have a failure mode worth understanding before you choose one.

## What you'll see in the assistant

When the AI Assistant talks to a reasoning model, you'll see a small expandable block labelled **Model is reasoning** with a live character counter. While the model is thinking, this block streams its internal monologue in real time. When the model finishes, the block collapses and the actual answer takes its place.

You can ignore this block most of the time — it's the model "thinking out loud" and is not the answer. It's there so you always know what's happening, never a silent spinner.

## Why a reasoning model might fail

Every model on a hosted provider has a maximum number of tokens it can produce in a single response. Reasoning and answer share that one budget. If a reasoning model wanders too long during its internal monologue, it can run out of budget *before* it gets to the answer. The provider then cuts the response off, and the model has produced thousands of reasoning tokens but zero visible content.

You will recognise this when:

- The reasoning block streams for a long time (often a minute or more), the character counter climbs into the tens or hundreds of thousands, and then…
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

## Why the assistant doesn't hide this from you

Finzytrack could try to disable reasoning automatically using one of several model-specific switches (`enable_thinking=false`, `reasoning_effort=low`, and so on). We chose not to, for two reasons:

1. **It doesn't reliably work.** Each provider exposes the switch differently, providers change without notice, and there's no way to verify silently whether the switch took effect.
2. **Hiding makes it worse.** A tool that *looks* like it's working but silently failing is harder to debug than one that shows you what's happening. By streaming the reasoning live and surfacing clear errors when budgets are exhausted, we let you see the problem and react — either by retrying, switching models, or raising the budget.

The single knob the assistant gives you is the model itself. Picking the right model for the task is the most reliable way to avoid this failure mode.

## See also

- [Quick Start — Configuring AI](/quick-start/#configuring-ai) — choosing a provider and model
- [LLM Configuration](/reference/configuration/#llm) — full reference for AI settings
- [AI Data Sharing](/reference/ai-data-sharing/) — what data is sent to your model in each feature
