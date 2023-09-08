import { DBAsync, StmtAsync, firstPick } from "@vlcn.io/xplat-api";

type Args = Readonly<{
  db: DBAsync;
  endpoint: string;
  room: string;
  schemaName: string;
  schemaVersion: bigint;
  pullChangesetStmt: StmtAsync;
  applyChangesetStmt: StmtAsync;
  siteId: Uint8Array;
}>;

export class Syncer {
  readonly #args: Args;

  constructor(args: Args) {
    this.#args = args;
  }

  async pushChanges() {
    // track what we last sent to the server so we only send the diff.
    const lastSentVersion = BigInt(
      localStorage.getItem(
        `last-sent-to-${this.#args.endpoint}-${this.#args.room}`
      ) ?? "0"
    );
    // post changes to the server
  }

  async pullChanges() {}
}

export default async function createSyncer(
  db: DBAsync,
  endpoint: string,
  room: string
) {
  const schemaName = firstPick<string>(
    await db.execA<[string]>(
      `SELECT value FROM crsql_master WHERE key = 'schema_name'`
    )
  );
  if (schemaName == null) {
    throw new Error("The database does not have a schema applied.");
  }
  const schemaVersion = BigInt(
    firstPick<number | bigint>(
      await db.execA<[number | bigint]>(
        `SELECT value FROM crsql_master WHERE key = 'schema_version'`
      )
    ) || -1
  );
  const [pullChangesetStmt, applyChangesetStmt] = await Promise.all([
    db.prepare(
      `SELECT "table", "pk", "cid", "val", "col_version", "db_version", NULL, "cl", seq FROM crsql_changes WHERE db_version > ? AND site_id IS NULL`
    ),
    db.prepare(
      `INSERT INTO crsql_changes ("table", "pk", "cid", "val", "col_version", "db_version", "site_id", "cl", "seq") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ),
  ]);
  pullChangesetStmt.raw(true);
  const siteId = (await db.execA<[Uint8Array]>(`SELECT crsql_site_id()`))[0][0];

  return new Syncer({
    db,
    endpoint,
    room,
    schemaName,
    schemaVersion,
    pullChangesetStmt,
    applyChangesetStmt,
    siteId,
  });
}
