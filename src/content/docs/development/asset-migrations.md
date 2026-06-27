---
title: Asset migrations
description: How Finzytrack upgrades your on-disk recipes and config across breaking format changes — with consent and backups.
sidebar:
  order: 5
---

Finzytrack stores your dashboards, rules, and settings as plain files under `config/`. When a new version changes one of these formats in a breaking way, it needs to convert your existing files — and it does so **only with your consent, and always with backups**. This page explains the mechanism for technically-curious users; the user-facing "what do I need to do" notes live under [Upgrade Notes](/upgrade-notes/).

## The principle

Earlier, format upgrades ran automatically at startup and rewrote your files before you ever saw the app. Finzytrack no longer does that. Instead:

1. **Detect** — on launch the app checks, *read-only*, whether anything is below the current format. Nothing is touched.
2. **Inform & consent** — if something needs upgrading, the whole app waits behind a dialog that explains what will change and links to the relevant Upgrade Note. Nothing happens until you click **Upgrade & continue**.
3. **Apply** — the migration runs, saving a backup of every changed or removed file first.

## Two layers

- **Versioned migrations** convert the data. Each asset class (recipes today; config and rules in future) has a per-file version stamp and an ordered chain of conversions. Conversions are idempotent — running one on already-current data does nothing.
- **Startup tasks** are the consent layer. Each is a small object that can *detect* whether action is needed (read-only) and *apply* it on consent. The app asks the backend for pending tasks at launch and gates on any that require consent.

A startup task is deliberately thin: it just asks "is this asset class behind?" and, on consent, runs the migration.

## Tasks retire themselves

You never have to clean up old migration steps:

- **Migration tasks are data-driven.** Their detection is a check against your files. Once everything is current, the check finds nothing and the task simply stops appearing. A future format bump (say v2 → v3) adds a conversion step to the chain; the *same* task now covers it — there's no growing list of one-off upgraders.
- **One-time notices** (e.g. "we moved your X") record themselves as done in `config/.upgrade-state.json` so they show exactly once.

## Backups and recovery

Nothing is changed or removed without a recoverable copy:

- A rewritten file keeps a timestamped `.bak` beside it.
- A removed file is copied into a dedicated `.migration-backups/` folder within the same area first.

Each [Upgrade Note](/upgrade-notes/) tells you exactly where its backups are and how to roll back.

## Command-line escape hatch

Power users can run a migration directly instead of through the dialog — for example the recipe migration:

```bash
python scripts/migrate_recipes.py config/recipes        # apply
python scripts/migrate_recipes.py --check config/recipes # preview only
```

## Where it lives (for contributors)

- `backend/app/migrations/` — the versioned conversions (e.g. the recipe v1→v2 migration) and the backup-aware apply path.
- `backend/app/startup_tasks/` — the task registry, the recipe-migration task, and the one-shot upgrade-state.
- `GET /api/startup/tasks` and `POST /api/startup/tasks/{id}/apply` — the endpoints the app uses.

The full design is recorded in `dev-docs/upgrades.md` in the main repository.
