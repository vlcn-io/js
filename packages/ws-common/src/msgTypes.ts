export type Msg =
  | AnnouncePresence
  | Changes
  | RejectChanges
  | StartStreaming
  | ForwardedAnnouncePresence
  | ForwardedChanges
  | Ping
  | Pong
  | ForwardedAnnouncePresenceResonse
  | Err
  | ForwardedChangesResponse;

export const tags = {
  AnnouncePresence: 1,
  Changes: 2,
  RejectChanges: 3,
  StartStreaming: 4,
  ForwardedAnnouncePresence: 5,
  ForwardedChanges: 6,
  Ping: 7,
  Pong: 8,
  ForwardedAnnouncePresenceResonse: 9,
  Err: 10,
  ForwardedChangesResponse: 11,
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

export type ForwardedAnnouncePresence = Omit<AnnouncePresence, "_tag"> &
  Readonly<{
    _tag: Tags["ForwardedAnnouncePresence"];
    room: string;
  }>;

export type ForwardedChanges = Omit<Changes, "_tag"> &
  Readonly<{
    _tag: Tags["ForwardedChanges"];
    room: string;
    newLastSeen: readonly [bigint, number];
  }>;

export type ForwardedAnnouncePresenceResonse = Readonly<{
  _tag: Tags["ForwardedAnnouncePresenceResonse"];
  txid: bigint;
}>;

export type ForwardedChangesResponse = Readonly<{
  _tag: Tags["ForwardedChangesResponse"];
}>;

export type Err = Readonly<{
  _tag: Tags["Err"];
  err: string;
}>;

export type Ping = { _tag: Tags["Ping"] };
export type Pong = { _tag: Tags["Pong"] };
