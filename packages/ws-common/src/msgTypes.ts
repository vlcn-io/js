export type Msg =
  | AnnouncePresence
  | Changes
  | RejectChanges
  | StartStreaming
  | CreateDbOnPrimary
  | ApplyChangesOnPrimary
  | Ping
  | Pong
  | CreateDbOnPrimaryResponse
  | Err
  | ApplyChangesOnPrimaryResponse;

export const tags = {
  AnnouncePresence: 1,
  Changes: 2,
  RejectChanges: 3,
  StartStreaming: 4,
  CreateDbOnPrimary: 5,
  ApplyChangesOnPrimary: 6,
  Ping: 7,
  Pong: 8,
  CreateDbOnPrimaryResponse: 9,
  Err: 10,
  ApplyChangesOnPrimaryResponse: 11,
} as const;

export type Tags = typeof tags;
export type TagValues = Tags[keyof Tags];

export type CID = string;
export type PackedPks = Uint8Array;
export type TableName = string;
export type Version = bigint;
export type CausalLength = bigint;
export type Val = any;

export type Change = readonly [
  TableName,
  PackedPks,
  CID,
  Val,
  Version, // col version
  Version, // db version
  Uint8Array | null,
  CausalLength,
];

export type AnnouncePresence = Readonly<{
  _tag: Tags["AnnouncePresence"];
  sender: Uint8Array;
  lastSeens: readonly [Uint8Array, [bigint, number]][];
  schemaName: string;
  schemaVersion: bigint;
}>;

export type Changes = Readonly<{
  _tag: Tags["Changes"];
  sender: Uint8Array;
  since: readonly [bigint, number];
  changes: Readonly<Change[]>;
}>;

export type RejectChanges = Readonly<{
  _tag: Tags["RejectChanges"];
  whose: Uint8Array;
  since: readonly [bigint, number];
}>;

export type StartStreaming = Readonly<{
  _tag: Tags["StartStreaming"];
  since: readonly [bigint, number];
  excludeSites: readonly Uint8Array[];
  localOnly: boolean;
}>;

export type CreateDbOnPrimary = Readonly<{
  _tag: Tags["CreateDbOnPrimary"];
  _reqid: number;
  room: string;
  schemaName: string;
  schemaVersion: bigint;
}>;

export type ApplyChangesOnPrimary = Omit<Changes, "_tag" | "since"> &
  Readonly<{
    _tag: Tags["ApplyChangesOnPrimary"];
    _reqid: number;
    room: string;
    newLastSeen: readonly [bigint, number];
  }>;

export type CreateDbOnPrimaryResponse = Readonly<{
  _tag: Tags["CreateDbOnPrimaryResponse"];
  _reqid: number;
  txid: bigint;
}>;

export type ApplyChangesOnPrimaryResponse = Readonly<{
  _tag: Tags["ApplyChangesOnPrimaryResponse"];
  _reqid: number;
}>;

export type Err = Readonly<{
  _tag: Tags["Err"];
  _reqid: number;
  err: string;
}>;

export type Ping = { _tag: Tags["Ping"] };
export type Pong = { _tag: Tags["Pong"] };
