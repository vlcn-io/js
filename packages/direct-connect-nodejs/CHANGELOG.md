# @vlcn.io/direct-connect-nodejs

## 0.7.2

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.3

## 0.7.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.1

## 0.7.0

### Minor Changes

- e4a0a42: v0.16.0-next

### Patch Changes

- d485812: prepare `tables_used` query, correctly unzip native library from pre-builds
- 5accbfb: expose a method to get access to the db from the server
- 6f0ccac: fix error where separate connections would not report the correct db version
- Updated dependencies [d485812]
- Updated dependencies [e4a0a42]
- Updated dependencies [6f0ccac]
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/direct-connect-common@0.7.0
  - @vlcn.io/xplat-api@0.15.0

## 0.7.0-next.3

### Patch Changes

- expose a method to get access to the db from the server

## 0.7.0-next.2

### Patch Changes

- fix error where separate connections would not report the correct db version
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.2
  - @vlcn.io/direct-connect-common@0.7.0-next.2
  - @vlcn.io/xplat-api@0.15.0-next.2

## 0.7.0-next.1

### Patch Changes

- prepare `tables_used` query, correctly unzip native library from pre-builds
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.1
  - @vlcn.io/direct-connect-common@0.7.0-next.1
  - @vlcn.io/xplat-api@0.15.0-next.1

## 0.7.0-next.0

### Minor Changes

- v0.16.0-next

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.0
  - @vlcn.io/direct-connect-common@0.7.0-next.0
  - @vlcn.io/xplat-api@0.15.0-next.0

## 0.6.2

### Patch Changes

- Updated dependencies [c113d8c]
  - @vlcn.io/crsqlite@0.15.1

## 0.6.2-next.0

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.1-next.0

## 0.6.1

### Patch Changes

- deploy correct build
- Updated dependencies
  - @vlcn.io/direct-connect-common@0.6.1
  - @vlcn.io/xplat-api@0.14.1

## 0.6.0

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
  - @vlcn.io/direct-connect-common@0.6.0
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/xplat-api@0.14.0

## 0.6.0-next.4

### Patch Changes

- pass worker instance thru
- Updated dependencies
  - @vlcn.io/xplat-api@0.14.0-next.3

## 0.6.0-next.3

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.2

## 0.6.0-next.2

### Patch Changes

- react strict mode fiex, migrator fixes, typed-sql basic support, ws replication, db provider hooks
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/direct-connect-common@0.6.0-next.2
  - @vlcn.io/xplat-api@0.14.0-next.2

## 0.6.0-next.1

### Patch Changes

- rebuild
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/direct-connect-common@0.6.0-next.1
  - @vlcn.io/xplat-api@0.14.0-next.1

## 0.6.0-next.0

### Minor Changes

- re-insertion, api naming consistencies, metadata size reduction, websocket server, websocket client, websocket demo

### Patch Changes

- Updated dependencies
  - @vlcn.io/direct-connect-common@0.6.0-next.0
  - @vlcn.io/crsqlite@0.15.0-next.0
  - @vlcn.io/xplat-api@0.14.0-next.0

## 0.5.0

### Minor Changes

- 68deb1c: binary encoded primary keys, no string encoding on values, cache prepared statements on merge, fix webkit JIT crash

### Patch Changes

- f967e50: fix path resolution for windows
- c3a4641: us os.path
- d574e50: touch workaround for windows
- Updated dependencies [4f916e2]
- Updated dependencies [68deb1c]
  - @vlcn.io/direct-connect-common@0.5.0
  - @vlcn.io/crsqlite@0.14.0
  - @vlcn.io/xplat-api@0.13.0

## 0.5.0-next.4

### Patch Changes

- us os.path

## 0.5.0-next.3

### Patch Changes

- touch workaround for windows

## 0.5.0-next.2

### Patch Changes

- fix path resolution for windows

## 0.5.0-next.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/direct-connect-common@0.5.0-next.1

## 0.5.0-next.0

### Minor Changes

- binary encoded primary keys, no string encoding on values, cache prepared statements on merge, fix webkit JIT crash

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.14.0-next.0
  - @vlcn.io/direct-connect-common@0.5.0-next.0
  - @vlcn.io/xplat-api@0.13.0-next.0

## 0.4.0

### Minor Changes

- 62912ad: split up large transactions, compact out unneeded delete records, coordinate dedicated workers for android, null merge fix

### Patch Changes

- Updated dependencies [62912ad]
  - @vlcn.io/crsqlite@0.13.0
  - @vlcn.io/direct-connect-common@0.4.0
  - @vlcn.io/xplat-api@0.12.0

## 0.4.0-next.0

### Minor Changes

- split up large transactions, compact out unneeded delete records, coordinate dedicated workers for android, null merge fix

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.13.0-next.0
  - @vlcn.io/direct-connect-common@0.4.0-next.0
  - @vlcn.io/xplat-api@0.12.0-next.0

## 0.3.0

### Minor Changes

- 7885afd: 50x perf boost when pulling changesets

### Patch Changes

- Updated dependencies [7885afd]
  - @vlcn.io/crsqlite@0.12.0
  - @vlcn.io/direct-connect-common@0.3.0
  - @vlcn.io/xplat-api@0.11.0

## 0.3.0-next.0

### Minor Changes

- 15c8e04: 50x perf boost when pulling changesets

### Patch Changes

- Updated dependencies [15c8e04]
  - @vlcn.io/crsqlite@0.12.0-next.0
  - @vlcn.io/direct-connect-common@0.3.0-next.0
  - @vlcn.io/xplat-api@0.11.0-next.0

## 0.2.0

### Minor Changes

- automigrate fixes for WASM, react fixes for referential equality, direct-connect networking implementations, sync in shared worker, dbProvider hooks for React

### Patch Changes

- Updated dependencies
- Updated dependencies [4e737a0]
  - @vlcn.io/crsqlite@0.11.0
  - @vlcn.io/direct-connect-common@0.2.0
  - @vlcn.io/xplat-api@0.10.0

## 0.1.2-next.0

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.10.2-next.0

## 0.1.1

### Patch Changes

- fts5, sqlite 3.42.1, direct-connect packages
- Updated dependencies
  - @vlcn.io/crsqlite@0.10.1
  - @vlcn.io/direct-connect-common@0.1.1
  - @vlcn.io/xplat-api@0.9.1
