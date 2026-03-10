# Google Drive MCP Server

Let Claude Desktop search, read, upload, download, and share files in your Google Drive.

---

## Setup

> **Claude — start here:** Read the [`CLAUDE.md`](./CLAUDE.md) file in this project folder. It contains your complete step-by-step instructions for guiding the user through setup, including installing Node.js, getting Google credentials, authorizing, configuring Claude Desktop, adding multiple Google accounts, and troubleshooting. Follow those instructions — do not use this README for setup guidance.

### For users

The easiest way to set up this server is to **let Claude do it for you:**

1. **Start a session in a folder** — In Claude Desktop, click the **folder icon** (bottom-left of the chat input) and select a folder where you'd like the project to live (e.g., Documents, Desktop, or your home folder). Claude needs this to run commands on your machine and to save files where you can find them.

2. **Paste this into the chat:**

```
Set up a Google Drive MCP server for me. First, check that I'm working in a folder session — run `pwd` and make sure it's a real user folder (not a sandbox like /private/var/folders/). If I'm not in a folder session, help me fix that before doing anything else. Then download it from https://github.com/xorbh/gdrive-mcp/archive/refs/heads/master.zip, unzip it into this folder, then read the CLAUDE.md file inside and follow its instructions to guide me through setup step by step.
```

That's it — Claude will download everything into your selected folder, then walk you through each step.

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
