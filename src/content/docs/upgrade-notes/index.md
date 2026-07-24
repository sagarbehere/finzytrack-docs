---
title: Upgrade Notes
description: What changes when you update Finzytrack, and what (if anything) you need to do.
sidebar:
  order: 0
---

When you update Finzytrack, a new version occasionally needs to convert some of your saved data to a new format — most often your **saved dashboards**. Finzytrack never changes your files silently:

- On launch it **checks** whether anything needs upgrading (read-only — nothing is touched).
- If something does, it shows a dialog explaining **what will change and why**, with a link to the relevant note below.
- It only proceeds **after you choose to upgrade**, and it **saves a backup of every changed file first**.

So an upgrade is always informed and reversible. If you ever want to roll back, the backups are right next to your data (each note says exactly where).

This section has one entry per change that needs your attention, each labeled with the Finzytrack version it landed in. It isn't a full changelog — for everything that changed in a release, see the [GitHub release notes](https://github.com/sagarbehere/finzytrack/releases).

## Notes

- **v0.2.0** — [Dashboards move to the step-based format](/upgrade-notes/dashboards-step-format/): the dashboard recipe format changed; saved dashboards are upgraded on first launch after you confirm.
- **v0.2.0** — [New demo content](/upgrade-notes/seed-content/): new and updated demo dashboards and demo data are offered to existing installs.

---

For what happens to your files during an upgrade — always consent-gated and backed up — see [Backups during upgrades](/reference/backups-and-logs/#backups-during-upgrades).
