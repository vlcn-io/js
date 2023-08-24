import { IDB } from "./DB.js";

export interface IDBFactory {
  createDB(): Promise<IDB>;
}

export default class DBFactory implements IDBFactory {
  async createDB(): Promise<IDB> {
    throw new Error("unimplemented");
  }
}
