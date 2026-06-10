---
title: Multi-file Ledgers
description: How Finzytrack reads and writes Beancount ledgers split across multiple files via include directives.
sidebar:
  order: 9
---

The file you configure as your ledger in Settings is the *root file*. A root that pulls in other files via `include` directives constitutes a *multi-file ledger*.

Reads are transparent: every `include` is followed, to any depth, and the rest of the app sees a single combined view of all your entries. When you edit an existing entry, the change is written back to the file that entry came from. When you create a new entry — a transaction, an account, a balance directive, anything — it lands in the root file.

For what happens to a file's formatting and comments once Finzytrack rewrites it, see [Ledger Rewrites](/reference/ledger-rewrites/).

## Where each operation writes

| Operation | Files written |
|---|---|
| Edit or delete an entry | The file the entry came from |
| Edit entries in multiple files in one save | All of those files |
| Delete the last entry in a child file | That child file, left empty on disk (not removed) |
| Create any new entry — transaction, account `Open`, balance directive, `Commodity`, etc. | The root file |

A file is rewritten only if its serialized contents differ from what's on disk. Most often that's because you edited an entry in it — but a file can also need rewriting because its existing formatting (block syntax like `pushtag`, hand-tuned column alignment, comments, blank-line conventions) doesn't match Finzytrack's printer house format. None of those survive a write; see [Ledger Rewrites](/reference/ledger-rewrites/).

The practical consequence: the first edit you make to a hand-formatted multi-file ledger can ripple into normalizing every hand-formatted file at once, even files whose entries you didn't touch. After that initial normalization, every save only rewrites the files whose entries actually changed.

Entries within each rewritten file are emitted in chronological order (date, then directive type). Existing chronological layouts are preserved; entries appended out of order are reordered to chronological position on the next write.

## New entries always go to the root

Finzytrack has no routing config: it doesn't try to place new entries into per-year, per-account, or per-source child files. If you wish to maintain a layout like that, remember that new entries created through Finzytrack will accumulate in the root file. Reorganizing them is something to do outside Finzytrack — close the app, move entries between files in a text editor, and Finzytrack will pick up the new locations the next time it starts.

This applies to `Close` directives as well. When you close an account whose `Open` lives in a child file (e.g., a dedicated `accounts.beancount`), the `Close` lands in the root rather than next to its `Open` — the account's lifecycle is split across two files.

## `option` and `plugin` directives are root-only

Beancount only honors `option` and `plugin` directives in the file given to the parser (the root); they are ignored in included files. Finzytrack re-emits both at the top of the root on every rewrite, reconstructed from the parsed `options` dictionary — user-set options whose values differ from Beancount's defaults, and all configured plugins.

## `include` directives are preserved at any depth

When Finzytrack rewrites a file at any depth, the `include` directives that *that file* declared are preserved. If the root includes `A.beancount`, and `A.beancount` itself includes `B.beancount`, both files keep their own `include` lines across rewrites, with paths emitted relative to the file's own directory.
