import { WorkerInterface } from "@vlcn.io/ws-client";
import { useEffect } from "react";

// hook to start syncing a DB
export type Options = {
  dbname: string;
  endpoint: string;
  room: string;
  worker: Worker;
  authToken?: string;
};

export default function useSync({
  worker,
  dbname,
  room,
  endpoint,
  authToken,
}: Options) {
  useEffect(() => {
    const workerInterface = new WorkerInterface(worker);

    workerInterface.startSync(dbname, {
      room: room,
      url: endpoint,
      authToken: authToken,
    });
    return () => {
      workerInterface.stopSync(dbname);
    };
  }, [dbname, room, endpoint, worker]);
}
