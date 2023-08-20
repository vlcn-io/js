/**
 * This is only needed in simulated environments on OSX and Windows
 */
import { throttle } from "throttle-debounce";
import util from "./util.js";

const apply = throttle(25, (dbpath: string) => {
  util.touchFile(dbpath);
});

export default function touchHack(dbpath: string) {
  if (!util.needsTouchHack()) {
    return;
  }

  apply(dbpath);
}
