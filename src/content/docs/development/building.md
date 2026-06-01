---
title: Build Instructions
description: How to build the Finzytrack desktop app for macOS, Linux, and Windows.
sidebar:
  order: 3
---

Finzytrack ships as a standalone desktop app that bundles the FastAPI backend, the Vue 3 frontend, and a native window shell into a single distributable binary. This page covers how to set up the repository, run Finzytrack in development mode, and produce builds for macOS, Windows, and Linux.

## Prerequisites

Before building, you need:

- **Python 3.11+** (3.13 recommended)
- **Node.js 18+** (22 recommended)
- **npm** (comes with Node.js)
- **Git**

### Platform-specific prerequisites

**macOS** — verified on macOS Tahoe (26.x). Install:

1. **Xcode Command Line Tools** — `xcode-select --install`. Provides git, compilers, `iconutil` (used to build the `.icns` icon bundle), and a system `python3` (Apple-bundled, version varies with the Xcode release — recent Xcode 16 ships 3.12).
2. **Homebrew** — see [brew.sh](https://brew.sh) for the install command.
3. **A current Python and Node** — `brew install python@3.13 node@22`. macOS does not ship Node at all, and the Xcode-bundled Python may be older than our 3.11+ minimum depending on your Xcode version, so installing both via Homebrew is the most reliable way to match CI.
4. **librsvg** — `brew install librsvg`. Provides `rsvg-convert`, which the icon generator (`assets/icons/generate.py`) uses to rasterise `master.svg` into platform-specific PNG and ICNS assets. Without it the generator falls back to a PIL-only path that produces a visually different (dark) icon.

PyWebView on macOS uses Cocoa via `pyobjc` (pulled in automatically by `pip install pywebview`) — no extra system libraries are needed beyond Xcode Command Line Tools.

**Linux (Ubuntu/Debian)** — verified on **Debian 13 (Trixie)** and **Ubuntu 22.04+**. Earlier Debian (Bookworm and older) ship only WebKit2GTK 4.0 in the main repos, so a build that targets 4.1 will not run without backports.

PyWebView needs GTK + WebKit system libraries, plus the headers required to build PyGObject and pycairo from source. Install:

```bash
sudo apt-get update
sudo apt-get install -y \
    python3-venv python3-dev python3-pip \
    build-essential pkg-config \
    libgirepository1.0-dev \
    libcairo2-dev \
    gir1.2-webkit2-4.1 \
    libwebkit2gtk-4.1-0 \
    libfuse2t64 \   # use libfuse2 on Debian 12 / Ubuntu 22.04
    librsvg2-bin    # rsvg-convert, used by assets/icons/generate.py
```

On Debian 13, `libfuse2` has been renamed `libfuse2t64` as part of the time_t 64-bit transition. The classic `libfuse2` name still exists as a transitional package, but the t64 variant is what apt will actually install.

The Python-side GTK bindings (`pygobject`, `pycairo`) are installed automatically from `desktop/requirements.txt`. PyGObject is currently pinned `<3.51` because newer 3.5x crashes pywebview's GTK page-load callback; remove the pin once pywebview's GTK backend is updated upstream.

Debian 13 ships Node.js 20 via apt, which meets the minimum. To match the version CI builds with (Node 22), install from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows** — verified on Windows 11. PyWebView uses EdgeChromium (EdgeWebView2), which is included with modern Windows, so no GUI runtime needs to be installed. You do need Python, Node.js, and Git, which a fresh Windows install does not ship. **No SVG renderer is required on Windows** — the build uses a pre-rendered `assets/icons/windows/app.ico` checked into the repo, regenerated periodically from `master.svg` on a machine with `rsvg-convert`.

The fastest way to install all three is via `winget` from an elevated PowerShell:

```powershell
winget install --id Git.Git -e
winget install --id Python.Python.3.13 -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close and reopen PowerShell after installation so the new entries on `PATH` are picked up. Verify each tool is on `PATH`:

```powershell
git --version
python --version    # 3.13.x
node --version      # v22.x or v24.x — both work
npm --version
```

**PowerShell execution policy.** Out of the box, Windows blocks unsigned PowerShell scripts, which prevents both `npm` (a `.ps1` shim) and the Python venv's `Activate.ps1` from running. Relax the policy once for the current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

This is required before either `npm --version` or `.\venv\Scripts\Activate.ps1` will work. The change is permanent for your user account.

**Antivirus.** Real-time scanning (Windows Defender included) can quarantine PyInstaller's output or dramatically slow the build. If `Finzytrack.exe` mysteriously disappears from `desktop\dist\Finzytrack\` after a successful build, add the repository folder to Defender's exclusions via **Settings → Privacy & Security → Windows Security → Virus & threat protection → Manage settings → Exclusions**.

**Short paths.** Some PyInstaller hooks and Node tooling struggle with very long Windows paths. Clone the repository at a short path like `C:\finzytrack` rather than a deep nested location under `Documents` or `OneDrive`.

## Setting Up the Repository

### 1. Clone the repository

```bash
git clone https://github.com/sagarbehere/finzytrack.git
cd finzytrack
```

### 2. Set up the Python virtual environment

```bash
python -m venv venv
source venv/bin/activate                    # macOS / Linux
# .\venv\Scripts\Activate.ps1               # Windows (PowerShell)
# venv\Scripts\activate.bat                 # Windows (cmd.exe)
```

On Windows, `Activate.ps1` requires the execution policy change noted under the [Windows prerequisites](#platform-specific-prerequisites) above. If you prefer to skip that, use `cmd.exe` and the `.bat` activator instead.

### 3. Install dependencies

Optionally, upgrade pip itself to the latest release before installing dependencies. The `python -m pip` form is required on Windows (the `pip.exe` shim can't overwrite itself while it's running) and works identically on macOS and Linux:

```bash
python -m pip install --upgrade pip
```

Then install the project dependencies:

```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

## Running in Development Mode

During development, the backend and frontend run as separate processes. The Vite dev server proxies API requests to the backend, so both need to be running at the same time.

### Start the backend

From the `backend/` directory, with the virtual environment active:

```bash
cd backend
python -m app.main
```

This starts the FastAPI server on `http://127.0.0.1:8001`. The backend accepts several options:

```bash
# With debug logging
python -m app.main --debug

# Custom port
python -m app.main --server-port 9000

# Specify a ledger file
python -m app.main --ledger-file /path/to/ledger.beancount
```

On first run, the backend seeds a default configuration in `backend/config/` if one doesn't already exist.

### Start the frontend dev server

In a separate terminal, from the `frontend/` directory:

```bash
cd frontend
npm run dev
```

This starts the Vite dev server on `http://127.0.0.1:3000` with hot module replacement. The dev server proxies `/api` and `/health` requests to the backend on port 8001, so the frontend and backend work together seamlessly.

Open `http://127.0.0.1:3000` in your browser to use Finzytrack in development mode.

### Serving the frontend from the backend

Alternatively, you can build the frontend and have the backend serve it directly, without the Vite dev server:

```bash
cd frontend
npm run build
cd ../backend
python -m app.main --static-dir ../frontend/dist
```

This serves the built frontend from the backend on `http://127.0.0.1:8001`. This is closer to how the packaged desktop app works, but you lose hot module replacement.

## Building the Desktop App

The desktop build packages the backend, frontend, and a native window shell into a single distributable binary. You need one additional dependency:

```bash
pip install -r desktop/requirements.txt
```

### Run the build

```bash
cd desktop
python build.py
```

This will:
1. Build the Vue frontend (`npm run build`).
2. Run PyInstaller with `finzytrack.spec`.
3. Package the result for the current platform.

#### Build options

| Flag | Effect |
|---|---|
| `--clean` | Remove `build/` and `dist/` before building |
| `--skip-frontend` | Skip the frontend build step (use an existing `frontend/dist/`) |

#### What the build produces

**macOS:**

```
desktop/dist/Finzytrack.app
```

The `.app` bundle is ad-hoc codesigned and has the quarantine attribute stripped so it launches without Gatekeeper warnings during development.

**Linux:**

```
desktop/dist/Finzytrack-x86_64.AppImage
```

The build script assembles an AppDir from the PyInstaller output, the `.desktop` file, and app icons, then uses `appimagetool` to create the AppImage. If `appimagetool` is not already present in `desktop/build/`, the script downloads it automatically.

**Windows:**

```
desktop/dist/Finzytrack-windows.zip
```

A zip archive containing the `Finzytrack/` directory with `Finzytrack.exe` and all dependencies.

For instructions on installing and running the packaged app, see the [Installation](/installation/) page.

## How the Build System Works

The desktop build lives in the `desktop/` directory and uses three key tools:

- **PyInstaller** packages the Python backend, all its dependencies, and bundled data files into a single directory of native binaries.
- **PyWebView** provides the native window that hosts the frontend. At runtime, the launcher starts the FastAPI server in a background thread and points a native webview at it.
- **`build.py`** is the cross-platform build script that orchestrates the entire process: building the frontend, running PyInstaller, and performing platform-specific packaging.

### What gets bundled

PyInstaller is configured via `desktop/finzytrack.spec`. It bundles:

| Asset | Source | Bundle location |
|---|---|---|
| Seed config template | `backend/resources/seed_config/` | `backend/seed_config/` |
| Seed data template | `backend/resources/seed_data/` | `backend/seed_data/` |
| Rule and ledger templates | `backend/app/templates/` | `app/templates/` |
| AI prompt templates | `backend/resources/prompts/` | `resources/prompts/` |
| Frontend SPA | `frontend/dist/` | `frontend_dist/` |
| Beancount VERSION file | site-packages | `beancount/` |

All Python dependencies (beancount, FastAPI, uvicorn, scikit-learn, etc.) are automatically collected as hidden imports.

### Platform-specific packaging

The build script detects the current OS and runs the appropriate packaging step:

| Platform | PyInstaller output | Final artifact |
|---|---|---|
| macOS | `dist/Finzytrack.app` (`.app` bundle) | Ad-hoc codesigned `.app` |
| Linux | `dist/Finzytrack/` (directory) | `Finzytrack-x86_64.AppImage` |
| Windows | `dist/Finzytrack/` (directory) | `Finzytrack-windows.zip` |

### The launcher

`desktop/launcher.py` is the entry point for the packaged app. When launched, it:

1. Resolves paths — from `sys._MEIPASS` when frozen (packaged) or from the source tree in development.
2. Creates a platform-specific user data directory on first run.
3. Starts the FastAPI backend in a background thread.
4. Waits for the backend to respond on `/health` (up to 180 seconds).
5. Opens a PyWebView window pointing at the backend URL.
6. On window close, signals a graceful backend shutdown.

The launcher also supports `--headless` mode, which skips the GUI window and runs the server only. The backend always serves the frontend on its HTTP port, so you can access Finzytrack from a browser at `http://127.0.0.1:8001` whether or not the native window is open.

## Building with GitHub Actions (CI)

Since PyInstaller produces native binaries and cannot cross-compile, builds for each platform must run on that platform's OS. The repository includes a GitHub Actions workflow (`.github/workflows/build-desktop.yml`) that builds on all three platforms in parallel using GitHub's hosted runners.

### Triggering a build

**Manual:** Go to the **Actions** tab in GitHub, select **Build Desktop App**, and click **Run workflow**.

**Automatic:** Push a version tag to trigger a build and create a draft release:

```bash
git tag v0.2.0
git push --tags
```

### What the workflow does

Each platform job:

1. Checks out the repository.
2. Sets up Python 3.13 and Node.js 22.
3. Installs all dependencies (frontend, backend, desktop, and Linux system packages where needed).
4. Runs `python build.py` in the `desktop/` directory.
5. Uploads the platform artifact.

When triggered by a version tag (`v*`), a separate release job runs after all builds complete. It downloads all three artifacts and creates a **draft GitHub Release** with the binaries attached.

### Build artifacts

After a successful workflow run, artifacts are available for download from the workflow run page in the Actions tab:

| Artifact | Contents |
|---|---|
| `Finzytrack-macOS` | `Finzytrack-macOS.zip` containing the `.app` bundle |
| `Finzytrack-Linux` | `Finzytrack-x86_64.AppImage` |
| `Finzytrack-Windows` | `Finzytrack-windows.zip` |

## Key Files Reference

| File | Purpose |
|---|---|
| `desktop/build.py` | Cross-platform build script |
| `desktop/build.sh` | Legacy macOS-only build script |
| `desktop/finzytrack.spec` | PyInstaller configuration (data files, hidden imports, icons) |
| `desktop/launcher.py` | App entry point (starts backend, opens window) |
| `desktop/requirements.txt` | Build dependencies (PyInstaller, PyWebView) |
| `desktop/linux/AppRun` | AppImage entry point |
| `desktop/linux/finzytrack.desktop` | Linux desktop entry file |
| `assets/icons/` | App icons for all platforms |
| `.github/workflows/build-desktop.yml` | CI workflow for building on all platforms |
