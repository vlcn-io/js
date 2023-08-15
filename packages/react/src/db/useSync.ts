import { WorkerInterface } from "@vlcn.io/ws-client";
import { useEffect } from "react";

// hook to start syncing a DB
export type Options = {
  dbname: string;
  endpoint: string;
  room: string;
  workerUrl: string;
  authToken?: string;
};

export default function useSync({
  workerUrl,
  dbname,
  room,
  endpoint,
  authToken,
}: Options) {
  useEffect(() => {
    const worker = new WorkerInterface(workerUrl);

    worker.startSync(dbname, {
      room: room,
      url: endpoint,
      authToken: authToken,
    });
    return () => {
      worker.stopSync(dbname);
    };
  }, [dbname, room, endpoint, workerUrl]);
}
