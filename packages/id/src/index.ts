export type Space = string;

// 32 bit random var in decimal
let randomVariable = Math.floor(Number.MAX_SAFE_INTEGER * Math.random());

// export function newId<T>(
//   deviceId: DeviceId,
//   base: "hex" | "decimal" = "hex"
// ): ID_of<T> {
//   return newIdImpl(deviceId, base, "id") as ID_of<T>;
// }

export function newIID<T>(space: Space): IID_of<T> {
  return newIdImpl(space) as IID_of<T>;
}

// Space could be something like a counter for the user in the given room.
// If there are < 65,536 users in a room an each gets their own number then
// we can generate IDs in this way and never collide. Assuming we do less than 65,536 writes per second
// as we give out ids in second sized buckets.
function newIdImpl<T>(space: Space): ID_of<T> | IID_of<T> {
  if (!isHex(space)) {
    // hexify
    space = stringToHex(space);
  }
  invariant(space.length >= 4, "Device ids must be at least 2 bytes");

  // 32 bits, hex is our time in seconds
  const hi32 = Math.floor(Date.now() / 1000).toString(16);

  // low 16 bits of device, in hex
  const partialDevice = space.substring(space.length - 4);
  // low 16 bits of the random variable, in hex
  const random = (++randomVariable & 0xffff).toString(16);

  const low32 = partialDevice + random;
  const hex = (hi32 + low32) as ID_of<T>;

  return BigInt("0x" + hex) as IID_of<T>;
}

export function asId<T>(id: string): ID_of<T> {
  return id as ID_of<T>;
}

export function asIID<T>(id: bigint): IID_of<T> {
  return id as IID_of<T>;
}

export function truncateForDisplay(id: string) {
  return id.substring(id.length - 6);
}

const hexReg = /^[0-9A-Fa-f]+$/;
function isHex(h: string) {
  return hexReg.exec(h) != null;
}

export type Opaque<BaseType, BrandType = unknown> = BaseType & {
  readonly [Symbols.base]: BaseType;
  readonly [Symbols.brand]: BrandType;
};

namespace Symbols {
  export declare const base: unique symbol;
  export declare const brand: unique symbol;
}

export type ID_of<T> = Opaque<string, T>;
export type IID_of<T> = Opaque<bigint, T>;

function invariant(b: boolean, msg: string) {
  if (!b) {
    throw new Error(msg);
  }
}

const stringToHex = (str: string) => {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);
    hex += hexValue.padStart(2, "0");
  }
  return hex;
};
