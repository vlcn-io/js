// Just provide a DB.
// Do not do any sync. Sync can be configured separately.
// no wasm url.. that optimize deps thinger

import react, { useEffect, useState } from "react";
import dbFactory, { Schema } from "./DBFactory.js";
import { CtxAsync } from "../context.js";
import { createContext } from "./DBContext.js";

export default function DBProvider({
  dbname,
  schema,
  fallback,
  Render,
  manualSetup,
}: {
  dbname: string;
  schema: Schema;
  fallback?: react.ReactNode;
  manualSetup?: (ctx: CtxAsync) => Promise<void>;
  Render: react.FunctionComponent;
}) {
  const [contextRef, _setContextRef] = useState(createContext);
  const [dbRef, setDbRef] = useState<CtxAsync | null>(null);
  useEffect(() => {
    let closed = false;
    dbFactory
      .get(dbname, schema, contextRef.useDb)
      .then((db) => {
        if (closed) {
          return;
        }
        if (manualSetup) {
          manualSetup(db)
            .then(() => {
              if (closed) {
                return;
              }
              setDbRef(db);
            })
            .catch((e) => {
              console.error("Error running manual setup", e);
              throw e;
            });
        } else {
          setDbRef(db);
        }
      })
      .catch((e) => {
        console.error("Error creating db", e);
        throw e;
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
