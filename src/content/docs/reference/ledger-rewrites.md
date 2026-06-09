---
title: Ledger Rewrites
description: How Finzytrack round-trips a Beancount ledger — what is retained on write and what is dropped.
sidebar:
  order: 8
---

When Finzytrack updates your ledger — committing imported transactions, editing an entry, adding a balance directive — it rewrites the affected file(s) in full. This page describes what that rewrite preserves and what it drops.

## How Finzytrack reads and writes the ledger

Finzytrack uses the official Beancount libraries for both reading and writing. On every read, Beancount's parser turns the ledger into an in-memory list of structured *entries*: transactions, account openings, balance assertions, and so on. On every write, Finzytrack hands that list back to Beancount's printer, which serializes it to text.

Anything that isn't represented in the structured-entry model — freeform comments, hand-tuned column alignment, blank-line groupings, `pushtag`/`pushmeta` block boundaries — has nowhere to live during the round trip and is dropped on write. This is a deliberate Beancount design choice: the alternative would be text-level editing of the file, which is fragile and easy to corrupt. Finzytrack inherits the same trade-off.

A single-file ledger and a multi-file ledger (one connected via `include` directives) follow the same model. For multi-file ledgers, only the file(s) whose entries actually change are rewritten on a given operation; unchanged files are left byte-identical.

---

## What is retained across a rewrite

These are first-class members of Beancount's entry model and round-trip cleanly:

| Category | Notes |
|---|---|
| `Transaction` directives | Including tags (`#foo`), links (`^bar`), flags (`*`, `!`, `txn`), and all metadata keys/values on the transaction and on individual postings. |
| `Open`, `Close` directives | Including opening currencies and the `booking` method. |
| `Balance`, `Pad` directives | Auto-generated padding *transactions* (the loader synthesizes one from each `Pad`+`Balance` pair) are not written to disk — they're regenerated on every parse. The directives themselves round-trip cleanly. |
| `Commodity` directives | Including any metadata you've attached (currency name, type, etc.). |
| `Price` directives | |
| `Note`, `Document`, `Event`, `Query` directives | |
| `Custom` directives | Including Fava extension declarations. |
| `include` directives | Re-emitted per-file so nested include chains survive. Paths are emitted relative to the file they appear in, preserving the convention you used. |
| User-set `option` directives at the root | Only options that differ from Beancount's defaults are re-emitted. Options on a curated allowlist (`title`, `operating_currency`, `name_assets`, `render_commas`, etc.) round-trip cleanly. Obscure options not on the allowlist are dropped. |
| `plugin` directives at the root | Both the no-argument form (`plugin "foo"`) and the configured form (`plugin "foo" "config string"`) round-trip. |

---

## What is retained as effect but not as syntax

`pushtag` / `poptag` and `pushmeta` / `popmeta` are applied at parse time: every entry inside the block gets the tag or metadata baked into its parsed form. The *effect* of the block survives the round trip — every affected entry keeps its tag or metadata. The *block syntax itself* does not survive: on the next rewrite of that file, the block is replaced with inline `#tag` notation or per-entry metadata on each affected entry.

Finzytrack surfaces an advisory at the top of the app the first time it detects this syntax in your ledger.

---

## What is dropped on a rewrite

These have no representation in Beancount's parsed model. They are removed on the next Finzytrack rewrite of any file that contains them:

| Category | Notes |
|---|---|
| Freeform comments | Both `;; section header` and end-of-line `; note inline` forms. |
| Blank-line conventions | Finzytrack re-emits in a consistent house style. |
| Column alignment | Hand-aligned amounts are normalized to the printer's house style. |

---

Every Finzytrack write creates a timestamped backup of the affected file(s) before modification. See [Backups & Logs](/reference/backups-and-logs/).
