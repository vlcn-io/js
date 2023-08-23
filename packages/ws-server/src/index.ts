import { IncomingMessage } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import logger from "./logger.js";
import type { Server } from "http";
import DBCache from "./DBCache.js";
import ConnectionBroker from "./ConnectionBroker.js";
import { Config } from "./config.js";
import FSNotify from "./fs/FSNotify.js";

export * from "./config.js";

function noopAuth(
  req: IncomingMessage,
  token: string | null,
  cb: (err: any) => void
) {
  cb(null);
}

export function attachWebsocketServer(
  server: Server,
  config: Config,
  authenticate: (
    req: IncomingMessage,
    token: string | null,
    cb: (err: any) => void
  ) => void = noopAuth
) {
  // warn on multiple instantiations?
  let fsnotify: FSNotify | null;
  if (config.dbFolder == null) {
    console.warn(
      "In-memory databases cannot be listened to by other processes or replicas!"
    );
    fsnotify = null;
  } else {
    fsnotify = new FSNotify(config);
  }
  const dbCache = new DBCache(config, fsnotify);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    logger.info("upgrading to ws connection");
    const options = pullSecHeaders(request);
    authenticate(request, options.auth || null, (err) => {
      if (err) {
        logger.error("failed to authenticate");
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        if (config.pathPattern.test(request.url || "")) {
          wss.emit("connection", ws, request);
        }
      });
    });
  });

  wss.on("connection", (ws: WebSocket, request) => {
    logger.info(`Connection opened`);

    const options = pullSecHeaders(request);
    if (!options.room) {
      console.error("Expected to receive a room in the sec-websocket-protocol");
      ws.close();
      return;
    }
    new ConnectionBroker({ ws, dbCache, room: options.room });
  });
}

function pullSecHeaders(request: IncomingMessage) {
  const proto = request.headers["sec-websocket-protocol"];
  if (proto == null) {
    throw new Error("Expected sec-websocket-protocol header");
  }
  const entries = proto?.split(",");
  const options: { [key: string]: string } = {};
  for (const entry of entries) {
    const [key, value] = atob(entry).split("=");
    options[key] = value;
  }
  return options;
}
