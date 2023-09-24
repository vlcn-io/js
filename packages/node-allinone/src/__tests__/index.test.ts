import * as nanoid from "nanoid";
import sqlite from "../index.js";
import { test } from "vitest";
import { DB } from "@vlcn.io/xplat-api";

type SiteIDWire = string;
type CID = string;
type QuoteConcatedPKs = string | number;
type TableName = string;
type Version = number | string;

export type Changeset = [
  TableName,
  QuoteConcatedPKs,
  CID,
  any, // val,
  Version,
  Version,
  SiteIDWire, // site_id
];

// test that we wrapped correctly
test("failing example", () => {
  const db1 = sqlite.open(":memory:");

  db1.execMany([
    `CREATE TABLE IF NOT EXISTS todo_list ("name" primary key not null, "creation_time");`,
    `CREATE TABLE IF NOT EXISTS todo ("id" primary key not null, "list", "text", "complete");`,
  ]);
  db1.execMany([
    `SELECT crsql_as_crr('todo_list');`,
    `SELECT crsql_as_crr('todo');`,
  ]);

  let list = [
    "milk",
    "potatos",
    "avocado",
    "butter",
    "cheese",
    "broccoli",
    "spinach",
  ];
  // `insert or ignore` given this is a notebook and ppl will re-run cells.
  db1.exec(`INSERT OR IGNORE INTO todo_list VALUES ('groceries', ?)`, [
    Date.now(),
  ]);
  list.forEach((item) =>
    db1.exec(`INSERT INTO todo VALUES (?, 'groceries', ?, 0)`, [
      nanoid.nanoid(),
      item,
    ])
  );

  list = ["test", "document", "explain", "onboard", "hire"];
  db1.exec(`INSERT OR IGNORE INTO todo_list VALUES ('work', ?)`, [Date.now()]);
  list.forEach((item) =>
    db1.exec(`INSERT INTO todo VALUES (?, 'work', ?, 0)`, [
      nanoid.nanoid(),
      item,
    ])
  );

  let groceries = db1.execO(
    `SELECT "list", "text" FROM "todo" WHERE "list" = 'groceries'`
  );
  let work = db1.execO(
    `SELECT "list", "text" FROM "todo" WHERE "list" = 'work'`
  );

  let changesets = db1.execA(
    "SELECT * FROM crsql_changes where db_version > -1"
  );

  const db2 = sqlite.open(":memory:");
  db2.execMany([
    `CREATE TABLE IF NOT EXISTS todo_list ("name" primary key not null, "creation_time");`,
    `CREATE TABLE IF NOT EXISTS todo ("id" primary key not null, "list", "text", "complete");`,
    `SELECT crsql_as_crr('todo_list');`,
    `SELECT crsql_as_crr('todo');`,
  ]);

  const siteid = db1.execA(`SELECT crsql_site_id()`)[0][0];
  db2.transaction(() => {
    for (const cs of changesets) {
      db2.exec(
        `INSERT INTO crsql_changes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        cs
      );
    }
  });

  groceries = db2.execO(
    `SELECT "list", "text" FROM "todo" WHERE "list" = 'groceries'`
  );
  work = db2.execO(`SELECT "list", "text" FROM "todo" WHERE "list" = 'work'`);

  let db1version = db1.execA(`SELECT crsql_db_version()`)[0][0];
  let db2version = db2.execA(`SELECT crsql_db_version()`)[0][0];

  db1.exec(`INSERT OR IGNORE INTO todo_list VALUES (?, ?)`, [
    "home",
    Date.now(),
  ]);
  db2.exec(`INSERT OR IGNORE INTO todo_list VALUES (?, ?)`, [
    "home",
    Date.now(),
  ]);
  db1.exec(`INSERT INTO todo VALUES (?, ?, ?, ?)`, [
    nanoid.nanoid(),
    "home",
    "paint",
    0,
  ]);
  db2.exec(`INSERT INTO todo VALUES (?, ?, ?, ?)`, [
    nanoid.nanoid(),
    "home",
    "mow",
    0,
  ]);
  db1.exec(`INSERT INTO todo VALUES (?, ?, ?, ?)`, [
    nanoid.nanoid(),
    "home",
    "water",
    0,
  ]);
  // given each item is a nanoid for primary key, `weed` will show up twice
  db2.exec(`INSERT INTO todo VALUES (?, ?, ?, ?)`, [
    nanoid.nanoid(),
    "home",
    "weed",
    0,
  ]);
  db1.exec(`INSERT INTO todo VALUES (?, ?, ?, ?)`, [
    nanoid.nanoid(),
    "home",
    "weed",
    0,
  ]);
  // and complete things on other lists
  db1.exec(`UPDATE todo SET complete = 1 WHERE list = 'groceries'`);

  let changesets1 = db1.execA(
    "SELECT * FROM crsql_changes where db_version > ?",
    [db1version]
  );
  let changesets2 = db2.execA(
    "SELECT * FROM crsql_changes where db_version > ?",
    [db2version]
  );
});

test("using sync api as async GH #104", () => {
  const changesReceived = (db: DB, changesets: readonly Changeset[]) => {
    db.transaction(() => {
      // uncomment to make fail
      let maxVersion = 0n;
      // console.log("inserting changesets in tx", changesets);
      const stmt = db.prepare(
        'INSERT INTO crsql_changes ("table", "pk", "cid", "val", "col_version", "db_version", "site_id") VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      // TODO: may want to chunk
      try {
        // TODO: should we discard the changes altogether if they're less than the tracking version
        // we have for this peer?
        // that'd preclude resetting tho.
        for (const cs of changesets) {
          // console.log("changeset", [cs[2], cs[3]]);
          const v = BigInt(cs[5]);
          maxVersion = v > maxVersion ? v : maxVersion;
          // cannot use same statement in parallel
          stmt.run(
            cs[0],
            cs[1],
            cs[2],
            cs[3],
            BigInt(cs[4]),
            v,
            cs[6] // ? uuidParse(cs[5]) : 0
          );
        }
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        stmt.finalize();
      }
    }); // uncomment to make fail
  };

  const initSql = [
    `CREATE TABLE IF NOT EXISTS myTable (
      id BLOB PRIMARY KEY not null,
      a,
      b,
      c,
      d,
      e,
      f,
      g,
      h
  );`,
    `SELECT crsql_as_crr('myTable');`,
  ];

  const dbSource = sqlite.open();
  dbSource.execMany(initSql);
  dbSource.exec(
    `INSERT INTO myTable (id,a,b,c,d,e,f,g,h)
                    VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      "A7A33CBF-65DD-4D36-B193-E64B9EC61EC7",
      "a value",
      "b value",
      "c value",
      "d value",
      "e value",
      "f value",
      "g value",
      "h value",
    ]
  );

  const changes: Changeset[] = dbSource.execA<Changeset>(
    `SELECT "table", "pk", "cid", "val", "col_version", "db_version", "site_id" FROM crsql_changes`
  );

  const dbTarget = sqlite.open();
  dbTarget.execMany(initSql);

  try {
    changesReceived(dbTarget, changes);
  } finally {
    // console.log("closing db");
    dbTarget.close();
  }
});
