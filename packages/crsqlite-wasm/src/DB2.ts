import { DBAsync } from "@vlcn.io/xplat-api";
import { Mutex } from "async-mutex";
import { SQLITE_UTF8 } from "@vlcn.io/wa-sqlite";

// if we switch to SAHPool we'd just need DBInstanceMutexes?
const wasmInstanceMutexes = new Map<SQLiteAPI, Mutex>();

// export class DB implements DBAsync {
//   readonly #topLevelMutex;
//   // To do the improved query cache we'd need to hook into
//   // auth callbacks and understand used tables so we can do invalidations
//   // correctly.
//   readonly #queryCache = new Map<string, Promise<any>>();
//   #siteid: string | null = null;
//   // DB needs a top level mutex
//   // so we can serialize transactions
//   constructor(api: SQLiteAPI, db: number, filename: string) {
//     let mutex = wasmInstanceMutexes.get(api);
//     if (mutex == null) {
//       mutex = new Mutex();
//       wasmInstanceMutexes.set(api, mutex);
//     }
//     this.#topLevelMutex = mutex;
//   }

//   get siteid(): string {
//     return this.#siteid!;
//   }

//   _setSiteid(siteid: string) {
//     if (this.#siteid) {
//       throw new Error("Site id already set");
//     }
//     this.#siteid = siteid;
//   }
// }
