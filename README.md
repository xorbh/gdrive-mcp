# Google Drive MCP Server

Let Claude Desktop search, read, upload, download, and share files in your Google Drive.

---

## Setup Overview

There are 3 main steps:

1. **Install Node.js** (if you don't have it)
2. **Get your Google credentials** (a one-time setup in Google Cloud Console)
3. **Run the setup script** (double-click — it does the rest)

Total time: about 15 minutes.

---

## Step 1: Install Node.js

Node.js is the engine that runs this server. You only need to install it once.

1. Go to [nodejs.org](https://nodejs.org/)
2. Click the big green **LTS** button to download
3. Open the downloaded file and follow the installer
4. **Windows users:** restart your computer after installing

**Already have Node.js?** You can skip this step.

---

## Step 2: Get Your Google Credentials

You need to create a small project in Google Cloud Console so that this server can access your Drive. This is just for your personal use — no one else will have access.

### 2a. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the Google account whose Drive you want to access
3. At the top of the page, click the project dropdown (it may say "Select a project")
4. Click **New Project**
5. Name it something like `My MCP Servers`
6. Click **Create**
7. Make sure your new project is selected in the dropdown at the top

### 2b. Turn on the Google Drive API

1. In the search bar at the top, type `Google Drive API`
2. Click on it in the results
3. Click the blue **Enable** button
4. Wait a moment for it to finish

### 2c. Set up the consent screen

1. In the left sidebar, click **APIs & Services** then **OAuth consent screen**
2. Click **Get started**
3. Fill in:
   - **App name:** `MCP Server`
   - **User support email:** pick your email from the dropdown
   - **Audience:** choose **External**
4. Click through **Next** / **Save and Continue** on each page
5. On the **Scopes** page: click **Add or remove scopes**, search for `Google Drive API`, check the `../auth/drive` scope, click **Update**, then **Save and Continue**
6. On the **Test users** page: click **Add users**, type your Gmail address, click **Add**, then **Save and Continue**
7. Click **Back to Dashboard**

### 2d. Create your credentials file

1. In the left sidebar, click **APIs & Services** then **Credentials**
2. Click **+ Create Credentials** at the top
3. Choose **OAuth client ID**
4. For **Application type**, pick **Desktop app**
5. Name it anything (like `MCP Desktop Client`)
6. Click **Create**
7. In the popup, click **Download JSON**
8. **Rename** the downloaded file to exactly: `credentials.json`

---

## Step 3: Download and Run Setup

1. Go to the [Releases page](https://github.com/xorbh/gdrive-mcp/releases) and download the latest **Source code (zip)**
2. Unzip the downloaded file (double-click it)
3. Open the unzipped folder
4. **Drop your `credentials.json` file into this folder** (the one you downloaded in Step 2d)
5. Double-click the setup script:
   - **Mac:** double-click `setup.command`
   - **Windows:** double-click `setup.bat`
6. Follow the instructions in the window that appears

The setup script will:
- Install everything the server needs
- Build the project
- Open a Google sign-in page in your browser — sign in and click **Allow**
- Print the exact config to paste into Claude Desktop

### Mac: "Cannot be opened" warning?

If you see a warning when double-clicking `setup.command`:
1. **Right-click** (or Control-click) on `setup.command`
2. Choose **Open** from the menu
3. Click **Open** in the dialog that appears

You only need to do this once.

### Google sign-in: "Google hasn't verified this app"?

This is normal! You created this app yourself, so Google hasn't reviewed it. Just:
1. Click **Advanced**
2. Click **Go to MCP Server (unsafe)**
3. Click **Allow**

This is completely safe — the app only connects to your own Google account.

---

## Step 4: Add to Claude Desktop

After the setup script finishes, it will print a JSON config block. To use it:

1. Open **Claude Desktop**
2. Click the **Claude** menu, then **Settings** (or press **Cmd+,** on Mac)
3. Click **Developer** on the left side
4. Click **Edit Config**
5. **Replace everything** in the file with the JSON the setup script printed
6. Save the file
7. **Quit Claude Desktop completely** and reopen it

You should see a small hammer icon in the chat input area — that means it's connected!

> **Already have other MCP servers configured?** Don't replace the whole file — just add the `"gdrive": { ... }` block inside your existing `"mcpServers"` section, separated by a comma.

---

## Try It Out

Ask Claude things like:

- "What files are in my Google Drive?"
- "Search my Drive for budget spreadsheets"
- "Read my latest Google Doc"
- "Upload this file to my Drive"
- "Share this file with alice@example.com"
- "Download that PDF to my computer"

---

## Troubleshooting

### The hammer icon doesn't appear
- Make sure you saved the config file
- Make sure you quit Claude Desktop completely and reopened it (not just closed the window)
- Check that the file paths in the config are correct — they should match what the setup script printed

### "Missing credentials.json" or "Missing token.json"
- Run the setup script again — it will redo the authorization

### "Token has been expired or revoked"
- Delete the file `config/default/token.json` inside the project folder
- Run the setup script again

### The setup script closes immediately
- **Mac:** Right-click the file and choose **Open** instead of double-clicking
- **Windows:** Make sure you restarted your computer after installing Node.js

---

## Multiple Google Accounts

Want to connect both personal and work accounts? This requires using the Terminal. Create a separate config folder and run auth again:

**Mac:**
```
cd /path/to/gdrive-mcp
mkdir -p config/work
cp config/default/credentials.json config/work/
npm run auth -- --config-dir config/work
```

Then add a second entry in your Claude Desktop config with `--config-dir config/work` and `--name gdrive-work`.
