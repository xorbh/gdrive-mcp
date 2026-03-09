import { google } from "googleapis";
import http from "http";
import { URL } from "url";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getConfigDir(): string {
  const idx = process.argv.indexOf("--config-dir");
  if (idx !== -1 && process.argv[idx + 1]) {
    return path.resolve(process.argv[idx + 1]);
  }
  return path.join(__dirname, "..");
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

async function authenticate() {
  const configDir = getConfigDir();
  const credentialsPath = path.join(configDir, "credentials.json");
  const tokenPath = path.join(configDir, "token.json");

  console.log(`Using config directory: ${configDir}`);

  if (!fs.existsSync(credentialsPath)) {
    console.error(
      "Missing credentials.json. Download it from Google Cloud Console:"
    );
    console.error(
      "1. Go to https://console.cloud.google.com/apis/credentials"
    );
    console.error('2. Create an OAuth 2.0 Client ID (type: "Desktop app")');
    console.error("3. Download the JSON and save it as credentials.json");
    console.error(`   Expected path: ${credentialsPath}`);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const { client_id, client_secret } =
    credentials.installed || credentials.web;

  const redirectUri = "http://localhost:3848/oauth2callback";
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\nOpening your browser for authorization...\n");
  console.log("If the browser doesn't open automatically, copy and paste this URL:\n");
  console.log(authUrl);
  console.log("\nWaiting for authorization...\n");

  // Auto-open the browser
  const openCmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${openCmd} "${authUrl}"`);

  const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost:3848`);
      const code = url.searchParams.get("code");
      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authorization successful!</h1><p>You can close this tab.</p>"
        );
        clearTimeout(timeout);
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end("Missing code parameter");
      }
    });
    server.listen(3848, () => {
      console.log("Listening on http://localhost:3848 for OAuth callback...");
    });
    server.on("error", reject);

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("Authorization timed out after 5 minutes. Please run setup again."));
    }, AUTH_TIMEOUT_MS);
  });

  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.log("\nToken saved to", tokenPath);
  console.log("You can now start the MCP server.");
}

authenticate().catch(console.error);
