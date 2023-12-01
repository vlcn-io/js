import { Change } from "@vlcn.io/ws-common";
import { IDB } from "@vlcn.io/ws-server";
import { PrimaryConnection } from "./PrimaryConnection.js";
import logger from "../logger.js";
import type BetterSqlite3 from "better-sqlite3";

export class LiteFSDB implements IDB {
  readonly #proxied;
  readonly #room;
  readonly #primaryConnection;

  constructor(
    room: string,
    proxied: IDB,
    primaryConnection: PrimaryConnection
  ) {
    this.#proxied = proxied;
    this.#room = room;
    this.#primaryConnection = primaryConnection;
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

  getDB(): BetterSqlite3.Database {
    throw new Error(
      "get db is unsafe under litefs deployments as litefs requires write forwarding to the primary"
    );
  }

  // read<T>(sql: string, params: unknown[]): T[] {
  //   return this.#proxied.read(sql, params);
  // }

  // async write(sql: string, params: unknown[]): Promise<void> {
  //   if (!this.#primaryConnection.isPrimary()) {
  //     logger.info("Proxying write to primary");
  //     await this.#primaryConnection.writeOnPrimary(this.#room, sql, params);
  //   } else {
  //     await this.#proxied.write(sql, params);
  //   }
  // }

  getLastSeen(site: Uint8Array): [bigint, number] {
    return this.#proxied.getLastSeen(site);
  }

  async applyChangesetAndSetLastSeen(
    changes: readonly Change[],
    siteId: Uint8Array,
    newLastSeen: readonly [bigint, number]
  ): Promise<void> {
    console.log("apply and set last seen");
    if (!this.#primaryConnection.isPrimary()) {
      logger.info("Proxying changes to primary");
      await this.#primaryConnection.applyChangesOnPrimary(
        this.#room,
        changes,
        siteId,
        newLastSeen
      );
    } else {
      logger.info("Not proxying changes to primary");
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
