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

This section has one entry per version-to-version change that needs your attention.

## Notes

- [Dashboards move to the step-based format](/upgrade-notes/dashboards-step-format/) — the dashboard recipe format changed; saved dashboards are upgraded on first launch of the new version.

---

For how the upgrade mechanism works under the hood, see [Asset migrations](/development/asset-migrations/) in the Development section.
