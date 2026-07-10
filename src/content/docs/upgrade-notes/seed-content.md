---
title: New demo content
description: How Finzytrack delivers new and updated bundled demo dashboards and demo data to existing installs, without touching your edits.
sidebar:
  order: 2
---

*Introduced in Finzytrack v0.2.0.*

Finzytrack ships with **demo content** — example dashboards and a demo ledger — so a new install has something to look at. When you update to a version that adds or improves that demo content (for example, new budget dashboards and a demo ledger that carries budgets), Finzytrack offers to add it to your install. It never overwrites anything you've changed.

## What you'll see

After updating, if new or updated demo content is available you'll see a dismissible **"New demo content available"** notice. It's not a gate — the app runs normally either way. The notice tells you how many demo files would be added or updated, and you can:

- **Add now** — add the new demo content. A timestamped backup of every replaced file is saved first, and anything you've edited yourself is left untouched. A short summary then shows what was added, refreshed, or kept because you'd edited it.
- **Dismiss** — skip it. The notice won't nag you again for this update; it only returns when a *later* version ships different demo content.

## What gets added or updated

- **New demo files** you don't have yet (e.g. new budget dashboards) are **added**.
- **Unchanged demo files** — ones you haven't edited since they were installed — are **refreshed** to the latest bundled version.
- **Demo files you've edited** are **kept exactly as they are**. Finzytrack can tell an untouched file from an edited one, so your changes are never clobbered. (The trade-off: once you edit a demo file, it stops receiving future updates — Finzytrack has no way to know your version is safe to replace. See [Restoring an original demo](#restoring-an-original-demo) if you want the shipped copy back.)
- **Demo files you deleted** are **not brought back**.

This covers both the demo dashboards (in `config/recipes/`) and the demo ledgers (in `data/ledgers/`, including the multi-file demo). Your own ledger is never demo content, so it is never touched.

## Backups — nothing is lost

Before replacing any file, Finzytrack saves a timestamped copy beside it, e.g. `config/recipes/dashboards/budget-overview.json.20260709_141103_512847.backup`. To roll back, quit Finzytrack, delete the updated file, and rename its `.backup` copy back.

## Brought the notice back after dismissing it

Dismissed the notice by mistake, or want to re-check later? **Settings → General → Show dismissed notices** re-opens any startup notice you've dismissed — including this one — so you can review it again and click **Add now**. If nothing new is waiting, it simply tells you you're up to date. (It only re-shows notices; it never applies anything on its own, and it can't touch your edits.)

## Restoring an original demo

Because Finzytrack never overwrites a demo file you've changed, there is **no button** that could wipe your edits — a deliberate choice. If you edited (or broke) a demo dashboard and want the **shipped original** back, restore it by hand:

1. Open the original recipe from the bundled demo dashboards — the canonical copies live in the Finzytrack repository under [`backend/resources/seed_config/recipes/dashboards/`](https://github.com/sagarbehere/finzytrack/tree/main/backend/resources/seed_config/recipes/dashboards).
2. In Finzytrack, go to **Settings → Dashboards**, select the file you want to restore (or click **New Recipe**), paste the original JSON, and **Save**. Your edited version is backed up on save.

There is no equivalent one-click restore for the demo *ledger*; if you need a fresh demo ledger, re-run first-time setup and choose the demo option, or copy a demo ledger file from the repository.

## Why demo dates stay current

Each release's demo ledger is generated at build time with dates ending around the release month (plus a small buffer), so the demo dashboards — which default to the current month and year — aren't empty when you open them. Applying a demo-content update also brings you the fresher demo ledger.
