import { createServer } from "node:http";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { NormalizedAdapter } from "json-server/lib/adapters/normalized-adapter.js";
import { Observer } from "json-server/lib/adapters/observer.js";
import { createApp } from "json-server/lib/app.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 3001;
const IMG_DIR = join(__dirname, "public", "img");
const PHOTO_DIR = join(__dirname, "public", "photo");

await mkdir(IMG_DIR, { recursive: true });
await mkdir(PHOTO_DIR, { recursive: true });

const adapter = new JSONFile("db.json");
const observer = new Observer(new NormalizedAdapter(adapter));
const db = new Low(observer, {});
await db.read();

const app = createApp(db, { logger: false });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/api/upload") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const respond = (status, body) => {
          res.writeHead(status, { ...CORS_HEADERS, "Content-Type": "application/json" });
          res.end(JSON.stringify(body));
        };
        const { image, filename } = JSON.parse(body);
        if (!image || !filename) { respond(400, { error: "image and filename required" }); return; }
        const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!matches) { respond(400, { error: "Invalid image data" }); return; }
        let ext = matches[1];
        if (ext === "jpeg") ext = "jpg";
        if (ext.includes("+")) ext = ext.split("+")[0];
        const sanitized = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
        const isProfile = sanitized.startsWith("profile_");
        const targetDir = isProfile ? PHOTO_DIR : IMG_DIR;
        const urlPrefix = isProfile ? "/photo" : "/img";
        const filePath = join(targetDir, `${sanitized}.${ext}`);
        await writeFile(filePath, Buffer.from(matches[2], "base64"));
        respond(200, { url: `${urlPrefix}/${sanitized}.${ext}` });
      } catch {
        respond(500, { error: "Upload failed" });
      }
    });
    return;
  }

  app.handler(req, res, () => {
    res.writeHead(404, { ...CORS_HEADERS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  http://localhost:${PORT}/screenings`);
  console.log(`  http://localhost:${PORT}/api/upload`);
});
