# @vlcn.io/crsqlite-allinone

## 0.15.2

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.3

## 0.15.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.1

## 0.15.0

### Minor Changes

- e4a0a42: v0.16.0-next

### Patch Changes

- d485812: prepare `tables_used` query, correctly unzip native library from pre-builds
- 6f0ccac: fix error where separate connections would not report the correct db version
- Updated dependencies [d485812]
- Updated dependencies [e4a0a42]
- Updated dependencies [6f0ccac]
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/xplat-api@0.15.0

## 0.15.0-next.2

### Patch Changes

- fix error where separate connections would not report the correct db version
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.2
  - @vlcn.io/xplat-api@0.15.0-next.2

## 0.15.0-next.1

### Patch Changes

- prepare `tables_used` query, correctly unzip native library from pre-builds
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.1
  - @vlcn.io/xplat-api@0.15.0-next.1

## 0.15.0-next.0

### Minor Changes

- v0.16.0-next

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.0
  - @vlcn.io/xplat-api@0.15.0-next.0

## 0.14.2

### Patch Changes

- Updated dependencies [c113d8c]
  - @vlcn.io/crsqlite@0.15.1

## 0.14.2-next.0

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.1-next.0

## 0.14.1

### Patch Changes

- deploy correct build
- Updated dependencies
  - @vlcn.io/xplat-api@0.14.1

## 0.14.0

### Minor Changes

- 56df096: re-insertion, api naming consistencies, metadata size reduction, websocket server, websocket client, websocket demo

### Patch Changes

- 08f13fb: react strict mode fiex, migrator fixes, typed-sql basic support, ws replication, db provider hooks
- 8c8cb7e: pass worker instance thru
- f327068: rebuild
- Updated dependencies [56df096]
- Updated dependencies [4022bd6]
- Updated dependencies [08f13fb]
- Updated dependencies [8c8cb7e]
- Updated dependencies [f327068]
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/xplat-api@0.14.0

## 0.14.0-next.4

### Patch Changes

- pass worker instance thru
- Updated dependencies
  - @vlcn.io/xplat-api@0.14.0-next.3

## 0.14.0-next.3

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.2

## 0.14.0-next.2

### Patch Changes

- react strict mode fiex, migrator fixes, typed-sql basic support, ws replication, db provider hooks
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/xplat-api@0.14.0-next.2

## 0.14.0-next.1

### Patch Changes

- rebuild
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/xplat-api@0.14.0-next.1

## 0.14.0-next.0

### Minor Changes

- re-insertion, api naming consistencies, metadata size reduction, websocket server, websocket client, websocket demo

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.0
  - @vlcn.io/xplat-api@0.14.0-next.0

## 0.13.0

### Minor Changes

- 68deb1c: binary encoded primary keys, no string encoding on values, cache prepared statements on merge, fix webkit JIT crash

### Patch Changes

- Updated dependencies [68deb1c]
  - @vlcn.io/crsqlite@0.14.0
  - @vlcn.io/xplat-api@0.13.0

## 0.13.0-next.0

### Minor Changes

- binary encoded primary keys, no string encoding on values, cache prepared statements on merge, fix webkit JIT crash

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.14.0-next.0
  - @vlcn.io/xplat-api@0.13.0-next.0

## 0.12.0

### Minor Changes

- 62912ad: split up large transactions, compact out unneeded delete records, coordinate dedicated workers for android, null merge fix

### Patch Changes

- Updated dependencies [62912ad]
  - @vlcn.io/crsqlite@0.13.0
  - @vlcn.io/xplat-api@0.12.0

## 0.12.0-next.0

### Minor Changes

- split up large transactions, compact out unneeded delete records, coordinate dedicated workers for android, null merge fix

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.13.0-next.0
  - @vlcn.io/xplat-api@0.12.0-next.0

## 0.11.0

### Minor Changes

- 7885afd: 50x perf boost when pulling changesets

### Patch Changes

- Updated dependencies [7885afd]
  - @vlcn.io/crsqlite@0.12.0
  - @vlcn.io/xplat-api@0.11.0

## 0.11.0-next.0

### Minor Changes

- 15c8e04: 50x perf boost when pulling changesets

### Patch Changes

- Updated dependencies [15c8e04]
  - @vlcn.io/crsqlite@0.12.0-next.0
  - @vlcn.io/xplat-api@0.11.0-next.0

## 0.10.0

### Minor Changes

- automigrate fixes for WASM, react fixes for referential equality, direct-connect networking implementations, sync in shared worker, dbProvider hooks for React

### Patch Changes

- Updated dependencies
- Updated dependencies [4e737a0]
  - @vlcn.io/crsqlite@0.11.0
  - @vlcn.io/xplat-api@0.10.0

## 0.9.2-next.0

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.10.2-next.0

## 0.9.1

### Patch Changes

- fts5, sqlite 3.42.1, direct-connect packages
- Updated dependencies
  - @vlcn.io/crsqlite@0.10.1
  - @vlcn.io/xplat-api@0.9.1

## 0.9.0

### Minor Changes

- e0de95c: ANSI SQL compliance for crsql_changes, all filters available for crsql_changes, removal of tracked_peers, simplified crsql_master table

### Patch Changes

- 9b483aa: npm is not updating on package publish -- bump versions to try to force it
- Updated dependencies [9b483aa]
- Updated dependencies [e0de95c]
  - @vlcn.io/xplat-api@0.9.0
  - @vlcn.io/crsqlite@0.10.0

## 0.9.0-next.1

### Patch Changes

- npm is not updating on package publish -- bump versions to try to force it
- Updated dependencies
  - @vlcn.io/xplat-api@0.9.0-next.1
  - @vlcn.io/crsqlite@0.10.0-next.1

## 0.9.0-next.0

### Minor Changes

- ANSI SQL compliance for crsql_changes, all filters available for crsql_changes, removal of tracked_peers, simplified crsql_master table

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.10.0-next.0
  - @vlcn.io/xplat-api@0.9.0-next.0

## 0.8.3

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.9.3

## 0.8.2

### Patch Changes

- e5919ae: fix xcommit deadlock, bump versions on dependencies
- Updated dependencies [e5919ae]
  - @vlcn.io/crsqlite@0.9.2
  - @vlcn.io/xplat-api@0.8.2

## 0.8.2-next.0

### Patch Changes

- fix xcommit deadlock, bump versions on dependencies
- Updated dependencies
  - @vlcn.io/crsqlite@0.9.2-next.0
  - @vlcn.io/xplat-api@0.8.2-next.0

## 0.8.1

### Patch Changes

- aad733d: --
- Updated dependencies [419ee8f]
- Updated dependencies [aad733d]
  - @vlcn.io/crsqlite@0.9.1
  - @vlcn.io/xplat-api@0.8.1

## 0.8.1-next.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.9.1-next.1

## 0.8.1-next.0

### Patch Changes

---

- Updated dependencies
  - @vlcn.io/crsqlite@0.9.1-next.0
  - @vlcn.io/xplat-api@0.8.1-next.0

## 0.8.0

### Minor Changes

- 14c9f4e: useQuery perf updates, primary key only table fixes, sync in a background worker

### Patch Changes

- Updated dependencies [14c9f4e]
  - @vlcn.io/crsqlite@0.9.0
  - @vlcn.io/xplat-api@0.8.0

## 0.8.0-next.0

### Minor Changes

- useQuery perf updates, primary key only table fixes, sync in a background worker

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.9.0-next.0
  - @vlcn.io/xplat-api@0.8.0-next.0

## 0.7.0

### Minor Changes

- 6316ec315: update to support prebuild binaries, include primary key only table fixes

### Patch Changes

- Updated dependencies [6316ec315]
- Updated dependencies [b7e0b21df]
- Updated dependencies [606060dbe]
  - @vlcn.io/crsqlite@0.8.0
  - @vlcn.io/xplat-api@0.7.0

## 0.7.0-next.2

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.8.0-next.2

## 0.7.0-next.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.8.0-next.1

## 0.7.0-next.0

### Minor Changes

- update to support prebuild binaries, include primary key only table fixes

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.8.0-next.0
  - @vlcn.io/xplat-api@0.7.0-next.0

## 0.6.2

### Patch Changes

- 3d09cd595: preview all the hook improvements and multi db open fixes
- 567d8acba: auto-release prepared statements
- 54666261b: fractional indexing inclusion
- fractional indexing, better react hooks, many dbs opened concurrently
- Updated dependencies [3d09cd595]
- Updated dependencies [567d8acba]
- Updated dependencies [54666261b]
- Updated dependencies
- Updated dependencies [fd9094220]
  - @vlcn.io/crsqlite@0.7.2
  - @vlcn.io/xplat-api@0.6.2

## 0.6.2-next.3

### Patch Changes

- preview all the hook improvements and multi db open fixes
- Updated dependencies
  - @vlcn.io/crsqlite@0.7.2-next.3
  - @vlcn.io/xplat-api@0.6.2-next.2

## 0.6.2-next.2

### Patch Changes

- auto-release prepared statements
- Updated dependencies
  - @vlcn.io/crsqlite@0.7.2-next.2
  - @vlcn.io/xplat-api@0.6.2-next.1

## 0.6.2-next.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.7.2-next.1

## 0.6.2-next.0

### Patch Changes

- fractional indexing inclusion
- Updated dependencies
  - @vlcn.io/crsqlite@0.7.2-next.0
  - @vlcn.io/xplat-api@0.6.2-next.0

## 0.6.1

### Patch Changes

- 519bcfc2a: hooks, fixes to support examples, auto-determine tables queried
- hooks package, used_tables query, web only target for wa-sqlite
- Updated dependencies [519bcfc2a]
- Updated dependencies
  - @vlcn.io/crsqlite@0.7.1
  - @vlcn.io/xplat-api@0.6.1

## 0.6.1-next.0

### Patch Changes

- hooks, fixes to support examples, auto-determine tables queried
- Updated dependencies
  - @vlcn.io/crsqlite@0.7.1-next.0
  - @vlcn.io/xplat-api@0.6.1-next.0

## 0.6.0

### Minor Changes

- seen peers, binary encoding for network layer, retry on disconnect for server, auto-track peers

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.7.0
  - @vlcn.io/xplat-api@0.6.0

## 0.5.3

### Patch Changes

- deploy table validation fix
- Updated dependencies
  - @vlcn.io/crsqlite@0.6.3
  - @vlcn.io/xplat-api@0.5.3

## 0.5.2

### Patch Changes

- cid winner selection bugfix
- Updated dependencies
  - @vlcn.io/crsqlite@0.6.2
  - @vlcn.io/xplat-api@0.5.2

## 0.5.1

### Patch Changes

- rebuild all
- Updated dependencies
  - @vlcn.io/crsqlite@0.6.1
  - @vlcn.io/xplat-api@0.5.1

## 0.5.0

### Minor Changes

- breaking change -- fix version recording problem that prevented convergence in p2p cases

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.6.0
  - @vlcn.io/xplat-api@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.5.2

## 0.4.1

### Patch Changes

- fix mem leak and cid win value selection bug
- Updated dependencies
  - @vlcn.io/xplat-api@0.4.1
  - @vlcn.io/crsqlite@0.5.1

## 0.4.0

### Minor Changes

- fix tie breaking for merge, add example client-server sync

### Patch Changes

- Updated dependencies
  - @vlcn.io/xplat-api@0.4.0
  - @vlcn.io/crsqlite@0.5.0

## 0.3.3

### Patch Changes

- fix bigint overflow in wasm, fix site_id not being returned with changesets
- Updated dependencies
  - @vlcn.io/xplat-api@0.3.1
  - @vlcn.io/crsqlite@0.4.2

## 0.3.2

### Patch Changes

- bump better-sqlite3 version

## 0.3.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.4.1

## 0.3.0

### Minor Changes

- fix multi-way merge

### Patch Changes

- Updated dependencies
  - @vlcn.io/xplat-api@0.3.0
  - @vlcn.io/crsqlite@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.3.0

## 0.2.0

### Minor Changes

- update to use `wa-sqlite`, fix site id forwarding, fix scientific notation replication, etc.

### Patch Changes

- Updated dependencies
  - @vlcn.io/xplat-api@0.2.0
  - @vlcn.io/crsqlite@0.2.0

## 0.1.5

### Patch Changes

- fix linking issues on linux distros
- Updated dependencies
  - @vlcn.io/xplat-api@0.1.5
  - @vlcn.io/crsqlite@0.1.8

## 0.1.4

### Patch Changes

- fixes site id not being passed during replication
- Updated dependencies
  - @vlcn.io/xplat-api@0.1.4
  - @vlcn.io/crsqlite@0.1.7

## 0.1.3

### Patch Changes

- fix statement preparation error in cases where there are multiple concurrent db connections
- Updated dependencies
  - @vlcn.io/xplat-api@0.1.3

## 0.1.2

### Patch Changes

- update sqlite binaries
- Updated dependencies
  - @vlcn.io/xplat-api@0.1.2

## 0.1.1

### Patch Changes

- remove `link:../` references so we actually correctly resolve packages
- Updated dependencies
  - @vlcn.io/xplat-api@0.1.1

## 0.1.0

### Minor Changes

- first release that works end to end

### Patch Changes

- Updated dependencies
  - @vlcn.io/xplat-api@0.1.0
