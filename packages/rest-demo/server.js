import Database from "better-sqlite3";
import { extensionPath } from "@vlcn.io/crsqlite";
import express from "express";
import ViteExpress from "vite-express";
import * as http from "http";

const PORT = parseInt(process.env.PORT || "8080");

const app = express();
const server = http.createServer(app);

app.post("/initialize/:room", () => {
  const room = req.params.room;
  const db = createDb(room);
});

app.get("/changes/:room", (req, res) => {
  const room = req.params.room;
  const sinceVersion = req.query.sinceVersion;
  const sinceSeq = req.query.sinceSeq;
  res.send(`Retrieving changes for room: ${room}`);
});

app.post("/changes/:room", express.raw(), (req, res) => {
  const room = req.params.room;
  const data = req.body;
  res.send(`Binary data received for room: ${room}`);
});

server.listen(PORT, () =>
  console.log("info", `listening on http://localhost:${PORT}!`)
);

ViteExpress.bind(app, server);

// In an ideal world, you should cache the DB instance so you do not need to pay
// the cost of re-constructing it (initializing SQLite, loading the cr-sqlite extension) every request.
// You could also prepare the statements once and cache them in that world.
// That is how the websocket and direct-connect servers work.
function createDb(room) {
  const dbpath = getDbPath(room);
  const db = new Database(dbpath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.loadExtension(extensionPath);
  return db;
}

const dbFolder = "./dbs";
const schemaFolder = "./src/schemas";
function getDbPath(dbName) {
  if (hasPathParts(dbName)) {
    throw new Error(`${dbName} must not include '..', '/', or '\\'`);
  }

  return path.join(config.dbFolder, dbName);
}

function getSchemaPath(schemaName) {
  if (hasPathParts(schemaName)) {
    throw new Error(`${schemaName} must not include '..', '/', or '\\'`);
  }

  return path.join(config.schemaFolder, schemaName);
}

function hasPathParts(s) {
  return s.includes("..") || s.includes("/") || s.includes("\\");
}
