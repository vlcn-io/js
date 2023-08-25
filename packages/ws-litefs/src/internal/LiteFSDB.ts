import { Change } from "@vlcn.io/ws-common";
import { IDB } from "@vlcn.io/ws-server";
import { util } from "./util.js";

export class LiteFSDB implements IDB {
  readonly #proxied;
  readonly #room;
  // #primaryConnection;

  constructor(room: string, proxied: IDB) {
    this.#proxied = proxied;
    this.#room = room;
  }

  get siteId(): Uint8Array {
    return this.#proxied.siteId;
  }
  get schemaName(): string {
    return this.#proxied.schemaName;
  }
  get schemaVersion(): bigint {
    return this.#proxied.schemaVersion;
  }

  getLastSeen(site: Uint8Array): [bigint, number] {
    return this.#proxied.getLastSeen(site);
  }

  async applyChangesetAndSetLastSeen(
    changes: readonly Change[],
    siteId: Uint8Array,
    newLastSeen: readonly [bigint, number]
  ): Promise<void> {
    const primary = await util.readPrimaryFileIfExists();
    if (primary != null) {
    } else {
      this.#proxied.applyChangesetAndSetLastSeen(changes, siteId, newLastSeen);
    }
  }

  pullChangeset(
    since: readonly [bigint, number],
    excludeSite: Uint8Array
  ): readonly Change[] {
    return this.#proxied.pullChangeset(since, excludeSite);
  }

  schemasMatch(schemaName: string, schemaVersion: bigint): boolean {
    return this.#proxied.schemasMatch(schemaName, schemaVersion);
  }

  onChange(cb: () => void): () => void {
    return this.#proxied.onChange(cb);
  }

  close(): void {
    return this.#proxied.close();
  }
}
