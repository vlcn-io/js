import { AnnouncePresence, Changes } from "@vlcn.io/ws-common";
import { Config, PresenceResponse, internal } from "@vlcn.io/ws-server";
import fs from "fs";

// Master side. Receives a forwarded write.
// Should we only allow message that are inside the same network? Can we determine the litefs network?
export class LiteFSForwardedWriteReceiver {
  readonly #dbcache;
  #db: InstanceType<typeof internal.DB> | null = null;
  #room: string | null = null;
  readonly #config;

  constructor(config: Config) {
    this.#dbcache = new internal.DBCache(config, null);
    this.#config = config;
  }

  // Receive an AnnouncePresence message from a follower
  // Does the setup then returns the txid.
  // Caller should catch errors and return?
  // This is unrelated to "presence" (mouse position) information.
  async receivedPresence(
    room: string,
    msg: AnnouncePresence
  ): Promise<PresenceResponse> {
    if (this.#room != null) {
      throw new Error(`illegal state -- room already set ${room}`);
    }
    // The master needs to create the DB and apply (or migrate) the schema
    // which is done when retrieving the DB from the cache.
    try {
      this.#db = this.#dbcache.getAndRef(
        room,
        msg.schemaName,
        msg.schemaVersion
      );
      this.#room = room;
    } catch (e: any) {
      return {
        err: e.message,
      };
    }

    const content = await fs.promises.readFile(
      internal.getDbPath(room, this.#config) + "-pos",
      { encoding: "utf-8" }
    );
    const [txidHex, _checksum] = content.split("/");

    if (txidHex.length != 16) {
      throw new Error("Unexpected txid length");
    }
    return { txid: BigInt("0x" + txidHex) };
  }

  // Receives a Changes message from a follower
  async receivedChanges(
    msg: Changes,
    newLastSeen: [bigint, number]
  ): Promise<void> {
    // apply changes against the db
    this.#db?.applyChangesetAndSetLastSeen(
      msg.changes,
      msg.sender,
      newLastSeen
    );
  }

  close() {
    if (this.#room == null) {
      return;
    }
    this.#dbcache.unref(this.#room);
  }
}
