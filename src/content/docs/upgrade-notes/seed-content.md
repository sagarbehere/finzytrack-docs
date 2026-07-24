---
title: New demo content
description: How Finzytrack delivers new and updated demo dashboards and demo data to existing installs — keeping your dashboard edits safe and the demo ledger current.
sidebar:
  order: 2
---

*Introduced in Finzytrack v0.2.0.*

Finzytrack ships with **demo content** — example dashboards and a demo ledger — so a new install has something to look at. When you update to a version that adds or improves that demo content, Finzytrack offers to bring it to your install. It handles the two kinds differently: **demo dashboards you've customized are never overwritten**, while the **demo ledger is refreshed to the latest version** (it's sample data Finzytrack provides). Your own ledger is never demo content, so it's never touched.

## What you'll see

After updating, if new or updated demo content is available you'll see a dismissible **"New demo content available"** notice. It's not a gate — the app runs normally either way. The notice tells you how many demo files would be added or updated, and you can:

- **Add now** — apply the update. A timestamped backup of every replaced file is saved first. A short summary then shows what was added, refreshed, or kept.
- **Dismiss** — skip it. The notice won't nag you again for this update; it only returns when a *later* version ships different demo content.

## What gets added or updated

**Demo dashboards** (in `config/recipes/`) are yours to edit, so Finzytrack is careful with them:

- **New** dashboards you don't have yet (e.g. new budget dashboards) are **added**.
- **Unchanged** dashboards — ones you haven't edited since they were installed — are **refreshed** to the latest version.
- **Dashboards you've edited** are **kept exactly as they are**. Finzytrack can tell an untouched dashboard from an edited one, so your changes are never clobbered. (The trade-off: once you edit a demo dashboard it stops receiving updates — Finzytrack has no way to know your version is safe to replace. See [Restoring an original demo](#restoring-an-original-demo) if you want the shipped copy back.)
- **Dashboards you deleted** are **not brought back**.

**The dashboard color theme** (in `config/dashboard-themes/`) is delivered the same careful way as dashboards: the theme file is **added** if you don't have it, **refreshed** while it's untouched, and **kept as-is once you've edited it** — so a palette you've customized is never overwritten. See [Dashboard Colors & Themes](/reference/dashboard-themes/) for what's in it and how to edit it.

**The demo ledger** (in `data/ledgers/`, including the multi-file demo) is sample data Finzytrack provides — not your own records — so it's **refreshed to the latest version whenever a newer one ships**, even if you poked at it while exploring. A backup is saved first. This is what keeps the demo dates current. Finzytrack only replaces it when it genuinely has a newer version, so your exploration isn't wiped every time you open the app. **Your own ledger is never demo content and is never touched.**

## Getting the new colors on a dashboard you've edited

This release introduces a **color theme** for dashboards — consistent chart, budget, and category colors across every dashboard. New and untouched demo dashboards pick it up automatically when you apply the update. But a demo dashboard you've **already edited** is (rightly) never overwritten, so it won't switch to the improved, fully-themed version on its own.

If you'd like the new theming on a demo you've customized, copy the updated version over by hand — the same steps as [Restoring an original demo](#restoring-an-original-demo): open the shipped copy from the repository's [`backend/resources/seed_config/recipes/dashboards/`](https://github.com/sagarbehere/finzytrack/tree/main/backend/resources/seed_config/recipes/dashboards), then paste it into **Settings → Dashboards** and **Save** (your edited version is backed up on save). Your own new dashboards keep whatever colors you gave them; to adopt the theme in one, swap explicit color values for theme tokens like `{{theme.brand}}` (see [Dashboard Colors & Themes](/reference/dashboard-themes/)).

## Backups — nothing is lost

Before replacing any file, Finzytrack saves a timestamped copy beside it, e.g. `config/recipes/dashboards/budget-overview.json.20260709_141103_512847.backup`. To roll back, quit Finzytrack, delete the updated file, and rename its `.backup` copy back.

## Bring a notice back after dismissing it

Dismissed a notice by mistake, or want to re-check later? **Settings → General → Show dismissed notices** re-opens any startup notice you've dismissed so you can review it again and click **Add now**. If nothing new is waiting, it simply tells you you're up to date. (It only re-shows notices; it never applies anything on its own, and it can't touch your edits.)

## Restoring an original demo

Because Finzytrack never overwrites a demo **dashboard** you've changed, there is **no button** that could wipe your edits — a deliberate choice. If you edited (or broke) a demo dashboard and want the **shipped original** back, restore it by hand:

1. Open the original recipe from the bundled demo dashboards — the canonical copies live in the Finzytrack repository under [`backend/resources/seed_config/recipes/dashboards/`](https://github.com/sagarbehere/finzytrack/tree/main/backend/resources/seed_config/recipes/dashboards).
2. In Finzytrack, go to **Settings → Dashboards**, select the file you want to restore (or click **New Recipe**), paste the original JSON, and **Save**. Your edited version is backed up on save.

The demo **ledger** works the other way round: because it's sample data Finzytrack keeps current, an update refreshes it to the latest version even if you'd changed it — so you don't need to restore it by hand. If you *had* poked at it and want your version back, it's in the timestamped `.backup` saved beside it right before the refresh (see [Backups](#backups--nothing-is-lost)).

## Why demo dates stay current

Each release's demo ledger is generated at build time with dates ending around the release month (plus a small buffer), so the demo dashboards — which default to the current month and year — aren't empty when you open them. Applying a demo-content update also brings you the fresher demo ledger.
