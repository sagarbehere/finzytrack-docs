---
title: Backups & Logs
description: How Finzytrack backs up your data before every write and manages log files.
sidebar:
  order: 7
---

Finzytrack automatically backs up files before modifying them and maintains a rotating log file for troubleshooting. Both systems are configured in `config.yaml` and can be adjusted from **Settings** without restarting the app.

---

## Backups

Every time Finzytrack writes to a file — your ledger, a rule file, a recipe, the configuration — it creates a timestamped backup copy of the original file first. If anything goes wrong during the write, the original file is left untouched.

### What Gets Backed Up

| File | When |
|------|------|
| Ledger file (`.beancount`) | Every transaction commit, account change, or balance directive |
| CSV import rules (`.yaml`) | When a rule is updated (new rules have no prior version to back up) |
| XLS import rules (`.yaml`) | Same as CSV rules |
| Email import rules (`.yaml`) | When a rule is created or updated |
| OFX account mappings (`ofx_mappings.yaml`) | When a new account mapping is saved |
| Configuration (`config.yaml`) | When settings are changed |
| Dashboard and widget recipes (`.json`) | When a recipe is created or updated |

### Where Backups Are Stored

All backups are stored in a single directory: `data/backups/` within your Finzytrack data directory. The directory is created automatically on first use.

### Backup Naming

Each backup file is named with the original filename and a precise timestamp:

```
{filename}.{YYYYMMDD_HHMMSS_microseconds}.backup
```

For example:
```
one.beancount.20260414_213310_587876.backup
config.yaml.20260410_143022_112345.backup
```

The microsecond precision ensures that multiple backups of the same file created in quick succession never collide.

### Retention

Finzytrack keeps the most recent **100 backups per file** by default. After each backup, older backups beyond this limit are automatically deleted (oldest first). You can change this in Settings or in `config.yaml`:

```yaml
backup:
  retention_count: 100
```

### Atomic Writes

Finzytrack uses an atomic write mechanism to ensure files are never left in a partially written or corrupted state:

1. A backup of the original file is created.
2. Changes are written to a temporary file in the same directory.
3. The temporary file is atomically renamed to replace the original — this is a single operating system operation that either fully succeeds or has no effect.
4. If an error occurs during writing, the temporary file is discarded and the original remains untouched.

This means that even if the app crashes or loses power mid-write, your data files will not be corrupted.

---

## Logs

Finzytrack writes logs to a rotating log file for troubleshooting and monitoring.

### Log File Location

```
logs/finzytrack.log
```

This is relative to your Finzytrack data directory. On each platform:

| Platform | Typical location |
|----------|-----------------|
| macOS | `~/Library/Application Support/Finzytrack/logs/finzytrack.log` |
| Linux | `~/.local/share/finzytrack/logs/finzytrack.log` |
| Windows | `%LOCALAPPDATA%\Finzytrack\logs\finzytrack.log` |

When running from source, logs are in the `logs/` directory relative to the backend working directory.

### Log Format

Each log line includes a timestamp, the module name, the log level, and the message:

```
2026-04-14 21:33:10,589 - app.core.backup_manager - INFO - Created backup for data/ledgers/one.beancount
```

### Log Levels

The log level controls how much detail is recorded. From least to most verbose:

| Level | What it captures |
|-------|------------------|
| CRITICAL | Only fatal errors that prevent the app from running |
| ERROR | Errors that affect functionality but don't crash the app |
| WARNING | Potential issues worth attention |
| INFO | Normal operational events (startup, imports, configuration changes) |
| DEBUG | Detailed diagnostic information for troubleshooting |

The default level is **INFO**. You can change it in Settings, in `config.yaml`, or via command-line flags:

```yaml
logging:
  level: INFO
```

```bash
# Command-line overrides
finzytrack --log-level DEBUG
finzytrack --debug          # shorthand for --log-level DEBUG
```

### Log Rotation

When the log file reaches a size limit, it is automatically rotated:

1. The current `finzytrack.log` is renamed to `finzytrack.log.1`.
2. If `finzytrack.log.1` already exists, it becomes `finzytrack.log.2`, and so on.
3. Rotated files beyond the backup count are deleted.
4. A new, empty `finzytrack.log` is created.

Default settings:

```yaml
logging:
  max_file_size_mb: 5    # Rotate when the log exceeds 5 MB
  backup_count: 3        # Keep 3 rotated files (finzytrack.log.1 through .3)
```

With these defaults, the log system uses at most ~20 MB of disk space (the active log plus 3 rotated copies).

### Console Output

In addition to the log file, Finzytrack also outputs logs to the console (stdout). This is useful when running from source or when viewing logs in a terminal. The console uses the same format and log level as the file.

---

## Configuration Reference

All backup and logging settings can be changed in **Settings** or directly in `config.yaml`. Changes take effect immediately without restarting the app.

```yaml
backup:
  enabled: true
  retention_count: 100     # Backups to keep per file (minimum: 1)

logging:
  level: INFO              # DEBUG, INFO, WARNING, ERROR, or CRITICAL
  max_file_size_mb: 5      # Max log file size before rotation (1–100 MB)
  backup_count: 3          # Rotated log files to keep (0–20)
```

See [Configuration](/reference/configuration/) for the full reference of all settings.
