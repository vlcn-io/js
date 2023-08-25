import { Config, internal } from "@vlcn.io/ws-server";
import net from "net";
import { LiteFSForwardedWriteReceiver } from "./internal/LiteFSForwardedWriteReceiver.js";

class EstablishedConnection {
  readonly #writer;
  #closed = false;
  readonly #conn;

  // Opens a port and listens for connections
  // This service will be alive even on followers to handle the case
  // where a follower is promoted.
  // If we are de-promoted we should tear down open connections.
  // ---
  constructor(conn: net.Socket, config: Config) {
    this.#conn = conn;
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
    // processes it by passing it to #writer
  };

  close = () => {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#writer.close();
    this.#conn.destroy();
  };
}

export function createLiteFSWriteService(config: Config) {
  const server = net.createServer();
  server.on("connection", (conn) => handleConnection(conn, config));
}

function handleConnection(conn: net.Socket, config: Config) {
  new EstablishedConnection(conn, config);
}
