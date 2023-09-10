# @vlcn.io/ws-server

# Basic Setup

WebSocket sync server. Setups is pretty straightforward and involves:

1. Defining a config
2. Attaching the websocket server to your http server

## Define Config

```ts
const wsConfig = {
  // Folder where database files should be placed
  dbFolder: "./dbs",
  // Folder that contains `.sql` schema files to apply to databases
  schemaFolder: "./src/schemas",
  // The path(s) that the websocket server should listen to
  pathPattern: /\/sync/,
};
```

## Attach to Server

```ts
import * as http from "http";
const app = express(); // or fastify or nest or whatever
const server = http.createServer(app);

const wsConfig = {
  dbFolder: "./dbs",
  schemaFolder: "./src/schemas",
  pathPattern: /\/sync/,
};

// Attach here:
attachWebsocketServer(server, wsConfig);

server.listen(PORT, () =>
  console.log("info", `listening on http://localhost:${PORT}!`)
);
```

# LiteFS Setup

> Note: LiteFS support is not production ready. It currently does not handle 
> LiteFS primary node failover.

If you want to replicate your DB on the backend via [LiteFS](https://fly.io/docs/litefs/) you can specify a few additional configuration options.

```ts
const wsConfig = {
  dbFolder: "./dbs",
  schemaFolder: "./src/schemas",
  pathPattern: /\/sync/,
  // appName is REQUIRED for LiteFS setups
  appName: process.env.FLY_APP_NAME
};

const WRITE_FORWARD_PORT = 9000;
const dbFactory = await createLiteFSDBFactory(WRITE_FORWARD_PORT, wsConfig);
dbCache = attachWebsocketServer(
  server,
  wsConfig,
  dbFactory,
  new FSNotify(wsConfig)
);

// Set up a service to receive forwarded writes
createLiteFSWriteService(WRITE_FORWARD_PORT, wsConfig, dbCache);
```