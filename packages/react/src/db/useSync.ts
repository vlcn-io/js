import { WorkerInterface } from "@vlcn.io/ws-client";
import { useEffect } from "react";

// hook to start syncing a DB
export type Options = {
  localDbName: string;
  url: string;
  room: string;
  workerUrl: string;
  authToken?: string;
};

export default function useSync({
  workerUrl,
  localDbName,
  room,
  url,
  authToken,
}: Options) {
  useEffect(() => {
    const worker = new WorkerInterface(workerUrl);

    worker.startSync(localDbName, {
      room: room,
      url: url,
      authToken: authToken,
    });
    return () => {
      worker.stopSync(localDbName);
    };
  }, [localDbName, room, url, workerUrl]);
}
