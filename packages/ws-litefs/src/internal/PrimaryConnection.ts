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
  Err,
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
    this.#primarySocket?.close();
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
    (msg: CreateDbOnPrimaryResponse | Err) => void
  >();
  readonly #applyChangesRequests = new Map<
    number,
    (msg: ApplyChangesOnPrimaryResponse | Err) => void
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
        (msg: CreateDbOnPrimaryResponse | Err) => {
          this.#createDbRequests.delete(requestId);
          if (msg._tag == tags.Err) {
            reject(msg);
          } else {
            resolve(msg);
          }
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
        (msg: ApplyChangesOnPrimaryResponse | Err) => {
          this.#applyChangesRequests.delete(requestId);
          if (msg._tag == tags.Err) {
            reject(msg);
          } else {
            resolve(msg);
          }
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
    const msg = decode(data);
    switch (msg._tag) {
      case tags.Pong:
        this.#lastPong = Date.now();
        return;
      case tags.CreateDbOnPrimaryResponse:
        const createDbRequest = this.#createDbRequests.get(msg._reqid);
        if (createDbRequest == null) {
          throw new Error(
            `Received a response for a request that doesn't exist: ${msg._reqid}`
          );
        }
        createDbRequest(msg);
        return;
      case tags.Err:
        const createRequest = this.#createDbRequests.get(msg._reqid);
        if (createRequest != null) {
          createRequest(msg);
          return;
        }
        const applyRequest = this.#applyChangesRequests.get(msg._reqid);
        if (applyRequest != null) {
          applyRequest(msg);
          return;
        }
        throw new Error(
          `Received an error response for a request that doesn't exist: ${msg._reqid}`
        );
      case tags.ApplyChangesOnPrimaryResponse:
        const applyChangesRequest = this.#applyChangesRequests.get(msg._reqid);
        if (applyChangesRequest == null) {
          throw new Error(
            `Received a response for a request that doesn't exist: ${msg._reqid}`
          );
        }
        applyChangesRequest(msg);
        return;
      default:
        throw new Error(`Unexpected message type: ${msg._tag}`);
    }
  };

  #onError = () => {
    if (!this.#closed) {
      this.#rejectPending();
      this.#onPrematurelyClosed();
    }
  };
  #onClose = () => {
    if (!this.#closed) {
      this.#rejectPending();
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

  #rejectPending() {
    for (const [_, reject] of this.#createDbRequests) {
      reject({
        _tag: tags.Err,
        _reqid: -1,
        err: "Primary connection closed",
      });
    }
    this.#createDbRequests.clear();

    for (const [_, reject] of this.#applyChangesRequests) {
      reject({
        _tag: tags.Err,
        _reqid: -1,
        err: "Primary connection closed",
      });
    }
    this.#applyChangesRequests.clear();
  }

  get currentPrimaryHostname() {
    return this.#currentPrimaryHostname;
  }

  close() {
    this.#closed = true;
    this.#socket.destroy();
    clearInterval(this.#pingPongHandle);
    this.#rejectPending();
  }
}

export async function createPrimaryConnection() {
  const currentPrimary = await util.readPrimaryFileIfExists();
  return new PrimaryConnection(currentPrimary);
}
