import * as decoding from "lib0/decoding";
import {
  AnnouncePresence,
  Change,
  Changes,
  ForwardedAnnouncePresence,
  ForwardedChanges,
  Msg,
  RejectChanges,
  StartStreaming,
  TagValues,
  tags,
} from "./msgTypes.js";
import { BIGINT, BLOB, BOOL, NULL, NUMBER, STRING } from "./encode.js";

export function decode(msg: Uint8Array): Msg {
  const decoder = decoding.createDecoder(msg);
  const tag = decoding.readUint8(decoder) as TagValues;
  switch (tag) {
    case tags.AnnouncePresence:
      return {
        _tag: tags.AnnouncePresence,
        sender: decoding.readUint8Array(decoder, 16),
        lastSeens: Array.from({ length: decoding.readVarUint(decoder) }).map(
          (_) => {
            return [
              decoding.readUint8Array(decoder, 16),
              [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
            ];
          }
        ),
        schemaName: decoding.readVarString(decoder),
        schemaVersion: decoding.readBigInt64(decoder),
      } satisfies AnnouncePresence;
    case tags.Changes:
      return {
        _tag: tags.Changes,
        sender: decoding.readUint8Array(decoder, 16),
        since: [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
        changes: readChanges(decoder),
      } satisfies Changes;
    case tags.RejectChanges:
      return {
        _tag: tags.RejectChanges,
        whose: decoding.readUint8Array(decoder, 16),
        since: [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
      } satisfies RejectChanges;
    case tags.StartStreaming:
      return {
        _tag: tags.StartStreaming,
        since: [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
        excludeSites: Array.from({ length: decoding.readVarUint(decoder) }).map(
          (_) => {
            return decoding.readUint8Array(decoder, 16);
          }
        ),
        localOnly: decoding.readUint8(decoder) == 1 ? true : false,
      } satisfies StartStreaming;
    case tags.ForwardedAnnouncePresence:
      return {
        _tag: tags.ForwardedAnnouncePresence,
        sender: decoding.readUint8Array(decoder, 16),
        lastSeens: Array.from({ length: decoding.readVarUint(decoder) }).map(
          (_) => {
            return [
              decoding.readUint8Array(decoder, 16),
              [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
            ];
          }
        ),
        schemaName: decoding.readVarString(decoder),
        schemaVersion: decoding.readBigInt64(decoder),
        room: decoding.readVarString(decoder),
      } satisfies ForwardedAnnouncePresence;
    case tags.ForwardedChanges:
      return {
        _tag: tags.ForwardedChanges,
        sender: decoding.readUint8Array(decoder, 16),
        since: [decoding.readBigInt64(decoder), decoding.readVarInt(decoder)],
        changes: readChanges(decoder),
        room: decoding.readVarString(decoder),
        newLastSeen: [
          decoding.readBigInt64(decoder),
          decoding.readVarInt(decoder),
        ],
      } satisfies ForwardedChanges;
    default:
      tag as never;
  }

  throw new Error(`Unexpected tag: ${tag}`);
}

function readChanges(decoder: decoding.Decoder) {
  return Array.from({ length: decoding.readVarUint(decoder) }, () => [
    decoding.readVarString(decoder),
    decoding.readVarUint8Array(decoder),
    decoding.readVarString(decoder),
    (() => {
      const type = decoding.readUint8(decoder);
      switch (type) {
        case NULL:
          return null;
        case BIGINT:
          return decoding.readBigInt64(decoder);
        case NUMBER:
          return decoding.readFloat64(decoder);
        case STRING:
          return decoding.readVarString(decoder);
        case BOOL:
          return decoding.readUint8(decoder) === 1 ? true : false;
        case BLOB:
          return decoding.readVarUint8Array(decoder);
      }
      throw new Error(`Unknown type ${type}`);
    })(),
    decoding.readBigInt64(decoder),
    decoding.readBigInt64(decoder),
    (() => {
      const type = decoding.readUint8(decoder);
      if (type == NULL) {
        return null;
      } else {
        return decoding.readUint8Array(decoder, 16);
      }
    })(),
    decoding.readBigInt64(decoder),
  ]) satisfies Change[];
}
