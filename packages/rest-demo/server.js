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

app.get("/changes/:room", async (req, res) => {
  const db = await createDb(
    req.params.room,
    req.query.schemaName,
    req.query.schemaVersion
  );
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

app.post("/changes/:room", express.raw(), async (req, res) => {
  const data = new Uint8Array(req.body.buffer);

  const msg = decode(data);
  const db = await createDb(
    req.params.room,
    req.query.schemaName,
    req.query.schemaVersion
  );
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

class DBWrapper {
  #db;
  constructor(db) {
    this.#db = db;
  }

  getChanges(sinceVersion, requestorSiteId) {
    db.prepare(
      `SELECT "table", "pk", "cid", "val", "col_version", "db_version", NULL, "cl", "seq" FROM crsql_changes WHERE db_version > ? AND site_id IS NOT ?`
    )
      .raw(true)
      .safeIntegers()
      .all(sinceVersion, requestorSiteId);
  }

  getId() {
    return db.prepare(`SELECT crsql_site_id()`).pluck().get();
  }

  applyChanges(changes) {}

  close() {
    closeDb(this.#db);
  }
}

// NOTE:
// In an ideal world, you should cache the DB instance so you do not need to pay
// the cost of re-constructing it (initializing SQLite, loading the cr-sqlite extension) every request.
// You should also prepare the statements once and cache them in that world.
// That is how the websocket and direct-connect servers work.
async function createDb(room, requestedSchemaName, requestedVersion) {
  const dbpath = getDbPath(room);
  const db = new Database(dbpath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.loadExtension(extensionPath);

  // NOTE:
  // This set of code "auto migrates" the database to the requested schema version.
  // You can eject this code and handle migration manually if you prefer
  // as auto-migration has it limitations.
  const schemaVersion = db
    .prepare(`SELECT key, value FROM crsql_master WHERE key = ?`)
    .get("schema_version");
  const schemaName = db
    .prepare(`SELECT key, value FROM crsql_master WHERE key = ?`)
    .get("schema_name");

  if (schemaName != null && schemaName != requestedSchemaName) {
    // we will not allow reformatting a db to a new schema
    closeDb(db);
    throw new Error(
      `Server has schema ${schemaName} but client requested ${requestedSchemaName}`
    );
  }

  if (schemaName == requestedSchemaName && requestedVersion == schemaVersion) {
    return new DBWrapper(db);
  }

  const content = await fs.promises.readFile(
    getSchemaPath(requestedSchemaName),
    "utf-8"
  );
  const residentVersion = cryb64(content);
  if (residentVersion != requestedVersion) {
    closeDb(db);
    throw new Error(
      `Server has schema version ${residentVersion} but client requested ${requestedVersion}`
    );
  }

  // upgrade the server to the requested version which is on disk
  db.transaction(() => {
    db.prepare(`SELECT crsql_automigrate(?)`).run(content);
    db.prepare(
      `INSERT OR REPLACE INTO crsql_master (key, value) VALUES (?, ?)`
    ).run("schema_version", requestedVersion);
    db.prepare(
      `INSERT OR REPLACE INTO crsql_master (key, value) VALUES (?, ?)`
    ).run("schema_name", requestedSchemaName);
  })();

  return new DBWrapper(db);
}

function closeDb(db) {
  db.prepare(`SELECT crsql_finalize()`).run();
  db.close();
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
