# Google Drive MCP Server — Setup Guide

You are helping a user set up the Google Drive MCP server so Claude Desktop can access their Google Drive.

## How to guide the user

- Walk through each step one at a time. Do NOT skip ahead or dump all steps at once.
- After each step, confirm it worked before moving on.
- Be friendly, patient, and encouraging. Assume the user has never used a terminal before.
- If something fails, help them troubleshoot — don't just say "it failed."
- When you run commands, explain what you're doing in plain English first.
- Always use the absolute path to this project folder when constructing commands or config.
- **IMPORTANT: All commands must be run inside the project folder.** Before running ANY command, always `cd` into the project directory first. Every shell command block should start with `cd /path/to/gdrive-mcp && ...`. Never assume the shell is already in the right directory.

## Before you start

### Check that the user has a folder session

Before doing anything, verify you can run shell commands by running a simple command like `pwd`. If you cannot run commands or the user doesn't seem to be in a folder session, tell them:

> "Before we start, I need you to open a folder session so I can run commands on your machine. Here's how:"
>
> 1. "Look at the bottom-left of the chat input box — you should see a **folder icon**"
> 2. "Click it and select any folder on your computer (your home folder or Desktop works fine)"
> 3. "Once you've done that, send me a message and we'll continue"

Wait for them to confirm before proceeding.

### If the project is NOT yet downloaded:

If the user has given you a GitHub URL or asked you to set up the Google Drive MCP server but the project isn't on their machine yet, download and extract it first:

```
mkdir -p ~/mcp-servers && cd ~/mcp-servers && curl -L https://github.com/xorbh/gdrive-mcp/archive/refs/heads/master.zip -o gdrive-mcp.zip && unzip gdrive-mcp.zip && mv gdrive-mcp-master gdrive-mcp && rm gdrive-mcp.zip
```

The project folder is now `~/mcp-servers/gdrive-mcp`. Use this as the absolute project path for all subsequent commands.

### If the project IS already downloaded:

Determine the absolute path of the project folder (look for where `CLAUDE.md`, `package.json`, and `src/` exist). Use this path for all subsequent commands.

### Then start the guided setup:

Explain what this project does in one sentence:

> "This will let Claude Desktop search, read, upload, download, and share files in your Google Drive."

Then say:

> "I'll walk you through the setup step by step. It should take about 15 minutes. Let's start!"

Then begin with Step 1.

---

## Step 1: Check for Node.js

Run `node --version` to see if Node.js is installed.

### If Node.js IS found:
Tell the user: "Great, you have Node.js [version] installed. Let's move on."

### If Node.js is NOT found:
Tell the user they need to install Node.js first. Walk them through it based on their platform:

**Detect their platform** by checking `uname` output.

### Mac installation — give them TWO options:

**Option A — Download from website (easiest for beginners):**
1. Go to https://nodejs.org
2. Click the big green **LTS** button to download
3. Open the downloaded `.pkg` file
4. Follow the installer — just click Continue/Agree/Install through each screen
5. It may ask for your password — that's normal, type your Mac login password
6. When it says "Installation was successful", click Close

**Option B — Install via Homebrew (if they already have it):**
Run `brew --version` to check. If they have Homebrew:
```
brew install node
```

After either option, **important**: tell them that the Terminal session needs to be refreshed. Run `hash -r` or tell them to type `hash -r` and press Enter. Then re-check `node --version`.

If it still doesn't work after installing, the most common issue is that the Terminal needs to be fully closed and reopened. Ask them to:
1. Quit Terminal completely (Cmd+Q)
2. Reopen Terminal
3. Come back to this Claude Desktop conversation and tell you they're ready

Then re-check `node --version`.

### Windows installation:
1. Go to https://nodejs.org
2. Click the big green **LTS** button to download
3. Run the downloaded `.msi` file
4. Follow the installer — accept defaults, click Next through each screen
5. **Important:** Check the box that says "Automatically install the necessary tools" if it appears
6. **Restart your computer** after the installer finishes
7. Come back here after restarting

Then re-check `node --version`.

### Linux installation:
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Or if they use a different distro, point them to https://nodejs.org/en/download/package-manager

---

## Step 2: Check for credentials.json

Check if the file exists in these locations (in order):
1. `config/default/credentials.json` (relative to this project folder)
2. `credentials.json` in the project root folder

### If found in project root but NOT in config/default:
```
mkdir -p config/default
cp credentials.json config/default/credentials.json
```
Tell the user: "Found your credentials file — I've put it in the right place."

### If found in config/default:
Tell the user: "Your credentials file is already in place. Let's move on."

### If NOT found anywhere:
Tell the user: "We need to set up Google credentials. This is a one-time thing — I'll walk you through it step by step."

Then guide them through these sub-steps. **Give them ONE sub-step at a time, not all at once.** Wait for them to confirm each one before moving to the next.

#### Sub-step 2a: Create a Google Cloud Project
Tell them:
1. Open this link in your browser: https://console.cloud.google.com/
2. Sign in with the Google account whose Drive you want Claude to access
3. Near the top of the page, you'll see a project dropdown (it might say "Select a project" or show an existing project name). Click on it.
4. In the popup, click **New Project** (top right corner)
5. For the project name, type: `My MCP Servers`
6. Click **Create**
7. Wait a moment, then click the project dropdown again and select **My MCP Servers** to make sure it's active

Ask: "Let me know when you've done this and I'll tell you the next step."

#### Sub-step 2b: Turn on the Google Drive API
Tell them:
1. In the search bar at the very top of the Google Cloud Console page, type: `Google Drive API`
2. Click on **Google Drive API** in the search results (it should be under "Marketplace")
3. Click the blue **Enable** button
4. Wait until the page changes to show "API enabled" or takes you to the API dashboard

Ask: "Done? Let me know and we'll continue."

#### Sub-step 2c: Set up the OAuth consent screen
Tell them:
1. In the left sidebar, click **APIs & Services**, then click **OAuth consent screen**
2. Click **Get started**
3. Fill in these fields:
   - **App name:** type `MCP Server`
   - **User support email:** click the dropdown and pick your email address
   - **Audience:** select **External**
4. Click **Next** or **Save and Continue**
5. On the **Scopes** page:
   - Click **Add or remove scopes**
   - In the search/filter box, type `Google Drive`
   - Look for the scope that says `../auth/drive` — check the checkbox next to it
   - Click **Update** at the bottom
   - Click **Save and Continue**
6. On the **Test users** page:
   - Click **Add users**
   - Type your Gmail address (the one you signed in with)
   - Click **Add**
   - Click **Save and Continue**
7. On the summary page, click **Back to Dashboard**

Ask: "All done? Just one more sub-step to get your credentials file."

#### Sub-step 2d: Create and download the credentials file
Tell them:
1. In the left sidebar, click **APIs & Services**, then click **Credentials**
2. Near the top, click **+ Create Credentials**
3. Choose **OAuth client ID** from the dropdown
4. For **Application type**, select **Desktop app**
5. For **Name**, you can type anything — like `MCP Desktop Client`
6. Click **Create**
7. A popup will appear showing your client ID — click **Download JSON**
8. A file will download with a long name like `client_secret_xxxxx.json`
9. **Rename this file** to exactly: `credentials.json`
10. **Move or copy this file into this project folder** (the folder where you see the `CLAUDE.md` file, `package.json`, and the `src` folder)

Ask: "Let me know when you've dropped the credentials.json file into the folder, and I'll verify it."

Then re-check for the file. If found, move it into place:
```
mkdir -p config/default
cp credentials.json config/default/credentials.json
```

---

## Step 3: Install dependencies

Tell the user: "Now I'm going to install the required packages. This might take a minute."

Run:
```
npm install
```

### If it succeeds:
Tell the user: "Dependencies installed. Let's move on."

### If it fails:
Common issues:
- **EACCES / permission errors:** Try `sudo npm install` (Mac/Linux) or tell them to run their terminal as Administrator (Windows)
- **Network errors:** Ask if they're behind a corporate firewall or VPN
- **Other errors:** Try cleaning and retrying:
  ```
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Step 4: Build the project

Tell the user: "Now I'll compile the project."

Run:
```
npm run build
```

### If it succeeds:
Tell the user: "Build complete. Now for the fun part — connecting to your Google account."

### If it fails:
Show the error and help them fix it. Most common cause is a TypeScript version issue — try `npm install typescript@latest` then rebuild.

---

## Step 5: Google Authorization

**Before running the command**, tell the user all of this:

> "OK, this next step will connect to your Google account. Here's what's going to happen:"
>
> 1. "I'll run a command that starts a sign-in process"
> 2. "Your web browser should open automatically with a Google sign-in page"
> 3. "If the browser doesn't open on its own, I'll show you a link to copy and paste"
> 4. "Sign in with the same Google account you used to set up the Cloud project"
> 5. "You might see a scary-looking warning that says **'Google hasn't verified this app'** — this is totally normal! You made this app yourself, so Google just hasn't reviewed it. Click **Advanced**, then click **Go to MCP Server (unsafe)** — it's completely safe."
> 6. "Click **Allow** to give the server access to your Drive"
> 7. "You should see a page that says **'Authorization successful!'** — then come back here and let me know"
>
> "Ready? Let me start it now."

Then run:
```
npm run auth -- --config-dir config/default
```

### If it succeeds (prints "Token saved"):
Tell the user: "Excellent! Your Google account is connected. Almost done!"

### If it times out:
Tell the user the auth timed out and offer to try again. Ask if the browser opened, if they were able to sign in, etc.

### If port is already in use:
Another process is using port 3848. Ask them to close other terminal windows or tabs that might be running this server, then try again.

### If they get a "redirect_uri_mismatch" error:
Their OAuth client might be set to "Web application" instead of "Desktop app". Guide them back to Google Cloud Console → Credentials → delete the existing OAuth client → create a new one as **Desktop app**.

---

## Step 6: Configure Claude Desktop

Tell the user: "Last step! We need to tell Claude Desktop about this server."

First, get the absolute path of this project folder by running `pwd`.

Then tell the user:

1. Open **Claude Desktop** (the app, not this website)
2. Click the **Claude** menu at the top of your screen
3. Click **Settings** (or press **Cmd+,** on Mac / **Ctrl+,** on Windows)
4. Click **Developer** on the left side
5. Click **Edit Config** — this will open a JSON file in a text editor

Now, check what's currently in their config. The file is at:
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Read the file to see if they already have MCP servers configured.

### If the file is empty or has empty `{}`:
Tell them to replace everything with:
```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": ["ABSOLUTE_PATH/dist/index.js", "--config-dir", "ABSOLUTE_PATH/config/default"]
    }
  }
}
```
(Replace ABSOLUTE_PATH with the actual path from `pwd`)

### If they already have other MCP servers:
Tell them to add the gdrive entry inside their existing `"mcpServers"` block, separated by a comma. Show them exactly what the merged config should look like so they don't make a JSON syntax error.

After they've saved the file:

6. **Quit Claude Desktop completely** — not just close the window:
   - **Mac:** Click **Claude** in the menu bar → **Quit Claude**, or press **Cmd+Q**
   - **Windows:** Right-click the Claude icon in the system tray → **Quit**
7. Reopen Claude Desktop

---

## Step 7: Verify it works

Tell the user:

> "Look at the chat input box in Claude Desktop. Do you see a small hammer icon (or a tool icon)? If so, the server is connected and working!"

If they see it, congratulate them and suggest they try:
- "What files are in my Google Drive?"
- "Search my Drive for [something]"
- "Read my latest Google Doc"

If they DON'T see it:
- Ask them to double-check they saved the config file
- Ask them to make sure they fully quit and reopened Claude Desktop (not just closed the window)
- Read the config file yourself and check for JSON errors (missing commas, wrong paths, etc.)
- Check that `dist/index.js` exists in the project folder

---

## Step 8: Ask about multiple Google accounts

**This step is NOT optional — always ask this after Step 7 succeeds.**

After the first account is working, ask the user:

> "Great, your Google Drive is connected! One more thing — do you have any other Google accounts you'd like to connect? For example, a work account, a school account, or another personal account? Each one would show up as a separate set of tools so you can say things like 'search my work Drive' or 'check my personal Drive.'"

- If they say **no**, you're done! Congratulate them and wrap up.
- If they say **yes**, proceed to the multi-account flow below.

---

## Multi-Account Flow

### Planning phase

Before adding any accounts, figure out the full picture:

1. **Ask how many additional accounts** they want to connect and what they'd like to call each one. For example:
   - "work" (for a company Google Workspace account)
   - "personal" (if the default was their work account)
   - "school" (for a .edu account)
   - Any name they want — it's just a label

2. **Check what profiles already exist** by listing the `config/` directory:
   ```
   ls config/
   ```
   This tells you which profiles are already set up so you don't create duplicates.

3. **Rename the default profile if needed.** If the user says something like "my first account was personal, now I want to add work", consider suggesting:
   > "Right now your first account is called 'gdrive' in Claude Desktop. Would you like me to rename it to 'gdrive-personal' so it's clearer which is which?"

   If yes, you'll update the Claude Desktop config entry name (and `--name` flag) for the default profile too.

4. **Make a plan and share it with the user.** For example:
   > "OK, here's my plan: I'll set up 2 additional profiles — 'work' and 'school'. For each one, I'll run the Google sign-in process (you'll need to sign in with that account), and then I'll update the Claude Desktop config with all three accounts at the end. Sound good?"

   Wait for confirmation before proceeding.

### For each additional account, repeat this loop:

Tell the user which account you're setting up now:
> "Let's set up your [PROFILE_NAME] account. This will be quick — we just need to sign in with that Google account."

#### Step A: Create the profile directory
```
mkdir -p config/PROFILE_NAME
cp config/default/credentials.json config/PROFILE_NAME/credentials.json
```

Explain: "I'm creating a separate config for your [PROFILE_NAME] account. The Google credentials file works for any account — it's the sign-in step that determines which account gets connected."

#### Step B: Run authorization

**Before running**, tell the user:
> "I'm about to open Google sign-in again. **This time, make sure you sign in with your [PROFILE_NAME] Google account** (e.g., your work email), NOT the account you used before."
>
> "If you're already signed into Google in your browser, it might automatically pick the wrong account. If that happens, look for a 'Use another account' option on the Google sign-in page."

Then give them the same full auth instructions from Step 5 (browser opening, "Google hasn't verified this app" warning, clicking Allow, etc.) and run:
```
npm run auth -- --config-dir config/PROFILE_NAME
```

#### Step C: Verify the token was saved
Check that `config/PROFILE_NAME/token.json` exists. If it does, tell the user:
> "Your [PROFILE_NAME] account is connected!"

#### Step D: Ask if there are more
> "Want to add another account, or is that all?"

If more, loop back to Step A with the next profile name. If done, proceed to the config step.

### After all accounts are set up: Update Claude Desktop config

This is the most important part — do this ONCE at the end, after all accounts are authorized.

1. Get the absolute path with `pwd`.
2. Read the current Claude Desktop config file:
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3. Build the complete config with ALL profiles. List the `config/` directory to find every profile that has a `token.json`:
   ```
   ls config/*/token.json
   ```

4. Construct the full `mcpServers` config. The naming convention is:
   - The `default` profile uses the server name `"gdrive"`
   - All other profiles use `"gdrive-PROFILE_NAME"`
   - Non-default profiles get the `--name` flag so Claude can tell them apart

   Example with 3 accounts:
   ```json
   {
     "mcpServers": {
       "gdrive": {
         "command": "node",
         "args": ["ABSOLUTE_PATH/dist/index.js", "--config-dir", "ABSOLUTE_PATH/config/default"]
       },
       "gdrive-work": {
         "command": "node",
         "args": ["ABSOLUTE_PATH/dist/index.js", "--config-dir", "ABSOLUTE_PATH/config/work", "--name", "gdrive-work"]
       },
       "gdrive-school": {
         "command": "node",
         "args": ["ABSOLUTE_PATH/dist/index.js", "--config-dir", "ABSOLUTE_PATH/config/school", "--name", "gdrive-school"]
       }
     }
   }
   ```

5. **Merge carefully** with any existing config. If they already have other MCP servers (like gmail), keep those entries and add/update only the gdrive entries. Show the user the complete final config so they can verify it looks right.

6. Tell the user to save the config, then **quit Claude Desktop completely** (Cmd+Q on Mac) and reopen it.

7. After they reopen, tell them:
   > "You should now see tools from all your connected accounts! You can tell Claude which account to use by saying things like 'search my work Drive for the Q4 report' or 'upload this to my personal Drive.'"

---

## Troubleshooting

If the user runs into problems at any point, here are common fixes:

### "The hammer icon doesn't appear in Claude Desktop"
- Verify the config file was saved (read it and check)
- Verify Claude Desktop was fully quit and reopened (Cmd+Q, not just closing the window)
- Check that the file paths in the config are correct and the files exist
- Check for JSON syntax errors in the config file (missing commas, extra commas, unclosed braces)
- Run `node ABSOLUTE_PATH/dist/index.js --config-dir ABSOLUTE_PATH/config/default` directly to see if there's an error

### "Missing credentials.json" or "Missing token.json"
- Check if the files exist in the config directory
- If credentials.json is missing, they need to go back to Step 2
- If token.json is missing, re-run the auth step (Step 5)

### "Token has been expired or revoked"
- Delete the token file and re-authorize:
```
rm config/default/token.json
npm run auth -- --config-dir config/default
```

### "Error: listen EADDRINUSE :::3848"
- Another process is using port 3848. Find and stop it:
```
lsof -i :3848
```
- Or wait a moment and try again — a previous auth attempt might still be running

### "redirect_uri_mismatch" error during Google sign-in
- The OAuth client was created as "Web application" instead of "Desktop app"
- Go to Google Cloud Console → Credentials → delete the OAuth client → create a new one as **Desktop app**

### "Access blocked: This app's request is invalid" or "Error 400: admin_policy_enforced"
- If using a work/school Google account, their organization may block third-party apps
- They'll need to use a personal Google account, or ask their IT admin to allow the app

### npm install fails with EACCES
- On Mac/Linux: `sudo npm install`
- Better fix: reconfigure npm to not need sudo: `mkdir ~/.npm-global && npm config set prefix '~/.npm-global'` then add `~/.npm-global/bin` to PATH

### "command not found: node" after installing Node.js
- Terminal needs to be restarted. Quit Terminal (Cmd+Q) and reopen it.
- If installed via nvm, they need to run `nvm use default` or add nvm init to their shell profile
- If installed via Homebrew, they may need to run `brew link node`

### The auth process just hangs / browser doesn't open
- The URL should be printed in the terminal output. Tell them to manually copy the entire URL and paste it into their browser.
- If they're on a remote/headless machine, they need to copy the URL to a machine with a browser
