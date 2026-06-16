---
title: Multi-file Ledgers
description: How Finzytrack reads and writes Beancount ledgers split across multiple files via include directives.
sidebar:
  order: 9
---

The file you configure as your ledger in Settings is the *root file*. A root that pulls in other files via `include` directives constitutes a *multi-file ledger*.

Reads are transparent: every `include` is followed, to any depth, and the rest of the app sees a single combined view of all your entries. When you edit an existing entry, the change is written back to the file that entry came from. When you create a new entry — a transaction, an account, a balance directive, anything — it lands in the root file by default, or in another file when you use `insert-entry` routing directives (see [Routing new entries](#routing-new-entries)).

For what happens to a file's formatting and comments once Finzytrack rewrites it, see [Ledger Rewrites](/reference/ledger-rewrites/).

## Where each operation writes

| Operation | Files written |
|---|---|
| Edit or delete an entry | The file the entry came from |
| Edit entries in multiple files in one save | All of those files |
| Delete the last entry in a child file | That child file, left empty on disk (not removed) |
| Create any new entry — transaction, account `Open`, balance directive, `Commodity`, etc. | The file named by a matching `insert-entry` directive; otherwise the `default-file`; otherwise the root (see [Routing new entries](#routing-new-entries)) |

A file is rewritten only if its serialized contents differ from what's on disk. Most often that's because you edited an entry in it — but a file can also need rewriting because its existing formatting (block syntax like `pushtag`, hand-tuned column alignment, comments, blank-line conventions) doesn't match Finzytrack's printer house format. None of those survive a write; see [Ledger Rewrites](/reference/ledger-rewrites/).

The practical consequence: the first edit you make to a hand-formatted multi-file ledger can ripple into normalizing every hand-formatted file at once, even files whose entries you didn't touch. After that initial normalization, every save only rewrites the files whose entries actually changed.

Entries within each rewritten file are emitted in chronological order (date, then directive type). Existing chronological layouts are preserved; entries appended out of order are reordered to chronological position on the next write.

## Routing new entries

A *new* entry is one you create in Finzytrack — a committed transaction, an account `Open`, a `Balance`, a `Commodity`, and so on. With no routing directives in your ledger, every new entry is written to the root file.

You can route new entries to specific files with `insert-entry` directives. Finzytrack reads them with the same semantics as [Fava](https://beancount.github.io/fava/), so a ledger already set up for Fava routes the same way here.

A routed new entry is written through the same full-rewrite path as any other write, so its destination file is normalized to the printer's house format like any file Finzytrack touches (see [Ledger Rewrites](/reference/ledger-rewrites/)).

### `insert-entry` directives

An `insert-entry` directive is a Beancount `custom` directive:

```beancount
2024-01-01 custom "fava-option" "insert-entry" "Expenses:Subscriptions"
```

The third value is a regular expression tested against an entry's account names, anchored at the start of the name (so `Expenses` matches `Expenses:Subscriptions`). A new entry whose account matches is written to **the file that contains the directive**, rather than the root. Because the directive was read from that file, the file is already part of the include tree; Finzytrack writes only to files already in the tree and does not create new files or add `include` lines.

### Which account is matched

For each new entry, account names are tested in priority order:

| Entry type | Accounts tested, in order |
|---|---|
| `Transaction` | Posting accounts in reverse order — the last posting first |
| `Pad` | The padded account, then the source account |
| `Open`, `Close`, `Balance`, `Note`, `Document` | The directive's account |
| `Commodity`, `Price` | None — these carry no account, so they never match a rule |

For a transaction, the reverse-posting order means it is routed by its last posting, which by Beancount convention is the destination account — the asset or liability that received the money.

### Which rule wins

Each `insert-entry` directive carries a date. A directive applies to an entry only when its date is strictly before the entry's date, and the date that matters is the entry's own date, not today's. Selection runs account-first: the highest-priority account (from the table above) that matches any applicable directive determines the destination, and among the directives matching that account the one with the latest applicable date wins.

A directive's date is therefore an effective-from point. With two directives for the same account dated at different points, an entry routes to the most recent directive whose date falls before the entry's — so a later-dated directive sends subsequent entries to its file, while entries predating it continue to route to the earlier directive's file.

### `default-file`

When no `insert-entry` directive matches, the entry goes to the file named by a `default-file` directive, if one is present:

```beancount
2024-01-01 custom "fava-option" "default-file" "unrouted.beancount"
```

The path is resolved relative to the directory of the file that contains the directive; with no path argument, the directive's own file is the target. The target must already be part of the include tree. When no `default-file` directive is present, unmatched entries go to the root.

### Edits and deletes are not routed

Routing applies only to new entries. Editing or deleting an existing entry keeps it in the file it already lives in, regardless of any `insert-entry` rule — including when the edit changes the entry's accounts or its `source_account`.

### `Close` directives

A `Close` you create by closing an account is a new entry, so it is routed like any other. When the account name matches an `insert-entry` rule, the `Close` is written to that rule's file. When nothing matches, it goes to the `default-file` or the root — so for an account whose `Open` lives in a dedicated child file with no rule covering it, the `Close` lands in a different file from its `Open`, and the account's lifecycle is split across two files.

## `option` and `plugin` directives are root-only

Beancount only honors `option` and `plugin` directives in the file given to the parser (the root); they are ignored in included files. Finzytrack re-emits both at the top of the root on every rewrite, reconstructed from the parsed `options` dictionary — user-set options whose values differ from Beancount's defaults, and all configured plugins.

## `include` directives are preserved at any depth

When Finzytrack rewrites a file at any depth, the `include` directives that *that file* declared are preserved. If the root includes `A.beancount`, and `A.beancount` itself includes `B.beancount`, both files keep their own `include` lines across rewrites, with paths emitted relative to the file's own directory.
