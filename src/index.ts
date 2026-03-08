import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getDriveClient, getConfigDir } from "./drive-client.js";

function getArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const serverName = getArg("name", "gdrive");
const drive = getDriveClient();
const server = new McpServer({
  name: serverName,
  version: "1.0.0",
});

// --- Tools ---

server.tool(
  "drive_about",
  "Get info about the authenticated user's Drive (storage usage, email, etc.)",
  {},
  async () => {
    const res = await drive.about.get({ fields: "user,storageQuota" });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_list_files",
  "List files and folders in Google Drive. Supports search queries.",
  {
    query: z
      .string()
      .optional()
      .describe(
        "Drive search query (e.g. \"name contains 'report'\", \"mimeType='application/pdf'\", \"'<folderId>' in parents\")"
      ),
    pageSize: z.number().optional().default(20).describe("Max results (1-1000)"),
    pageToken: z.string().optional().describe("Page token for pagination"),
    orderBy: z
      .string()
      .optional()
      .default("modifiedTime desc")
      .describe("Sort order (e.g. 'modifiedTime desc', 'name')"),
  },
  async ({ query, pageSize, pageToken, orderBy }) => {
    const res = await drive.files.list({
      q: query || undefined,
      pageSize,
      pageToken,
      orderBy,
      fields:
        "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners)",
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { files: res.data.files, nextPageToken: res.data.nextPageToken },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "drive_get_file",
  "Get metadata for a specific file or folder by ID",
  {
    fileId: z.string().describe("The file ID"),
  },
  async ({ fileId }) => {
    const res = await drive.files.get({
      fileId,
      fields:
        "id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,description,starred,trashed",
    });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_read_file",
  "Read the text content of a file (Google Docs, Sheets, or plain text files). For Docs/Sheets, exports as plain text.",
  {
    fileId: z.string().describe("The file ID to read"),
  },
  async ({ fileId }) => {
    // First get file metadata to determine type
    const meta = await drive.files.get({
      fileId,
      fields: "mimeType,name",
    });
    const mimeType = meta.data.mimeType || "";

    let content: string;

    if (mimeType === "application/vnd.google-apps.document") {
      const res = await drive.files.export({
        fileId,
        mimeType: "text/plain",
      });
      content = res.data as string;
    } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
      const res = await drive.files.export({
        fileId,
        mimeType: "text/csv",
      });
      content = res.data as string;
    } else if (mimeType === "application/vnd.google-apps.presentation") {
      const res = await drive.files.export({
        fileId,
        mimeType: "text/plain",
      });
      content = res.data as string;
    } else {
      // Binary or text file — download content
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "text" }
      );
      content = res.data as string;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { fileId, name: meta.data.name, mimeType, content },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "drive_download_file",
  "Download a file from Google Drive to a local directory",
  {
    fileId: z.string().describe("The file ID to download"),
    downloadDir: z
      .string()
      .optional()
      .default("~/Downloads")
      .describe("Directory to save the file (default: ~/Downloads)"),
    filename: z
      .string()
      .optional()
      .describe("Override filename (default: uses original name)"),
  },
  async ({ fileId, downloadDir, filename }) => {
    const resolvedDir = downloadDir.replace(/^~/, process.env.HOME || "/tmp");
    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }

    const meta = await drive.files.get({
      fileId,
      fields: "name,mimeType",
    });
    const mimeType = meta.data.mimeType || "";
    let saveName = filename || meta.data.name || fileId;

    // For Google Workspace files, export to common formats
    const exportMap: Record<string, { mime: string; ext: string }> = {
      "application/vnd.google-apps.document": {
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ext: ".docx",
      },
      "application/vnd.google-apps.spreadsheet": {
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ext: ".xlsx",
      },
      "application/vnd.google-apps.presentation": {
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ext: ".pptx",
      },
      "application/vnd.google-apps.drawing": {
        mime: "image/png",
        ext: ".png",
      },
    };

    let buffer: Buffer;

    if (exportMap[mimeType]) {
      const exp = exportMap[mimeType];
      if (!saveName.endsWith(exp.ext)) saveName += exp.ext;
      const res = await drive.files.export(
        { fileId, mimeType: exp.mime },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(res.data as ArrayBuffer);
    } else {
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = Buffer.from(res.data as ArrayBuffer);
    }

    const filePath = path.join(resolvedDir, saveName);
    fs.writeFileSync(filePath, buffer);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { downloaded: true, path: filePath, size: buffer.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "drive_search",
  "Search for files by name, type, or content across Google Drive",
  {
    name: z.string().optional().describe("Search by file name (partial match)"),
    mimeType: z
      .string()
      .optional()
      .describe(
        "Filter by MIME type (e.g. 'application/pdf', 'application/vnd.google-apps.document')"
      ),
    fullText: z.string().optional().describe("Full-text search in file content"),
    inFolder: z.string().optional().describe("Restrict search to a folder ID"),
    trashed: z.boolean().optional().default(false).describe("Include trashed files"),
    pageSize: z.number().optional().default(20),
  },
  async ({ name, mimeType, fullText, inFolder, trashed, pageSize }) => {
    const conditions: string[] = [];
    if (name) conditions.push(`name contains '${name.replace(/'/g, "\\'")}'`);
    if (mimeType) conditions.push(`mimeType = '${mimeType}'`);
    if (fullText)
      conditions.push(`fullText contains '${fullText.replace(/'/g, "\\'")}'`);
    if (inFolder) conditions.push(`'${inFolder}' in parents`);
    if (!trashed) conditions.push("trashed = false");

    const q = conditions.join(" and ") || undefined;

    const res = await drive.files.list({
      q,
      pageSize,
      orderBy: "modifiedTime desc",
      fields:
        "files(id,name,mimeType,size,modifiedTime,webViewLink,parents)",
    });

    return {
      content: [
        { type: "text", text: JSON.stringify(res.data.files, null, 2) },
      ],
    };
  }
);

server.tool(
  "drive_create_folder",
  "Create a new folder in Google Drive",
  {
    name: z.string().describe("Folder name"),
    parentId: z
      .string()
      .optional()
      .describe("Parent folder ID (default: root)"),
  },
  async ({ name, parentId }) => {
    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      },
      fields: "id,name,webViewLink",
    });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_upload_file",
  "Upload a local file to Google Drive",
  {
    localPath: z.string().describe("Absolute path to the local file"),
    name: z
      .string()
      .optional()
      .describe("Name for the file in Drive (default: local filename)"),
    parentId: z
      .string()
      .optional()
      .describe("Parent folder ID (default: root)"),
    mimeType: z
      .string()
      .optional()
      .describe("MIME type (auto-detected if not provided)"),
  },
  async ({ localPath, name, parentId, mimeType }) => {
    const resolvedPath = localPath.replace(/^~/, process.env.HOME || "/tmp");
    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [
          { type: "text", text: JSON.stringify({ error: `File not found: ${resolvedPath}` }) },
        ],
      };
    }

    const fileName = name || path.basename(resolvedPath);
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: parentId ? [parentId] : undefined,
      },
      media: {
        mimeType: mimeType || "application/octet-stream",
        body: fs.createReadStream(resolvedPath),
      },
      fields: "id,name,webViewLink,size",
    });

    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_move_file",
  "Move a file to a different folder",
  {
    fileId: z.string().describe("The file ID to move"),
    newParentId: z.string().describe("Destination folder ID"),
  },
  async ({ fileId, newParentId }) => {
    // Get current parents
    const file = await drive.files.get({ fileId, fields: "parents" });
    const previousParents = (file.data.parents || []).join(",");

    const res = await drive.files.update({
      fileId,
      addParents: newParentId,
      removeParents: previousParents,
      fields: "id,name,parents,webViewLink",
    });

    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_rename_file",
  "Rename a file or folder",
  {
    fileId: z.string().describe("The file ID to rename"),
    newName: z.string().describe("The new name"),
  },
  async ({ fileId, newName }) => {
    const res = await drive.files.update({
      fileId,
      requestBody: { name: newName },
      fields: "id,name,webViewLink",
    });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_copy_file",
  "Make a copy of a file",
  {
    fileId: z.string().describe("The file ID to copy"),
    name: z.string().optional().describe("Name for the copy"),
    parentId: z
      .string()
      .optional()
      .describe("Destination folder ID (default: same folder)"),
  },
  async ({ fileId, name, parentId }) => {
    const res = await drive.files.copy({
      fileId,
      requestBody: {
        name: name || undefined,
        parents: parentId ? [parentId] : undefined,
      },
      fields: "id,name,webViewLink",
    });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_trash_file",
  "Move a file to the trash",
  {
    fileId: z.string().describe("The file ID to trash"),
  },
  async ({ fileId }) => {
    await drive.files.update({
      fileId,
      requestBody: { trashed: true },
    });
    return {
      content: [
        { type: "text", text: JSON.stringify({ trashed: true, fileId }) },
      ],
    };
  }
);

server.tool(
  "drive_restore_file",
  "Restore a file from the trash",
  {
    fileId: z.string().describe("The file ID to restore"),
  },
  async ({ fileId }) => {
    await drive.files.update({
      fileId,
      requestBody: { trashed: false },
    });
    return {
      content: [
        { type: "text", text: JSON.stringify({ restored: true, fileId }) },
      ],
    };
  }
);

server.tool(
  "drive_share_file",
  "Share a file or folder with someone",
  {
    fileId: z.string().describe("The file ID to share"),
    email: z.string().describe("Email address to share with"),
    role: z
      .enum(["reader", "writer", "commenter"])
      .describe("Permission level"),
    sendNotification: z
      .boolean()
      .optional()
      .default(true)
      .describe("Send email notification to the user"),
  },
  async ({ fileId, email, role, sendNotification }) => {
    const res = await drive.permissions.create({
      fileId,
      sendNotificationEmail: sendNotification,
      requestBody: {
        type: "user",
        role,
        emailAddress: email,
      },
      fields: "id,role,emailAddress",
    });
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

server.tool(
  "drive_list_permissions",
  "List who has access to a file",
  {
    fileId: z.string().describe("The file ID"),
  },
  async ({ fileId }) => {
    const res = await drive.permissions.list({
      fileId,
      fields: "permissions(id,role,type,emailAddress,displayName)",
    });
    return {
      content: [
        { type: "text", text: JSON.stringify(res.data.permissions, null, 2) },
      ],
    };
  }
);

server.tool(
  "drive_remove_permission",
  "Remove someone's access to a file",
  {
    fileId: z.string().describe("The file ID"),
    permissionId: z
      .string()
      .describe("Permission ID (from drive_list_permissions)"),
  },
  async ({ fileId, permissionId }) => {
    await drive.permissions.delete({ fileId, permissionId });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ removed: true, fileId, permissionId }),
        },
      ],
    };
  }
);

server.tool(
  "drive_star_file",
  "Star or unstar a file",
  {
    fileId: z.string().describe("The file ID"),
    starred: z.boolean().describe("true to star, false to unstar"),
  },
  async ({ fileId, starred }) => {
    await drive.files.update({
      fileId,
      requestBody: { starred },
    });
    return {
      content: [{ type: "text", text: JSON.stringify({ fileId, starred }) }],
    };
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${serverName} MCP server running on stdio`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
