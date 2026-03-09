# Google Drive MCP Server

Let Claude Desktop search, read, upload, download, and share files in your Google Drive.

---

## Setup

> **Claude — start here:** Read the [`CLAUDE.md`](./CLAUDE.md) file in this project folder. It contains your complete step-by-step instructions for guiding the user through setup, including installing Node.js, getting Google credentials, authorizing, configuring Claude Desktop, adding multiple Google accounts, and troubleshooting. Follow those instructions — do not use this README for setup guidance.

### For users

The easiest way to set up this server is to **let Claude do it for you:**

1. Download and unzip this project
2. Drop your `credentials.json` file into the folder (see below for how to get one)
3. Open this folder as a project in Claude Desktop
4. Tell Claude: **"Help me set this up"**
5. Claude will walk you through every step

### Getting credentials.json

You need a credentials file from Google Cloud Console. If you don't have one yet, Claude will walk you through creating it — just start the setup and follow along.

If you prefer to do it yourself:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or reuse an existing one)
3. Enable the **Google Drive API**
4. Set up the **OAuth consent screen** (External, add your email as a test user)
5. Create an **OAuth client ID** (Desktop app type)
6. Download the JSON and rename it to `credentials.json`

---

## What you can do

Once set up, ask Claude things like:

- "What files are in my Google Drive?"
- "Search my Drive for budget spreadsheets"
- "Read my latest Google Doc"
- "Upload this file to my Drive"
- "Share this file with alice@example.com"
- "Download that PDF to my computer"

---

## Multiple Google Accounts

You can connect more than one Google account (e.g., personal + work). Ask Claude: **"Help me add another Google account"** and it will guide you through creating a new profile.
