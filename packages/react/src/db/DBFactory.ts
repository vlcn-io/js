import initWasm, { SQLite3 } from "@vlcn.io/crsqlite-wasm";
import tblrx from "@vlcn.io/rx-tbl";
import { CtxAsync } from "../context.js";

// TODO: xplat-api new pkg has these types
export type DBID = string;
export type Schema = {
  name: string;
  content: string;
};

const dbMap = new Map<DBID, [string, Promise<CtxAsync>]>();
const hooks = new Map<DBID, () => CtxAsync | null>();

let initPromise: Promise<SQLite3> | null = null;
function init(wasmUri?: string) {
  if (initPromise) {
    return initPromise;
  }

  initPromise = initWasm(wasmUri ? () => wasmUri : undefined);
  return initPromise;
}

// TODO: serialize the DB factory because react concurrent mode bogusness
const dbFactory = {
  async get(dbname: string, schema: Schema, hook?: () => CtxAsync | null) {
    if (hook) {
      hooks.set(dbname, hook);
    }
    if (dbMap.has(dbname)) {
      const entry = dbMap.get(dbname)!;
      const [currentSchemaContent, promise] = entry;
      if (currentSchemaContent !== schema.content) {
        console.warn("Got a schema change. Automigrating.");
        const newPromise = promise.then(async (ctx) => {
          await ctx.db.automigrateTo(schema.name, schema.content);
          return ctx;
        });
        entry[1] = newPromise;
      }
      return await promise;
    }

    const promise = (async () => {
      const sqlite = await init();
      const db = await sqlite.open(dbname);
      await db.automigrateTo(schema.name, schema.content);
      const rx = tblrx(db);
      return {
        db,
        rx,
      };
    })();
    dbMap.set(dbname, [schema.content, promise]);

    return await promise;
  },

  async closeAndRemove(dbname: string) {
    const entry = dbMap.get(dbname);
    if (!entry) {
      return;
    }
    hooks.delete(dbname);
    dbMap.delete(dbname);
    const [_, promise] = entry;
    const newPromise = promise.then(async (db) => {
      db.rx.dispose();
      await db.db.close();
      return db;
    });
    entry[1] = newPromise;
  },

  getHook(dbname: string) {
    return hooks.get(dbname);
  },
} as const;

export default dbFactory;
