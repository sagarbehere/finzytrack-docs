---
title: Dashboards move to the step-based format
description: What the dashboard-format upgrade does to your saved dashboards, and how to roll back.
sidebar:
  order: 1
---

This version of Finzytrack uses a new, more powerful **dashboard recipe format**. Widgets are now small pipelines of steps (a SQL query, plus optional computed values and transforms) instead of a single query — which is what makes features like budget-vs-actual possible. Because of the change, your existing saved dashboards need a one-time upgrade before they can be shown.

## What you'll see

The first time you open this version with dashboards saved in the old format, Finzytrack shows an **"Upgrade saved dashboards"** dialog telling you how many dashboards (and widgets) will be upgraded. Nothing is changed until you click **Upgrade & continue**.

## What the upgrade does

- **Each dashboard** is rewritten into the new step-based format and stamped as the current version. The widget queries, visualizations, parameters, and links are all preserved exactly — only the surrounding structure changes.
- **Standalone widget files** (the old `config/recipes/widgets/` folder) are merged in:
  - A widget used by a dashboard is moved **inline** into that dashboard.
  - A widget that wasn't used by any dashboard is **kept as its own new one-widget dashboard**, so nothing is lost.
- The old `widgets/` folder is removed once everything has been migrated.

## Backups — nothing is lost

Before changing anything, Finzytrack saves a backup of every affected file:

- Each rewritten dashboard keeps a timestamped copy beside it, e.g. `config/recipes/dashboards/my-dashboard.json.20260627_141103.bak`.
- Every removed widget file is copied into `config/recipes/.migration-backups/` first.

## Rolling back

If you want to return to the previous state, quit Finzytrack and restore the `.bak` files: remove the migrated `*.json`, rename the matching `*.json.<timestamp>.bak` back to `*.json`, and (if needed) move the files from `config/recipes/.migration-backups/` back into `config/recipes/widgets/`. You'd then need to run the previous app version to use them.

## Power users

You can also run the migration yourself from the command line at any time:

```bash
python scripts/migrate_recipes.py config/recipes
```

(or `--check config/recipes` to preview without writing).
