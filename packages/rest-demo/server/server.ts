import Fastify from "fastify";
import { encode, decode, tags, hexToBytes } from "@vlcn.io/ws-common";
import { spawn } from "child_process";
import { createDb } from "./DBWrapper.js";
import cors from "@fastify/cors";
import path from "path";
import fastifyStatic from "@fastify/static";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const PORT = parseInt(process.env.PORT || "8080");

const app = Fastify({
  logger: true,
});
await app.register(cors);
app.addContentTypeParser(
  "application/octet-stream",
  { parseAs: "buffer" },
  (_req, body, done) => {
    try {
      done(null, {
        raw: body,
      });
    } catch (error: any) {
      error.statusCode = 400;
      done(error, undefined);
    }
  }
);
if (process.env.NODE_ENV !== "production") {
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "dist"),
  });
}

app.get<{
  Params: { room: string };
  Querystring: {
    schemaName: string;
    schemaVersion: string;
    requestor: string;
    since: string;
  };
}>("/changes/:room", async (req, res) => {
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
    res.header("Content-Type", "application/octet-stream");

    console.log(`returning ${changes.length} changes`);
    res.send(encoded);
  } finally {
    db.close();
  }
});

app.post<{
  Params: { room: string };
  Querystring: { schemaName: string; schemaVersion: string };
}>("/changes/:room", {
  config: {
    rawBody: true,
  },
  handler: async (req, res) => {
    const data = new Uint8Array((req.body as any).raw);
    console.log(data);

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
  },
});

if (process.env.NODE_ENV !== "production") {
  const child = spawn("pnpm", ["vite"]);
  child.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });
}

await app.listen({ port: PORT });
