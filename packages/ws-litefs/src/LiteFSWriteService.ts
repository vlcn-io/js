import { Config, internal } from "@vlcn.io/ws-server";
import net from "net";
import { LiteFSForwardedWriteReceiver } from "./internal/LiteFSForwardedWriteReceiver.js";

class EstablishedConnection {
  readonly #writer;
  #closed = false;

  // Opens a port and listens for connections
  // This service will be alive even on followers to handle the case
  // where a follow is promoted.
  // If we are de-promoted we should tear down open connections.
  // and clear the db cache.
  // ---
  constructor(conn: net.Socket, config: Config) {
    conn.on("data", this.#handleMessage);
    conn.on("close", this.close);
    conn.on("error", this.close);

    this.#writer = new LiteFSForwardedWriteReceiver(config);
  }

  #handleMessage = (data: Buffer) => {
    if (this.#closed) {
      return;
    }
    // decodes the binary-encoded message
    // processes it.
  };

  close = () => {
    this.#closed = true;
    this.#writer.close();
  };
}

export function createLiteFSWriteService(config: Config) {
  const server = net.createServer();
  server.on("connection", (conn) => handleConnection(conn, config));
}

function handleConnection(conn: net.Socket, config: Config) {
  new EstablishedConnection(conn, config);
}
