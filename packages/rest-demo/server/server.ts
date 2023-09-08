import express from "express";
import * as http from "http";
import { encode, decode, tags, hexToBytes } from "@vlcn.io/ws-common";
import "dotenv/config";
import { spawn } from "child_process";
import { createDb } from "./DBWrapper.js";

const PORT = parseInt(process.env.PORT || "8080");

const app = express();
const server = http.createServer(app);

app.get("/changes/:room", async (req, res) => {
  const db = await createDb(
    req.params.room,
    req.query.schemaName as string,
    BigInt(req.query.schemaVersion as string)
  );
  try {
    const requestorSiteId = hexToBytes(req.query.requestor as string);
    const sinceVersion = BigInt(req.query.since as string);

    console.log(
      `Asked for changes since: ${sinceVersion} requestor: ${requestorSiteId}`
    );

    const changes = db.getChanges(sinceVersion, requestorSiteId);
    const encoded = encode({
      _tag: tags.Changes,
      changes,
      sender: db.getId(),
      since: [sinceVersion, 0],
    });
    res.setHeader("Content-Type", "application/octet-stream");

    console.log(`returning ${changes.length} changes`);
    res.send(encoded);
  } finally {
    db.close();
  }
});

app.post("/changes/:room", express.raw(), async (req, res) => {
  const data = new Uint8Array(req.body.buffer);

  const msg = decode(data);
  if (msg._tag != tags.Changes) {
    throw new Error(`Expected Changes message but got ${msg._tag}`);
  }
  console.log(
    `Received ${msg.changes.length} changes from ${msg.sender} for ${req.params.room}.
    Schema ${req.query.schemaName} version ${req.query.schemaVersion}`
  );

  const db = await createDb(
    req.params.room,
    req.query.schemaName as string,
    BigInt(req.query.schemaVersion as string)
  );
  try {
    db.applyChanges(msg);
    res.send({ status: "OK" });
  } finally {
    db.close();
  }
});

process.env.NODE_ENV === "production" && app.use(express.static("dist"));
server.listen(PORT, () =>
  console.log("info", `listening on http://localhost:${PORT}!`)
);

if (process.env.NODE_ENV !== "production") {
  const child = spawn("pnpm vite");
  child.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });
}
