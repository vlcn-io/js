import Database from "better-sqlite3";
import { extensionPath } from "@vlcn.io/crsqlite";
import express from "express";
import ViteExpress from "vite-express";
import * as http from "http";
import { cryb64, encode, decode, tags, hexToBytes } from "@vlcn.io/ws-common";

const PORT = parseInt(process.env.PORT || "8080");
const DB_FOLDER = "./dbs";
const SCHEMA_FOLDER = "./src/schemas";

const app = express();
const server = http.createServer(app);

/**
 * Called before a client starts using a room.
 *
 * This ensures that the room exists on the server and has a compatible schema.
 *
 * Here we auto-migrate to the requested schema. You can do whatever you'd like
 * on your end.
 *
 * To be completely stateless for each request, each request could include
 * the schema version and name, and the server could check that it is compatible.
 */
app.post("/initialize/:room", async () => {
  const room = req.params.room;
  const schemaVersion = req.query.schemaVersion;
  const schemaName = req.query.schemaName;
  const db = new DBWrapper(room);
  try {
    await db.initialize(schemaName, schemaVersion);
    res.send({ status: "OK" });
  } finally {
    db.close();
  }
});

app.get("/changes/:room", async (req, res) => {
  const room = req.params.room;
  const db = new DBWrapper(room);
  try {
    const requestorSiteId = hexToBytes(req.query.requestor);
    const sinceVersion = BigInt(req.query.since);

    const changes = await db.getChanges(sinceVersion, requestorSiteId);
    const encoded = encode({
      _tag: tags.Changes,
      changes,
      sender: this.db.getId(),
      since: [sinceVersion, 0],
    });
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(encoded);
  } finally {
    db.close();
  }
});

app.post("/changes/:room", express.raw(), (req, res) => {
  const room = req.params.room;
  const rawData = req.body;
  const data = new Uint8Array(rawData.buffer);

  const msg = decode(data);
  const db = new DBWrapper(room);
  try {
    db.applyChanges(msg.changes);
    res.send({ status: "OK" });
  } finally {
    db.close();
  }
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

  getChanges(sinceVersion, requestorSiteId) {
    db.prepare <
      [bigint, Uint8Array] >
      `SELECT "table", "pk", "cid", "val", "col_version", "db_version", NULL, "cl" FROM crsql_changes WHERE db_version > ? AND site_id IS NOT ?`
        .raw(true)
        .safeIntegers()
        .all(sinceVersion, requestorSiteId);
  }

  getId() {
    return db.prepare(`SELECT crsql_site_id()`).pluck().get();
  }

  applyChanges(changes) {}

  close() {
    this.#db.prepare(`SELECT crsql_finalize()`).run();
    this.#db.close();
  }
}

function getDbPath(dbName) {
  if (hasPathParts(dbName)) {
    throw new Error(`${dbName} must not include '..', '/', or '\\'`);
  }

  return path.join(DB_FOLDER, dbName);
}

function getSchemaPath(schemaName) {
  if (hasPathParts(schemaName)) {
    throw new Error(`${schemaName} must not include '..', '/', or '\\'`);
  }

  return path.join(SCHEMA_FOLDER, schemaName);
}

function hasPathParts(s) {
  return s.includes("..") || s.includes("/") || s.includes("\\");
}
