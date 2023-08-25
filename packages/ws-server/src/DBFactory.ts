import { IDB } from "./DB.js";
import { Config } from "./config.js";
import FSNotify from "./fs/FSNotify.js";

export interface IDBFactory {
  createDB(
    config: Config,
    fsnotify: FSNotify | null,
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<IDB>;
}

export default class DBFactory implements IDBFactory {
  async createDB(): Promise<IDB> {
    throw new Error("unimplemented");
  }
}
