---
title: Documents
description: How Finzytrack stores documents attached to transactions and accounts — file naming, the ledger directives and metadata written, and orphan clearing.
sidebar:
  order: 10
---

Finzytrack supports attaching files — receipts, invoices, statements — to transactions and to accounts. The files are stored alongside your ledger in the filesystem, and the reference to each file lives in the ledger itself. 

This page describes where the files are stored, how they are named, what gets written to the ledger and when, and how unreferenced files are cleared.

---

## Where files are stored

Each ledger has its own documents root folder:

- By default it is `data/documents/<ledger-name>-<hash>/`, where `<hash>` is a short hash of the ledger file's full path — for a ledger `main.beancount`, that is something like `data/documents/main-1a2b3c4d/`. The hash means two ledgers with the same filename in different folders (two `main.beancount` files, say) never share a documents folder.
- If the ledger declares a Beancount `option "documents" "<path>"`, that path is used instead, resolved relative to the ledger file's directory.
- On the first document upload, if the ledger has no `option "documents"`, Finzytrack adds one pointing at the default folder. The same folder is therefore discoverable by other tools e.g. by Fava's document auto-discovery.

Within the root folder, files are sharded by year — `documents/2026/…` — taken from the file's date prefix. Year is immutable, so the shard never changes after a file is stored.

Paths recorded in the ledger are relative to the ledger file's directory, so the whole tree can be relocated or committed to git and still resolve. With the default layout (ledger in `data/ledgers/`, documents in `data/documents/`), a stored path looks like `../documents/main-1a2b3c4d/2026/<name>`.

---

## File naming

A stored file is named:

```
YYYY-MM-DD-<slug>-<hash>.<ext>
```

| Part | Source |
|------|--------|
| `YYYY-MM-DD` | The transaction or document date. |
| `<slug>` | Derived from the transaction narration/payee, lowercased, reduced to ASCII, dash-separated, and length-capped. Falls back to the uploaded filename, then to `document`. A leading date already present in the source name is not repeated. |
| `<hash>` | The first 8 hex characters of the file's SHA-256. |
| `<ext>` | The original file extension, lowercased. |

Example: `2026-06-15-acme-office-supplies-a1b2c3d4.pdf`.

The date prefix keeps the folder discoverable by other common tools (like Fava); the hash makes same-day, same-name files less likely to collide. Uploading byte-identical content under the same date and slug produces the same filename and does not create a second copy.

Uploads are capped at 20 MB. Any file type is accepted.

---

## Transaction documents

A transaction's documents are stored as metadata keys named `document`, `document2`, `document3`, … :

```beancount
2026-06-15 * "ACME Corp" "Office supplies"
  document: "../documents/main-1a2b3c4d/2026/2026-06-15-acme-office-supplies-a1b2c3d4.pdf"
  document2: "../documents/main-1a2b3c4d/2026/2026-06-15-acme-invoice-9f8e7d6c.pdf"
  Expenses:Office   42.00 USD
  Assets:Bank:Checking
```

- The numbering is gapless and ordered. Removing one document renumbers the rest (removing `document2` from three documents leaves `document` and `document2`).
- No Beancount links (`^…`) or `Document` directives are used for transaction documents — the metadata is the reference.
- The `document*` key convention is what Fava's `link_documents` plugin matches, so a ledger edited in Finzytrack also produces document links in Fava when that plugin is enabled.

**When it is written:** attaching or removing a document marks the transaction as modified, exactly like editing any other field. The change is written when you save:

- In the [Transactions](/views/transactions/) view, on **Save Changes**.
- In the [Import](/views/import/) view, when you **Register Transactions**.

A transaction's attachment count is also exported to the `document_count` column of the `postings` table, so it is available to [queries](/reference/querying-data/) and dashboards.

---

## Account documents

An account's documents are stored as Beancount `Document` directives:

```beancount
2026-06-15 document Assets:Bank:Checking "../documents/main-1a2b3c4d/2026/2026-06-15-statement-1f2e3d4c.pdf"
```

- **When it is written:** immediately when you attach the document in the account detail drawer (it is not part of the batched transaction-save flow).
- The directive's `filename` is stored relative to the ledger directory and is preserved byte-for-byte across ledger rewrites.
- **Renaming the account** rewrites the directive's account field to the new name. The `filename` is unchanged and no files move on disk, because the storage path carries no account component.
- **Detaching** a document removes the `Document` directive. The file on disk is left in place.

---

## Viewing documents

Clicking an attached document opens it in an in-app preview: images and PDFs render inline, and a **Download** action is always available. In the packaged desktop application, if the system has no PDF viewer available to the embedded window, the preview shows install instructions for common Linux distributions alongside the Download action.

---

## Orphaned documents

An orphaned document is a file in the documents root that is referenced by nothing in the loaded ledger — no `document*` metadata and no `Document` directive, across the root file and every `include`d file. Orphans arise when a document is detached, or when a file is uploaded for a draft transaction that is never registered.

Finzytrack never deletes document files automatically. Clearing them is a manual action under **Settings → General → Documents → Scan for orphaned documents**.

The scan lists every unreferenced file in two groups:

- **Orphaned documents** — files older than 24 hours, selected by default.
- **Recent (last 24h)** — files modified within the last 24 hours, shown separately and left unselected, since a recent file may belong to a draft that has not been saved yet.

Each file shows its size, last-modified date, and a preview link. Files are selected individually, by range with shift-click, or with a per-section select-all control. Confirming removes the selected files from disk; this cannot be undone from within Finzytrack. Immediately before each file is removed, Finzytrack re-checks that it is still unreferenced — a file that became referenced between the scan and the deletion is skipped and reported.

---

## Path safety

Document paths are confined to the documents root. A served or deleted path that resolves outside the root — through `..` segments, an absolute path, or a symbolic link — is rejected.
