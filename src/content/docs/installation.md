---
title: Installation
description: How to download, install, and run Finzytrack on macOS, Linux, and Windows.
---

## Platform support

Finzytrack is actively developed and tested on **macOS Tahoe (26.x)**. It has been briefly tested on **Ubuntu 24.04 LTS**. The Windows build is currently **untested** — it may work, but expect rough edges.

## Download

Download the latest release for your platform:

- [finzytrack.com/download](https://finzytrack.com/download)
- [GitHub Releases](https://github.com/finzytrack/finzytrack/releases)

| Platform | Download |
|---|---|
| macOS | `FinzyTrack-macOS.zip` |
| Linux | `FinzyTrack-x86_64.AppImage` |
| Windows | `FinzyTrack-windows.zip` |

## macOS

### Install

1. Download `FinzyTrack-macOS.zip`.
2. Extract the zip — this produces `FinzyTrack.app`.
3. Drag `FinzyTrack.app` to your **Applications** folder.
4. Double-click to launch.

On first launch, macOS may show a security warning because the app is not signed with an Apple Developer certificate. Right-click the app, select **Open**, then click **Open** in the dialog. This is only needed once.

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete `FinzyTrack.app` from your Applications folder.
3. Delete your user data: `~/Library/Application Support/FinzyTrack/`

## Linux

### Install

1. Download `FinzyTrack-x86_64.AppImage`.
2. Make it executable:

```bash
chmod +x FinzyTrack-x86_64.AppImage
```

3. Run it:

```bash
./FinzyTrack-x86_64.AppImage
```

The AppImage is a single self-contained file — no installation step is needed. You can move it anywhere you like (e.g., `~/Applications/`).

FUSE is required to run AppImages. On Ubuntu 22.04+, install it with:

```bash
sudo apt-get install libfuse2
```

To integrate Finzytrack with your desktop environment (application menu, file manager, etc.), you can use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete the AppImage file.
3. Delete your user data: `~/.local/share/FinzyTrack/`

If you used AppImageLauncher, also remove the desktop entry from `~/.local/share/applications/`.

## Windows

:::caution
The Windows build has not been tested. It may not work correctly.
:::

### Install

1. Download `FinzyTrack-windows.zip`.
2. Extract the zip — this produces a `FinzyTrack` folder.
3. Open the folder and double-click `FinzyTrack.exe`.

There is no installer. The app runs directly from the extracted folder. You can move the folder anywhere and create a shortcut to `FinzyTrack.exe` on your Desktop or pin it to the Start Menu.

Windows Defender SmartScreen may show a warning because the executable is not signed with a Windows code signing certificate. Click **More info** and then **Run anyway**.

### Uninstall

1. Quit Finzytrack if it is running.
2. Delete the `FinzyTrack` folder.
3. Delete your user data: `%LOCALAPPDATA%\FinzyTrack\`

## User data

On first launch, Finzytrack creates a data directory and seeds it with default configuration. All user data (configuration, ledger, database) is stored here:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/FinzyTrack/` |
| Linux | `~/.local/share/FinzyTrack/` |
| Windows | `%LOCALAPPDATA%\FinzyTrack\` |

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
git clone https://github.com/finzytrack/finzytrack.git
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
