import Database from "better-sqlite3";
import { extensionPath } from "@vlcn.io/crsqlite";
import { cryb64, Change, Changes } from "@vlcn.io/ws-common";
import path from "path";
import fs from "fs";
const DB_FOLDER = "./dbs";
const SCHEMA_FOLDER = "./src/schemas";

class DBWrapper {
  #db;
  constructor(db: Database.Database) {
    this.#db = db;
  }

  getChanges(sinceVersion: bigint, requestorSiteId: Uint8Array): Change[] {
    return this.#db
      .prepare(
        `SELECT "table", "pk", "cid", "val", "col_version", "db_version", NULL, "cl", "seq" FROM crsql_changes WHERE db_version > ? AND site_id IS NOT ?`
      )
      .raw(true)
      .safeIntegers()
      .all(sinceVersion, requestorSiteId) as Change[];
  }

  getId(): Uint8Array {
    return this.#db
      .prepare(`SELECT crsql_site_id()`)
      .pluck()
      .get() as Uint8Array;
  }

  applyChanges(msg: Changes) {
    const stmt = this.#db.prepare(
      `INSERT INTO crsql_changes
        ("table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    this.#db.transaction((msg) => {
      for (const c of msg.changes) {
        stmt.run(c[0], c[1], c[2], c[3], c[4], c[5], msg.sender, c[7], c[8]);
      }
    })(msg);
  }

  close() {
    closeDb(this.#db);
  }
}

// NOTE:
// In an ideal world, you should cache the DB instance so you do not need to pay
// the cost of re-constructing it (initializing SQLite, loading the cr-sqlite extension) every request.
// You should also prepare the statements once and cache them in that world.
// That is how the websocket and direct-connect servers work.
export async function createDb(
  room: string,
  requestedSchemaName: string,
  requestedVersion: bigint
) {
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

function closeDb(db: Database.Database) {
  db.prepare(`SELECT crsql_finalize()`).run();
  db.close();
}

function getDbPath(dbName: string) {
  if (hasPathParts(dbName)) {
    throw new Error(`${dbName} must not include '..', '/', or '\\'`);
  }

  return path.join(DB_FOLDER, dbName);
}

function getSchemaPath(schemaName: string) {
  if (hasPathParts(schemaName)) {
    throw new Error(`${schemaName} must not include '..', '/', or '\\'`);
  }

  return path.join(SCHEMA_FOLDER, schemaName);
}

function hasPathParts(s: string) {
  return s.includes("..") || s.includes("/") || s.includes("\\");
}
