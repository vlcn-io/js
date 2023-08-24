import { AnnouncePresence, Changes } from "@vlcn.io/ws-common";

export type PresenceResponse =
  | {
      txid: bigint;
    }
  | {
      err: string;
    };

export interface IWriteForwarder {
  // forwards the AnnouncePresence write.
  // Blocks the caller until the local db has replicated up to the changes
  // made by the forwarded write.
  announcePresence(
    room: string,
    msg: AnnouncePresence
  ): Promise<PresenceResponse>;

  // forwards the Changes write.
  // Does not block the caller as the caller does not
  // need to post a response or read the db.
  changes(room: string, msg: Changes): Promise<void>;

  // Returns true if the write forwarder is running on a follower
  shouldForwardWrites(): boolean;
}
