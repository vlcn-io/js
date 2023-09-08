import Database from "better-sqlite3";
import { extensionPath } from "@vlcn.io/crsqlite";
import express from "express";
import ViteExpress from "vite-express";
import * as http from "http";
import { Change, cryb64 } from "@vlcn.io/ws-common";

const PORT = parseInt(process.env.PORT || "8080");

const app = express();
const server = http.createServer(app);

/**
 * Called before a client starts using a room.
 *
 * This ensures that the room exists on the server and has a compatible schema.
 *
 * Here we auto-migrate to the requested schema. You can do whatever you'd like
 * on your end.
 */
app.post("/initialize/:room", async () => {
  const room = req.params.room;
  const schemaVersion = req.query.schemaVersion;
  const schemaName = req.query.schemaName;
  const db = new DBWrapper(room);

  await db.initialize(schemaName, schemaVersion);
  db.close();
});

app.get("/changes/:room", async (req, res) => {
  const room = req.params.room;
  const sinceVersion = req.query.sinceVersion;
  const sinceSeq = req.query.sinceSeq;

  const changes = await db.getChanges(sinceVersion, sinceSeq);
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
// You should also prepare the statements once and cache them in that world.
// That is how the websocket and direct-connect servers work.
class DBWrapper {
  constructor(room) {
    const dbpath = getDbPath(room);
    const db = new Database(dbpath);
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.loadExtension(extensionPath);
    this.#db = db;
  }

  async initialize(requestedSchemaName, requestedVersion) {
    const content = await fs.promises.readFile(
      getSchemaPath(requestedSchemaName),
      "utf-8"
    );
    const residentVersion = cryb64(content);
    if (residentVersion != requestedVersion) {
      throw new Error(
        `Server has schema version ${residentVersion} but client requested ${requestedVersion}`
      );
    }

    db.transaction(() => {
      db.prepare(`SELECT crsql_automigrate(?)`).run(content);
      db.prepare(
        `INSERT OR REPLACE INTO crsql_master (key, value) VALUES (?, ?)`
      ).run("schema_version", requestedVersion);
    })();
  }

  close() {
    this.#db.prepare(`SELECT crsql_finalize()`).run();
    this.#db.close();
  }
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
