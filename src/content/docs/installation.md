---
title: Installation
description: How to download, install, and run Finzytrack on macOS, Linux, and Windows.
---

## Platform support

The prebuilt binaries have been tested on:

| Platform | Tested on |
|---|---|
| macOS | macOS Tahoe (26.x), Apple Silicon |
| Linux | Debian 13 (Trixie), x86_64 |
| Windows | Windows 11 Home |

The Linux AppImage should also work on similarly modern Debian/Ubuntu derivatives that ship WebKit2GTK 4.1 (Ubuntu 22.04+, Linux Mint 21+, Pop!_OS 22.04+, recent Fedora). Older releases such as Debian 12 (Bookworm), Ubuntu 20.04, and RHEL 8 ship older system libraries and won't run the prebuilt AppImage.

**If the prebuilt binary doesn't run on your system, build Finzytrack yourself from source.** This is much less involved than it sounds — the [Build Instructions](/development/building/) page walks through every step. The process takes 10–15 minutes once your build prerequisites are installed, and the result is a binary tailored to your system's library versions.

## Download

Download the latest release for your platform:

| Platform | Direct download |
|---|---|
| macOS | [`Finzytrack-macOS.zip`](https://github.com/sagarbehere/finzytrack/releases/latest/download/Finzytrack-macOS.zip) |
| Linux | [`Finzytrack-x86_64.AppImage`](https://github.com/sagarbehere/finzytrack/releases/latest/download/Finzytrack-x86_64.AppImage) |
| Windows | [`Finzytrack-windows.zip`](https://github.com/sagarbehere/finzytrack/releases/latest/download/Finzytrack-windows.zip) |

The links above always resolve to the most recent stable release. To browse historical releases, change logs, or pre-release builds, visit the [GitHub Releases page](https://github.com/sagarbehere/finzytrack/releases).

## macOS

The macOS build is for **Apple Silicon (M-series) only**. Intel Macs are not supported by the prebuilt binary — build from source if you're on Intel.

### Install

1. Download `Finzytrack-macOS.zip`.
2. Extract the zip — this produces `Finzytrack.app`.
3. Drag `Finzytrack.app` to your **Applications** folder.
4. Open Finzytrack — see [First launch on macOS](#first-launch-on-macos) below for the one-time security step.

### First launch on macOS

Finzytrack is not signed with an Apple Developer certificate yet (this will change in a future release). On macOS Sequoia (15) and Tahoe (26), Apple's Gatekeeper blocks unsigned apps downloaded from the internet and shows the dialog **"could not verify Finzytrack is free of malware…"** with only **Move to Trash** and **Done** as options. The right-click → Open workaround that worked on older macOS no longer exists.

You only need to do this **once**, when you first launch the app after downloading it.

**Recommended: Terminal (one command).**

Open the Terminal app, type the following with a trailing space:

```bash
xattr -dr com.apple.quarantine 
```

Then drag `Finzytrack.app` from Finder into the Terminal window — the full path is pasted in automatically. Press Return. Then launch the app normally from Finder.

The command strips Apple's "downloaded from the internet" marker. After this, the app launches without any warning.

**Alternative: System Settings (GUI).**

1. Try to launch the app — the security dialog appears. Click **Done**.
2. Open **System Settings → Privacy & Security**.
3. Scroll down to the **Security** section.
4. You'll see a line referencing the blocked Finzytrack app with an **Open Anyway** button. Click it.
5. Confirm with your password / Touch ID.
6. Launch the app from Finder again — it'll open this time.

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete `Finzytrack.app` from your Applications folder.
3. Delete your user data: `~/Library/Application Support/Finzytrack/`

## Linux

### Install

1. Download `Finzytrack-x86_64.AppImage`.
2. Make it executable:

```bash
chmod +x Finzytrack-x86_64.AppImage
```

3. Run it:

```bash
./Finzytrack-x86_64.AppImage
```

The AppImage is a single self-contained file — no installation step is needed. You can move it anywhere you like (e.g., `~/Applications/`).

### Required runtime packages

The AppImage doesn't bundle GTK, WebKit, or any other system libraries — it relies on the user's distro to supply them. The two packages you need are:

- **`libwebkit2gtk-4.1`** — the WebKit rendering engine used to display the UI
- **`libfuse2`** — required by AppImage itself to mount as a runtime filesystem

Use whichever line matches your distro:

| Distro | Install command |
|---|---|
| Debian 13 / Ubuntu 24.04+ | `sudo apt install libwebkit2gtk-4.1-0 libfuse2t64` |
| Debian 12 / Ubuntu 22.04 | `sudo apt install libwebkit2gtk-4.1-0 libfuse2` |
| Fedora 36+ | `sudo dnf install webkit2gtk4.1 fuse-libs` |
| Arch / Manjaro | `sudo pacman -S webkit2gtk-4.1 fuse2` |
| openSUSE Tumbleweed | `sudo zypper install libwebkit2gtk-4_1-0 libfuse2` |

The package manager will pull in everything else (GLib, GTK, Pango, Cairo, X11, font/icon libraries…) as transitive dependencies, so you don't need to list them yourself.

If the AppImage fails to start with `cannot open shared object file: libwebkit2gtk-4.1.so.0`, install the package above. The launcher also prints a friendly install hint when it detects WebKit is missing.

On Debian 13, the FUSE package is named `libfuse2t64` rather than `libfuse2` — part of Debian 13's time_t 64-bit transition. Older distros still use the `libfuse2` name.

To integrate Finzytrack with your desktop environment (application menu, file manager, etc.), you can use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

### Running without a graphical session

On a server install with no X or Wayland, pass `--headless` to start the backend only:

```bash
./Finzytrack-x86_64.AppImage --headless
```

The app is then reachable from any browser at `http://127.0.0.1:8001`.

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete the AppImage file.
3. Delete your user data: `~/.local/share/Finzytrack/`

If you used AppImageLauncher, also remove the desktop entry from `~/.local/share/applications/`.

## Windows

### Install

1. Download `Finzytrack-windows.zip`.
2. Extract the zip — this produces a `Finzytrack` folder.
3. Open the folder and double-click `Finzytrack.exe`.

There is no installer. The app runs directly from the extracted folder. You can move the folder anywhere and create a shortcut to `Finzytrack.exe` on your Desktop or pin it to the Start Menu.

Windows Defender SmartScreen may show a warning because the executable is not signed with a Windows code signing certificate. Click **More info** and then **Run anyway**.

A small console window opens alongside the main application window. This is intentional in current builds: it shows diagnostic output while Finzytrack starts up, so if something goes wrong you can copy the text from it and share it when reporting an issue. Closing the console window also closes the app — close the main Finzytrack window instead. Later releases will hide it.

### If the app fails to start with a ".NET" error

Windows tags every file extracted from a downloaded zip as untrusted ("Mark of the Web"), and this can prevent the bundled .NET assemblies from loading. The launcher tries to clear this marker on startup, but if you see an error mentioning `Python.Runtime.Loader.Initialize` or `clr_loader`, you can clear the markers manually. Open PowerShell, navigate to the extracted folder, and run:

```powershell
Get-ChildItem -Recurse . | Unblock-File
```

Then start `Finzytrack.exe` again.

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete the `Finzytrack` folder.
3. Delete your user data: `%LOCALAPPDATA%\Finzytrack\`

## User data

On first launch, Finzytrack creates a data directory and seeds it with default configuration. All user data (configuration, ledger, database) is stored here:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Finzytrack/` |
| Linux | `~/.local/share/Finzytrack/` |
| Windows | `%LOCALAPPDATA%\Finzytrack\` |

Uninstalling the app does not remove this directory. Delete it manually if you want to remove all data.

## Command-line options

The Finzytrack launcher accepts the following options:

| Option | Description | Default |
|---|---|---|
| `--headless` | Run without a GUI window (server only) | off |
| `--host HOST` | Backend server host | `127.0.0.1` |
| `--port PORT` | Backend server port | `8001` |
| `--config PATH` | Path to config file | `config/config.yaml` |
| `--ledger-file PATH` | Path to Beancount ledger file | from config |
| `--log-level LEVEL` | Logging level | `INFO` |
| `--debug` | Enable debug mode | off |

The backend always serves the frontend on its HTTP port, so you can access Finzytrack from a browser at `http://127.0.0.1:8001` whether or not the native window is open.

## Building from source

If you want to build Finzytrack from source or create builds for other platforms, see the [Build Instructions](/development/building/) page.

## Advanced: Self-hosting on a server

:::danger
This section is for advanced users who are comfortable administering a Linux server and who fully understand the security implications. Finzytrack has **no built-in authentication or access control**. If you expose it on a network without proper safeguards, **anyone who can reach the server can view and modify your financial data**. If you are not confident in your ability to secure this setup, do not proceed.
:::

Finzytrack is designed as a local desktop app, but it can be self-hosted on a VPS or home server so that you can access it from multiple devices. This is not an officially supported configuration — you are entirely responsible for securing it.

### Setup

On your server, clone the repository and install dependencies:

```bash
git clone https://github.com/sagarbehere/finzytrack.git
cd finzytrack

python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

cd frontend
npm install
npm run build
cd ..
```

Start the backend, serving the built frontend:

```bash
cd backend
python -m app.main --static-dir ../frontend/dist --host 0.0.0.0
```

This starts Finzytrack on port 8001, accessible from the network.

If you prefer, you can also use a packaged desktop binary with `--headless --host 0.0.0.0` instead of running from source.

### Securing access

Do not expose Finzytrack directly to the internet without authentication. There are two common approaches:

**Option A: Reverse proxy with authentication.** Place a reverse proxy like [Caddy](https://caddyserver.com/) or [nginx](https://nginx.org/) in front of Finzytrack. The reverse proxy should handle HTTPS (Caddy does this automatically via Let's Encrypt) and authentication (HTTP basic auth, OAuth, or another authentication layer). A minimal Caddy example:

```
finzytrack.example.com {
    basicauth * {
        your_username $2a$14$hashed_password_here
    }
    reverse_proxy localhost:8001
}
```

**Option B: VPN or private network.** Use a VPN such as [Tailscale](https://tailscale.com/) or [WireGuard](https://www.wireguard.com/) to make your server reachable only from your own devices. With this approach, Finzytrack never needs to be exposed to the public internet, and you can skip the reverse proxy and authentication entirely. This is the simpler and more secure option if you only need access from your own devices.

### Keeping it running

Use a process manager like `systemd` or `supervisord` to keep Finzytrack running and restart it after crashes or reboots. A basic systemd unit file (update `/path/to/finzytrack` to match where you cloned the repository):

```ini
[Unit]
Description=Finzytrack
After=network.target

[Service]
Type=simple
User=finzytrack
WorkingDirectory=/path/to/finzytrack/backend
ExecStart=/path/to/finzytrack/venv/bin/python -m app.main --static-dir /path/to/finzytrack/frontend/dist --host 127.0.0.1
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Updating

To update a self-hosted instance, pull the latest changes, reinstall dependencies, rebuild the frontend, and restart the service:

```bash
cd finzytrack
git pull
source venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install && npm run build && cd ..
# Restart the service (if using systemd)
sudo systemctl restart finzytrack
```

:::danger
To reiterate: Finzytrack has no authentication. You are responsible for securing access to your instance. Without proper authentication and HTTPS, your financial data will be exposed to anyone who can reach your server. You have been warned.
:::
