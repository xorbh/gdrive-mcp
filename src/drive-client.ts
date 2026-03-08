import { google, drive_v3 } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_DIR = path.join(__dirname, "..");

export function getConfigDir(): string {
  const idx = process.argv.indexOf("--config-dir");
  if (idx !== -1 && process.argv[idx + 1]) {
    return path.resolve(process.argv[idx + 1]);
  }
  return DEFAULT_CONFIG_DIR;
}

export function getDriveClient(configDir?: string): drive_v3.Drive {
  const dir = configDir || getConfigDir();
  const credentialsPath = path.join(dir, "credentials.json");
  const tokenPath = path.join(dir, "token.json");

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `Missing credentials.json in ${dir} — run 'npm run auth -- --config-dir ${dir}' first.`
    );
  }
  if (!fs.existsSync(tokenPath)) {
    throw new Error(
      `Missing token.json in ${dir} — run 'npm run auth -- --config-dir ${dir}' to authenticate.`
    );
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const { client_id, client_secret } =
    credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3848/oauth2callback"
  );

  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
  oauth2Client.setCredentials(tokens);

  oauth2Client.on("tokens", (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2));
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}
