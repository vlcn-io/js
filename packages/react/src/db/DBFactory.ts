import initWasm, { SQLite3 } from "@vlcn.io/crsqlite-wasm";
import tblrx from "@vlcn.io/rx-tbl";
import { CtxAsync } from "../context.js";

// TODO: xplat-api new pkg has these types
export type DBID = string;
export type Schema = {
  name: string;
  content: string;
};

const dbMap = new Map<DBID, Promise<CtxAsync>>();
const hooks = new Map<DBID, () => CtxAsync | null>();

let initPromise: Promise<SQLite3> | null = null;
function init(wasmUri?: string) {
  if (initPromise) {
    return initPromise;
  }

  initPromise = initWasm(wasmUri ? () => wasmUri : undefined);
  return initPromise;
}

const dbFactory = {
  async get(dbname: string, schema: Schema, hook?: () => CtxAsync | null) {
    if (hook) {
      hooks.set(dbname, hook);
    }
    if (dbMap.has(dbname)) {
      return await dbMap.get(dbname)!;
    }

    const entry = (async () => {
      const sqlite = await init();
      const db = await sqlite.open(dbname);
      await db.automigrateTo(schema.name, schema.content);
      const rx = tblrx(db);
      return {
        db,
        rx,
      };
    })();
    dbMap.set(dbname, entry);

    return await entry;
  },

  async closeAndRemove(dbname: string) {
    const db = await dbMap.get(dbname);
    hooks.delete(dbname);
    if (db) {
      dbMap.delete(dbname);
      db.rx.dispose();
      await db.db.close();
    }
  },

  getHook(dbname: string) {
    return hooks.get(dbname);
  },
} as const;

export default dbFactory;
