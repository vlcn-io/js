import initWasm, { SQLite3 } from "@vlcn.io/crsqlite-wasm";
import tblrx from "@vlcn.io/rx-tbl";
import { CtxAsync } from "../context.js";
import { Mutex } from "async-mutex";

// TODO: xplat-api new pkg has these types
export type DBID = string;
export type Schema = {
  name: string;
  content: string;
};

const dbMap = new Map<DBID, [string, CtxAsync]>();
const hooks = new Map<DBID, () => CtxAsync | null>();

let initPromise: Promise<SQLite3> | null = null;
function init(wasmUri?: string) {
  if (initPromise) {
    return initPromise;
  }

  initPromise = initWasm(wasmUri ? () => wasmUri : undefined);
  return initPromise;
}

// We need to serialize access to the factory since React StrictMode
// will call the factory twice for the same DB name
// in rapid succession.
// Not serializing access gets us into states where an `open` operation
// can kick off while a `close` operation for the same DB is still in process.
// An optimization could be to serialize by dbname rather than at a top level
// but opening more than one DB at a time is not a common use case.
export const factoryMutex = new Mutex();
(factoryMutex as any).name = "reactDbFactoryMutex";

// TODO: serialize the DB factory because react concurrent mode bogusness
const dbFactory = {
  async get(dbname: string, schema: Schema, hook?: () => CtxAsync | null) {
    return await factoryMutex.runExclusive(async () => {
      if (hook) {
        hooks.set(dbname, hook);
      }
      if (dbMap.has(dbname)) {
        const entry = dbMap.get(dbname)!;
        const [currentSchemaContent, ctx] = entry;
        if (currentSchemaContent !== schema.content) {
          console.warn("Got a schema change. Automigrating.");
          await ctx.db.automigrateTo(schema.name, schema.content);
        }
        return ctx;
      }

      const sqlite = await init();
      const db = await sqlite.open(dbname);
      await db.automigrateTo(schema.name, schema.content);
      const rx = tblrx(db);
      const ctx = {
        db,
        rx,
      } as CtxAsync;
      dbMap.set(dbname, [schema.content, ctx]);

      return ctx;
    });
  },

  async closeAndRemove(dbname: string) {
    await factoryMutex.runExclusive(async () => {
      const entry = dbMap.get(dbname);
      if (!entry) {
        return;
      }
      hooks.delete(dbname);
      dbMap.delete(dbname);
      const [_, ctx] = entry;

      ctx.rx.dispose();
      await ctx.db.close();
    });
  },

  getHook(dbname: string) {
    return hooks.get(dbname);
  },
} as const;

export default dbFactory;
