import schemaContent from "./schemas/main.sql?raw";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { DBProvider } from "@vlcn.io/react";

const hash = parseHash();
const room = getRoomId(hash);
if (room != hash.room) {
  hash.room = room;
  window.location.hash = writeHash(hash);
}
localStorage.setItem("room", room);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <DBProvider
    dbname={room}
    schema={{
      name: "main.sql",
      content: schemaContent,
    }}
  >
    <App dbname={room} />
  </DBProvider>
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

function getRoomId(hash: HashBag): string {
  return (
    hash.room ||
    localStorage.getItem("room") ||
    crypto.randomUUID().replaceAll("-", "")
  );
}
