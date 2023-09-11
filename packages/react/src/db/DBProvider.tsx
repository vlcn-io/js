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
  fallback,
  Render,
}: {
  dbname: string;
  schema: Schema;
  fallback?: react.ReactNode;
  Render: react.FunctionComponent;
}) {
  const [contextRef, _setContextRef] = useState(createContext);
  const [dbRef, setDbRef] = useState<CtxAsync | null>(null);
  useEffect(() => {
    let closed = false;
    dbFactory.get(dbname, schema, contextRef.useDb).then((db) => {
      if (!closed) {
        setDbRef(db);
      }
    });
    return () => {
      closed = true;
      setDbRef(null);
      dbFactory.closeAndRemove(dbname);
    };
  }, [dbname, schema, contextRef.useDb]);
  if (dbRef === null || dbFactory.getHook(dbname) == null) {
    return <>{fallback}</> ?? <div>Creating DB {dbname}</div>;
  }
  return (
    <DbAvailable ctx={dbRef} DBContext={contextRef.DBContext}>
      <Render />
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
