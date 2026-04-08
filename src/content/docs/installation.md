---
title: Installation
description: How to download, install, and set up Finzytrack.
---

:::note
This page is under construction.
:::

## Prerequisites

- Python 3.11+
- Node.js 18+

## Desktop App

Download the latest release from the [releases page](https://github.com/finzytrack/finzytrack/releases).

## From Source

```bash
# Clone the repository
git clone https://github.com/finzytrack/finzytrack.git
cd finzytrack

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
npm run build
```
