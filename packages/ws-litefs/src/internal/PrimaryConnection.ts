import { primaryFilePath, util } from "./util.js";
import chokidar from "chokidar";
import net from "net";
import { port } from "../LiteFSWriteService.js";
import {
  Change,
  CreateDbOnPrimaryResponse,
  ApplyChangesOnPrimaryResponse,
  decode,
  encode,
  tags,
  CreateDbOnPrimary,
  ApplyChangesOnPrimary,
} from "@vlcn.io/ws-common";

let nextRequestId = 0;

// A connection from a follower to the primary.
// Follows the primary as it moves.
export class PrimaryConnection {
  readonly #watcher;
  #closed = false;
  #currentPrimary: string | null = null;
  #primarySocket: PrimarySocket | null = null;

  constructor(currentPrimary: string | null) {
    this.#currentPrimary = currentPrimary;
    this.#watcher = chokidar.watch(primaryFilePath, {
      followSymlinks: false,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      ignoreInitial: false,
    });

    this.#watcher.on("add", this.#primaryFileCreatedOrRemoved);
    this.#watcher.on("unlink", this.#primaryFileCreatedOrRemoved);

    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(
        this.#currentPrimary,
        this.#onSocketPrematurelyClosed
      );
    }
  }

  isPrimary() {
    return this.#currentPrimary == null;
  }

  createDbOnPrimary(
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<CreateDbOnPrimaryResponse> {
    return this.#primarySocket!.sendCreateDb({
      _tag: tags.CreateDbOnPrimary,
      _reqid: nextRequestId++,
      room,
      schemaName,
      schemaVersion,
    });
  }

  applyChangesOnPrimary(
    room: string,
    changes: readonly Change[],
    siteId: Uint8Array,
    newLastSeen: readonly [bigint, number]
  ): Promise<ApplyChangesOnPrimaryResponse> {
    return this.#primarySocket!.sendApplyChanges({
      _tag: tags.ApplyChangesOnPrimary,
      _reqid: nextRequestId++,
      room,
      changes,
      sender: siteId,
      newLastSeen,
    });
  }

  // TODO: test when we only watch a single file and not a dir.
  #primaryFileCreatedOrRemoved = async (_: string) => {
    this.#currentPrimary = await util.readPrimaryFileIfExists();
    if (this.#currentPrimary == null) {
      if (this.#primarySocket != null) {
        this.#primarySocket.close();
      }

      return;
    }

    if (this.#currentPrimary == this.#primarySocket?.currentPrimaryHostname) {
      return;
    }

    if (this.#primarySocket != null) {
      this.#primarySocket.close();
    }

    this.#primarySocket = new PrimarySocket(
      this.#currentPrimary,
      this.#onSocketPrematurelyClosed
    );
  };

  #onSocketPrematurelyClosed = () => {
    // recreate the socket
    this.#primarySocket?.close();
    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(
        this.#currentPrimary,
        this.#onSocketPrematurelyClosed
      );
    }
  };

  close() {
    this.#closed = true;
    this.#watcher.close();
  }
}

class PrimarySocket {
  readonly #currentPrimaryHostname;
  #socket;
  readonly #pingPongHandle;
  readonly #onPrematurelyClosed;
  #lastPong;
  // since we multiplex requests over a single socket, we need to keep track of
  // which request is which.
  readonly #createDbRequests = new Map<
    number,
    (msg: CreateDbOnPrimaryResponse) => void
  >();
  readonly #applyChangesRequests = new Map<
    number,
    (msg: ApplyChangesOnPrimaryResponse) => void
  >();
  #closed = false;

  constructor(currentPrimaryHostname: string, onPrematurelyClosed: () => void) {
    this.#currentPrimaryHostname = currentPrimaryHostname;
    this.#socket = this.#connect();
    this.#pingPongHandle = setInterval(this.#sendPing, 1000);
    this.#lastPong = Date.now();
    this.#onPrematurelyClosed = onPrematurelyClosed;
  }

  sendCreateDb(msg: CreateDbOnPrimary): Promise<CreateDbOnPrimaryResponse> {
    return new Promise((resolve, reject) => {
      const requestId = nextRequestId++;
      this.#createDbRequests.set(
        requestId,
        (msg: CreateDbOnPrimaryResponse) => {
          this.#createDbRequests.delete(requestId);
          resolve(msg);
        }
      );
      this.#socket.write(encode(msg), (e) => {
        if (e) {
          this.#createDbRequests.delete(requestId);
          reject(e);
        }
      });
    });
  }

  sendApplyChanges(
    msg: ApplyChangesOnPrimary
  ): Promise<ApplyChangesOnPrimaryResponse> {
    return new Promise((resolve, reject) => {
      const requestId = nextRequestId++;
      this.#applyChangesRequests.set(
        requestId,
        (msg: ApplyChangesOnPrimaryResponse) => {
          this.#applyChangesRequests.delete(requestId);
          resolve(msg);
        }
      );
      this.#socket.write(encode(msg), (e) => {
        if (e) {
          this.#applyChangesRequests.delete(requestId);
          reject(e);
        }
      });
    });
  }

  #connect() {
    const socket = new net.Socket();

    socket.connect(port, this.#currentPrimaryHostname);
    socket.on("data", this.#handleMessage);
    socket.on("error", this.#onError);
    socket.on("close", this.#onClose);
    this.#lastPong = Date.now();
    return socket;
  }

  #handleMessage = (data: Buffer) => {
    // ping pong processing to re-establish connection that was broken for unknown reasons
    const msg = decode(data);
    switch (msg._tag) {
      case tags.Pong:
        this.#lastPong = Date.now();
        return;
      case tags.CreateDbOnPrimaryResponse:

      case tags.Err:
      case tags.ApplyChangesOnPrimaryResponse:
      default:
        throw new Error(`Unexpected message type: ${msg._tag}`);
    }
  };

  #onError = () => {
    if (!this.#closed) {
      this.#onPrematurelyClosed();
    }
  };
  #onClose = () => {
    if (!this.#closed) {
      this.#onPrematurelyClosed();
    }
  };

  #sendPing = () => {
    if (Date.now() - this.#lastPong > 5000) {
      this.#socket.destroy();
      clearInterval(this.#pingPongHandle);
      return;
    }
    this.#socket.write(
      encode({
        _tag: tags.Ping,
      }),
      (e) => {
        if (e) {
          console.error(e);
        }
      }
    );
  };

  get currentPrimaryHostname() {
    return this.#currentPrimaryHostname;
  }

  close() {
    this.#closed = true;
    this.#socket.destroy();
    clearInterval(this.#pingPongHandle);
  }
}

export async function createPrimaryConnection() {
  const currentPrimary = await util.readPrimaryFileIfExists();
  return new PrimaryConnection(currentPrimary);
}
