import { IDBFactory } from "@vlcn.io/ws-server";
import { IDB } from "@vlcn.io/ws-server/src/DB";

export class LiteFSDBFactory implements IDBFactory {
  async createDB(): Promise<IDB> {
    throw new Error("unimplemented");
  }
}
