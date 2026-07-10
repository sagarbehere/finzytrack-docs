---
title: New demo content
description: How Finzytrack delivers new and updated bundled demo dashboards and demo data to existing installs, without touching your edits.
sidebar:
  order: 2
---

Finzytrack ships with **demo content** — example dashboards and a demo ledger — so a new install has something to look at. When you update to a version that adds or improves that demo content (for example, new budget dashboards and a demo ledger that carries budgets), Finzytrack offers to add it to your install. It never overwrites anything you've changed.

## What you'll see

After updating, if new or updated demo content is available you'll see a dismissible **"New demo content available"** notice. It's not a gate — the app runs normally either way. The notice tells you how many demo files would be added or updated, and you can:

- **Add now** — add the new demo content. A timestamped backup of every replaced file is saved first, and anything you've edited yourself is left untouched. A short summary then shows what was added, refreshed, or kept because you'd edited it.
- **Dismiss** — skip it. The notice won't nag you again for this update; it only returns when a *later* version ships different demo content.

## What gets added or updated

- **New demo files** you don't have yet (e.g. new budget dashboards) are **added**.
- **Unchanged demo files** — ones you haven't edited since they were installed — are **refreshed** to the latest bundled version.
- **Demo files you've edited** are **kept exactly as they are**. Finzytrack can tell an untouched file from an edited one, so your changes are never clobbered. (The trade-off: once you edit a demo file, it stops receiving future updates. Use **Reset demo data** below to opt back in.)
- **Demo files you deleted** are **not brought back**.

This covers both the demo dashboards (in `config/recipes/`) and the demo ledgers (in `data/ledgers/`, including the multi-file demo). Your own ledger is never demo content, so it is never touched.

## Backups — nothing is lost

Before replacing any file, Finzytrack saves a timestamped copy beside it, e.g. `config/recipes/dashboards/budget-overview.json.20260709_141103_512847.backup`. To roll back, quit Finzytrack, delete the updated file, and rename its `.backup` copy back.

## Reset demo data

**Settings → Reset demo data** restores all bundled demo dashboards and demo ledgers to their shipped state — the manual escape hatch if you tinkered with a demo and want the original back. It backs up whatever's there first, and (unlike the notice) it *does* replace files you've edited, so use it deliberately.

## Why demo dates stay current

Each release's demo ledger is generated at build time with dates ending around the release month (plus a small buffer), so the demo dashboards — which default to the current month and year — aren't empty when you open them. Applying a demo-content update also brings you the fresher demo ledger.
