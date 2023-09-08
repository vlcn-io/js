import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import schemaContent from "./schemas/main.sql?raw";
import { DBProvider } from "@vlcn.io/react";
import React from "react";

/**
 * Generates a random room name to sync with or pulls one from local storage.
 */
function getRoom(hash: HashBag): string {
  return hash.room || localStorage.getItem("room") || newRoom();
}

const hash = parseHash();
const room = getRoom(hash);
if (room != hash.room) {
  hash.room = room;
  window.location.hash = writeHash(hash);
}
localStorage.setItem("room", room);

// Launch our app.
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DBProvider
      dbname={room}
      schema={{
        name: "main.sql",
        content: schemaContent,
      }}
    >
      <App dbname={room} />
    </DBProvider>
  </React.StrictMode>
);

type HashBag = { [key: string]: string };
function parseHash(): HashBag {
  const hash = window.location.hash;
  const ret: { [key: string]: string } = {};
  if (hash.length > 1) {
    const substr = hash.substring(1);
    const parts = substr.split(",");
    for (const part of parts) {
      const [key, value] = part.split("=");
      ret[key] = value;
    }
  }

  return ret;
}

function writeHash(hash: HashBag) {
  const parts = [];
  for (const key in hash) {
    parts.push(`${key}=${hash[key]}`);
  }
  return parts.join(",");
}

function newRoom() {
  return crypto.randomUUID().replaceAll("-", "");
}
