# Google Drive MCP Server

This MCP server lets Claude Desktop access your Google Drive — search files, read documents, upload, download, share, and more.

---

## What You'll Need Before Starting

- **A computer** running macOS, Windows, or Linux
- **Claude Desktop** installed on your computer ([download here](https://claude.ai/download))
- **Node.js** version 18 or newer — this is the engine that runs the server

### How to check if you have Node.js

1. Open your terminal:
   - **Mac**: Open the **Terminal** app (search for "Terminal" in Spotlight)
   - **Windows**: Open **PowerShell** (search for "PowerShell" in the Start menu)
2. Type `node --version` and press Enter
3. If you see a version number like `v18.0.0` or higher, you're good!
4. If you get an error, download Node.js from [nodejs.org](https://nodejs.org/) — choose the **LTS** version

---

## Setup Guide

### Step 1: Download this project

1. Open your terminal
2. Choose a folder where you'd like to keep this project. For example, your home folder:
   ```
   cd ~
   ```
3. Download the project:
   ```
   git clone https://github.com/xorbh/gdrive-mcp.git
   ```
4. Go into the project folder:
   ```
   cd gdrive-mcp
   ```

### Step 2: Create a Google Cloud Project

You need to tell Google that your app is allowed to access your Drive. Don't worry — this is just for your own personal use.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the Google account whose Drive you want to access
3. At the top of the page, click the project dropdown (it may say "Select a project")
4. Click **New Project**
5. Name it something like `My MCP Servers` and click **Create**
6. Wait a moment, then make sure your new project is selected in the dropdown at the top

### Step 3: Enable the Google Drive API

1. In Google Cloud Console, go to the search bar at the top
2. Type `Google Drive API` and select it from the results
3. Click the blue **Enable** button
4. Wait for it to finish enabling

### Step 4: Set up the OAuth Consent Screen

This step tells Google what your app is and what it needs access to.

1. In the left sidebar, go to **APIs & Services** > **OAuth consent screen**
2. Click **Get started** (or **Configure consent screen**)
3. Fill in:
   - **App name**: `MCP Server` (or whatever you like)
   - **User support email**: select your email
   - **Audience**: choose **External**
4. Click **Next** / **Save and Continue** through the remaining steps
5. On the **Scopes** step, click **Add or remove scopes**, search for `Google Drive API`, check the `../auth/drive` scope, and click **Update** then **Save and Continue**
6. On the **Test users** step, click **Add users** and add your own Gmail address, then **Save and Continue**
7. Click **Back to Dashboard**

> **Note:** While your app is in "Testing" mode, only the test users you added can use it. This is fine for personal use!

### Step 5: Create OAuth Credentials

1. In the left sidebar, go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** at the top
3. Choose **OAuth client ID**
4. For **Application type**, select **Desktop app**
5. Give it a name like `MCP Desktop Client`
6. Click **Create**
7. A dialog will appear with your client ID — click **Download JSON**
8. This downloads a file with a long name. **Rename it** to `credentials.json`

### Step 6: Save your credentials

1. Inside the `gdrive-mcp` project folder, create a folder called `config`, and inside that a folder for your account:
   ```
   mkdir -p config/personal
   ```
   (Use any name you like instead of `personal` — like `work` if it's your work account)

2. Move the `credentials.json` file you downloaded into that folder:
   ```
   mv ~/Downloads/credentials.json config/personal/
   ```

### Step 7: Install and build

1. Make sure you're in the `gdrive-mcp` folder, then run:
   ```
   npm install
   ```
2. Build the project:
   ```
   npm run build
   ```

### Step 8: Authorize with Google

This step opens your browser so you can give the server permission to access your Drive.

1. Run:
   ```
   npm run auth -- --config-dir config/personal
   ```
2. A URL will appear in the terminal — **copy and paste it into your browser**
3. Sign in with your Google account and click **Allow** / **Continue**
4. You may see a warning that says "Google hasn't verified this app" — click **Advanced** and then **Go to MCP Server (unsafe)**. This is safe because you created the app yourself!
5. After you approve, the browser will show "Authorization successful!" and you can close that tab
6. Back in the terminal, you should see "Token saved" — you're done!

### Step 9: Add to Claude Desktop

1. Open **Claude Desktop**
2. Go to **Settings** (click Claude menu > Settings, or use Cmd+, on Mac)
3. Click **Developer** in the left sidebar
4. Click **Edit Config**
5. This opens a file called `claude_desktop_config.json`. Add the following inside the `"mcpServers"` section:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/gdrive-mcp/dist/index.js",
        "--config-dir",
        "/FULL/PATH/TO/gdrive-mcp/config/personal"
      ]
    }
  }
}
```

> **Important:** Replace `/FULL/PATH/TO/gdrive-mcp` with the actual path to where you cloned the project. For example:
> - Mac: `/Users/yourname/gdrive-mcp`
> - Windows: `C:\\Users\\yourname\\gdrive-mcp`
>
> **Tip:** To find the full path, run `pwd` in the terminal while inside the project folder.

6. Save the file and **restart Claude Desktop**
7. You should see a hammer icon in the chat input area — this means the MCP server is connected!

---

## Using It

Once set up, you can ask Claude things like:

- "Search my Google Drive for budget spreadsheets"
- "Read the contents of my latest document"
- "Upload this file to my Drive"
- "Share this file with alice@example.com"
- "What files did I modify this week?"

---

## Multiple Google Accounts

Want to connect both personal and work Drive accounts? Create separate config folders:

```
mkdir -p config/work
mv ~/Downloads/credentials.json config/work/
npm run auth -- --config-dir config/work
```

Then add another entry in your Claude Desktop config:

```json
{
  "mcpServers": {
    "gdrive-personal": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/gdrive-mcp/dist/index.js",
        "--config-dir",
        "/FULL/PATH/TO/gdrive-mcp/config/personal",
        "--name",
        "gdrive-personal"
      ]
    },
    "gdrive-work": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/gdrive-mcp/dist/index.js",
        "--config-dir",
        "/FULL/PATH/TO/gdrive-mcp/config/work",
        "--name",
        "gdrive-work"
      ]
    }
  }
}
```

---

## Troubleshooting

### "Missing credentials.json"
You haven't placed the `credentials.json` file in the right folder. Go back to Step 6.

### "Missing token.json"
You haven't run the authorization step yet. Go back to Step 8.

### "Token has been expired or revoked"
Re-run the auth command from Step 8 to get a fresh token.

### The hammer icon doesn't appear in Claude Desktop
- Make sure you saved the config file correctly (valid JSON — watch for missing commas!)
- Make sure the file paths in the config are correct and absolute (start with `/` on Mac or `C:\\` on Windows)
- Restart Claude Desktop completely (quit and reopen)

### "Google hasn't verified this app" warning
This is normal! Since you created the app yourself for personal use, it won't be verified by Google. Click **Advanced** > **Go to MCP Server (unsafe)** to continue.
