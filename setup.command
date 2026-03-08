#!/bin/bash

# ============================================
# Google Drive MCP Server — Setup
# ============================================

# Go to the folder where this script lives
cd "$(dirname "$0")"

echo ""
echo "========================================"
echo "  Google Drive MCP Server — Setup"
echo "========================================"
echo ""

# --- Step 1: Check for Node.js ---
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo "  1. Go to https://nodejs.org"
    echo "  2. Click the big green button to download the LTS version"
    echo "  3. Open the downloaded file and follow the installer"
    echo "  4. Then come back and double-click this setup file again"
    echo ""
    read -p "Press Enter to close..."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Found Node.js $NODE_VERSION"

# --- Step 2: Check for credentials.json ---
if [ -f "config/default/credentials.json" ]; then
    echo "✅ Found credentials.json"
elif [ -f "credentials.json" ]; then
    echo "✅ Found credentials.json — moving it into place..."
    mkdir -p config/default
    mv credentials.json config/default/
else
    echo ""
    echo "❌ credentials.json not found!"
    echo ""
    echo "You need to get this file from Google first."
    echo "Check the README for instructions (look for 'Get Your Google Credentials')."
    echo ""
    echo "Once you have the file:"
    echo "  1. Rename it to 'credentials.json'"
    echo "  2. Drop it into this folder (opening it now...)"
    echo "  3. Then double-click this setup file again"
    echo ""
    open .
    read -p "Press Enter to close..."
    exit 1
fi

# --- Step 3: Install dependencies ---
echo ""
echo "📦 Installing dependencies (this may take a minute)..."
echo ""
npm install --loglevel=error
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Something went wrong installing dependencies."
    echo "   Try deleting the 'node_modules' folder and running this setup again."
    read -p "Press Enter to close..."
    exit 1
fi
echo "✅ Dependencies installed"

# --- Step 4: Build ---
echo ""
echo "🔨 Building the project..."
npm run build --silent
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Please check the error messages above."
    read -p "Press Enter to close..."
    exit 1
fi
echo "✅ Build complete"

# --- Step 5: Run auth flow ---
echo ""
echo "========================================"
echo "  Google Authorization"
echo "========================================"
echo ""
echo "In a moment, a long URL will appear below."
echo ""
echo "  1. Copy the entire URL"
echo "  2. Paste it into your web browser"
echo "  3. Sign in with your Google account"
echo "  4. If you see 'Google hasn't verified this app',"
echo "     click 'Advanced' then 'Go to MCP Server (unsafe)'"
echo "     (This is safe — you created this app yourself!)"
echo "  5. Click 'Allow'"
echo "  6. You'll see 'Authorization successful!' — come back here"
echo ""
echo "Starting authorization..."
echo ""
npm run auth -- --config-dir config/default
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Authorization failed. Please try running this setup again."
    read -p "Press Enter to close..."
    exit 1
fi

# --- Step 6: Print Claude Desktop config ---
PROJECT_DIR=$(pwd)
echo ""
echo ""
echo "========================================"
echo "  ✅ Setup Complete!"
echo "========================================"
echo ""
echo "One last step — add this server to Claude Desktop:"
echo ""
echo "  1. Open Claude Desktop"
echo "  2. Click the Claude menu → Settings"
echo "     (or press Cmd+, on your keyboard)"
echo "  3. Click 'Developer' on the left side"
echo "  4. Click 'Edit Config'"
echo "  5. Replace everything in the file with this:"
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "gdrive": {'
echo '      "command": "node",'
echo "      \"args\": [\"$PROJECT_DIR/dist/index.js\", \"--config-dir\", \"$PROJECT_DIR/config/default\"]"
echo '    }'
echo '  }'
echo '}'
echo ""
echo "  6. Save the file (Cmd+S)"
echo "  7. Quit Claude Desktop completely and reopen it"
echo ""
echo "You should see a hammer 🔨 icon in the chat box."
echo "That means it's working! Try asking Claude:"
echo "  'What files are in my Google Drive?'"
echo ""
read -p "Press Enter to close..."
