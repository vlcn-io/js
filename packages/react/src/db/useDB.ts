import dbFactory from "./DBFactory.js";
import { CtxAsync } from "../context.js";

export default function useDB(dbname: string): CtxAsync {
  return dbFactory.getHook(dbname)!()!;
}
