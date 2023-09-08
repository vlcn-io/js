import Database from "better-sqlite3";
import { extensionPath } from "@vlcn.io/crsqlite";
import express from "express";
import ViteExpress from "vite-express";
import * as http from "http";

const PORT = parseInt(process.env.PORT || "8080");

const app = express();
const server = http.createServer(app);

app.get("/changes/:room", (req, res) => {
  const room = req.params.room;
  const sinceVersion = req.query.sinceVersion;
  const sinceSeq = req.query.sinceSeq;
  res.send(`Retrieving changes for room: ${room}`);
});

app.post("/changes/:room", express.raw(), (req, res) => {
  const room = req.params.room;
  const data = req.body;
  res.send(`Binary data received for room: ${room}`);
});

server.listen(PORT, () =>
  console.log("info", `listening on http://localhost:${PORT}!`)
);

ViteExpress.bind(app, server);

class SyncedDB {
  constructor() {}
}
