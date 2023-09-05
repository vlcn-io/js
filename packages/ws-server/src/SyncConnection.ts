import {
  AnnouncePresence,
  Changes,
  RejectChanges,
  bytesToHex,
} from "@vlcn.io/ws-common";
import DBCache from "./DBCache.js";
import OutboundStream from "./streams/OutboundStream.js";
import InboundStream from "./streams/InboundStream.js";
import Transport from "./Trasnport.js";
import { logger } from "@vlcn.io/logger-provider";
import { IDB } from "./DB.js";

/**
 *
 */
export default class SyncConnection {
  readonly #db;
  readonly #dbCache;
  readonly #room;
  readonly #outboundStream;
  readonly #inboundStream;

  constructor(
    dbCache: DBCache,
    db: IDB,
    transport: Transport,
    room: string,
    msg: AnnouncePresence
  ) {
    logger.info(
      `Spun up a sync connection on room ${room} to client ws and client dbid ${bytesToHex(
        msg.sender
      )}`
    );
    this.#dbCache = dbCache;
    this.#db = db;
    this.#room = room;

    this.#outboundStream = new OutboundStream(
      transport,
      this.#db,
      msg.lastSeens,
      msg.sender
    );
    this.#inboundStream = new InboundStream(transport, this.#db, msg.sender);
  }

  start() {
    logger.info(`Starting SyncConnection`);
    this.#inboundStream.start();
    this.#outboundStream.start();
  }

  async receiveChanges(changes: Changes) {
    logger.info(`Sync connection received changes`);
    await this.#inboundStream.receiveChanges(changes);
  }

  changesRejected(rejection: RejectChanges) {
    logger.warn(
      `Sync connection has rejected changes. Resetting outbound stream.`
    );
    this.#outboundStream.reset(rejection);
  }

  close() {
    logger.info(`Sync connection closed`);
    this.#outboundStream.stop();
    // tell the cache we're done. It'll close the db on 0 references.
    this.#dbCache.unref(this.#room);
  }
}

export async function createSyncConnection(
  dbCache: DBCache,
  transport: Transport,
  room: string,
  msg: AnnouncePresence
) {
  const db = await dbCache.getAndRef(room, msg.schemaName, msg.schemaVersion);
  return new SyncConnection(dbCache, db, transport, room, msg);
}
