import net from "net";

class EstablishedConnection {
  // Opens a port and listens for connections
  // This service will be alive even on followers to handle the case
  // where a follow is promoted.
  // If we are de-promoted we should tear down open connections.
  // and clear the db cache.
  // ---
}

export function createLiteFSWriteService() {
  const server = net.createServer();
  server.on("connection", handleConnection);
}

function handleConnection(conn: net.Socket) {}
