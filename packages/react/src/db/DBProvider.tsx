// Just provide a DB.
// Do not do any sync. Sync can be configured separately.
// no wasm url.. that optimize deps thinger

import react, { useEffect, useRef, useState } from "react";
import dbFactory, { Schema } from "./DBFactory.js";
import { CtxAsync } from "../context.js";
import { createContext } from "./DBContext.js";

export default function DBProvider({
  dbname,
  schema,
  children,
}: {
  dbname: string;
  schema: Schema;
  children: react.ReactNode;
}) {
  const contextRef = useRef(createContext());
  const [dbRef, setDbRef] = useState<CtxAsync | null>(null);
  useEffect(() => {
    let closed = false;
    dbFactory.get(dbname, schema, contextRef.current.useDb).then((db) => {
      if (!closed) {
        setDbRef(db);
      }
    });
    return () => {
      closed = true;
      setDbRef(null);
      dbFactory.closeAndRemove(dbname);
    };
  }, [dbname, schema, contextRef.current.useDb]);
  if (dbRef === null || dbFactory.getHook(dbname) == null) {
    return <div>Creating DB {dbname}</div>;
  }
  return (
    <DbAvailable ctx={dbRef} DBContext={contextRef.current.DBContext}>
      {children}
    </DbAvailable>
  );
}

function DbAvailable({
  children,
  ctx,
  DBContext,
}: {
  children: react.ReactNode;
  ctx: CtxAsync;
  DBContext: React.Context<CtxAsync | null>;
}) {
  return <DBContext.Provider value={ctx}>{children}</DBContext.Provider>;
}
