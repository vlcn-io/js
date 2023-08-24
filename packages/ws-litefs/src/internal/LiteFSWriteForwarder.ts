import { AnnouncePresence, Changes } from "@vlcn.io/ws-common";
import { IWriteForwarder, PresenceResponse } from "@vlcn.io/ws-server";

/**
 * Followers call this to forward writes to the leader.
 *
 * An instance of this class should be passed to `attachWebsocketServer`
 * via `config.writeForwarder` if writes need to be forwarded to the LiteFS primary.
 */
export class LiteFSWriteForwarder implements IWriteForwarder {
  #dbFolder;

  constructor(dbFolder: string) {
    this.#dbFolder = dbFolder;
  }

  // forwards the AnnouncePresence write.
  // Blocks the caller until the local db has replicated up to the changes
  // made by the forwarded write.
  async announcePresence(
    room: string,
    msg: AnnouncePresence
  ): Promise<PresenceResponse> {
    return { txid: 0n };
  }

  // forwards the Changes write.
  // Does not block the caller as the caller does not
  // need to post a response or read the db.
  async changes(room: string, msg: Changes): Promise<void> {}

  shouldForwardWrites(): boolean {
    // only return true if we are currently the primary.
    // Should we observe the primary status or read it on each
    // write request?
    return false;
  }
}
