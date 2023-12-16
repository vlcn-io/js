# @vlcn.io/ws-server

## 0.2.1

### Patch Changes

- update better-sqlite3

## 0.2.0

### Minor Changes

- e4a0a42: v0.16.0-next

### Patch Changes

- d485812: prepare `tables_used` query, correctly unzip native library from pre-builds
- 5accbfb: expose a method to get access to the db from the server
- 6f0ccac: fix error where separate connections would not report the correct db version
- 9af8a3d: emulate useEffect via useState to get rid of UI tearing and flickering -- https://twitter.com/tantaman/status/1732140032729985512
- Updated dependencies [d485812]
- Updated dependencies [e4a0a42]
- Updated dependencies [6f0ccac]
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/logger-provider@0.2.0
  - @vlcn.io/ws-common@0.2.0

## 0.2.0-next.4

### Patch Changes

- emulate useEffect via useState to get rid of UI tearing and flickering -- https://twitter.com/tantaman/status/1732140032729985512

## 0.2.0-next.3

### Patch Changes

- expose a method to get access to the db from the server

## 0.2.0-next.2

### Patch Changes

- fix error where separate connections would not report the correct db version
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.2
  - @vlcn.io/logger-provider@0.2.0-next.2
  - @vlcn.io/ws-common@0.2.0-next.2

## 0.2.0-next.1

### Patch Changes

- prepare `tables_used` query, correctly unzip native library from pre-builds
- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.1
  - @vlcn.io/logger-provider@0.2.0-next.1
  - @vlcn.io/ws-common@0.2.0-next.1

## 0.2.0-next.0

### Minor Changes

- v0.16.0-next

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.16.0-next.0
  - @vlcn.io/logger-provider@0.2.0-next.0
  - @vlcn.io/ws-common@0.2.0-next.0

## 0.1.2

### Patch Changes

- 83adae8: adds seq column in network layer, coerces values to correct types in serializer
- Updated dependencies [83adae8]
- Updated dependencies [c113d8c]
  - @vlcn.io/ws-common@0.1.2
  - @vlcn.io/crsqlite@0.15.1

## 0.1.2-next.1

### Patch Changes

- Updated dependencies
  - @vlcn.io/crsqlite@0.15.1-next.0

## 0.1.2-next.0

### Patch Changes

- adds seq column in network layer, coerces values to correct types in serializer
- Updated dependencies
  - @vlcn.io/ws-common@0.1.2-next.0

## 0.1.1

### Patch Changes

- deploy correct build
- Updated dependencies
  - @vlcn.io/logger-provider@0.1.2
  - @vlcn.io/ws-common@0.1.1

## 0.1.0

### Minor Changes

- 56df096: re-insertion, api naming consistencies, metadata size reduction, websocket server, websocket client, websocket demo

### Patch Changes

- 323b498: construct the internal hostnames correctly
- 4022bd6: litefs support
- 87aa29a: custom polling for litefs -- https://community.fly.io/t/litefs-filesystem-notifications/15244
- b3f0b2d: add logging to debug litefs
- 08f13fb: react strict mode fiex, migrator fixes, typed-sql basic support, ws replication, db provider hooks
- 8c8cb7e: pass worker instance thru
- 7cbb842: allow users to configure polling
- c2eb7d4: litefs watch patterns
- f327068: rebuild
- Updated dependencies [56df096]
- Updated dependencies [4022bd6]
- Updated dependencies [b3f0b2d]
- Updated dependencies [08f13fb]
- Updated dependencies [8c8cb7e]
- Updated dependencies [f327068]
  - @vlcn.io/ws-common@0.1.0
  - @vlcn.io/crsqlite@0.16.0
  - @vlcn.io/logger-provider@0.1.1

## 0.1.0-next.21

### Patch Changes

- custom polling for litefs -- https://community.fly.io/t/litefs-filesystem-notifications/15244

## 0.1.0-next.20

### Patch Changes

- allow users to configure polling

## 0.1.0-next.19

### Patch Changes

- add logging to debug litefs
- Updated dependencies
  - @vlcn.io/logger-provider@0.1.1-next.0

## 0.1.0-next.18

### Patch Changes

- litefs watch patterns

## 0.1.0-next.17

### Patch Changes

- construct the internal hostnames correctly

## 0.1.0-next.16

### Patch Changes

- pass worker instance thru
- Updated dependencies
  - @vlcn.io/ws-common@0.1.0-next.4

## 0.1.0-next.15

### Patch Changes

- litefs support
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.2
  - @vlcn.io/ws-common@0.1.0-next.3

## 0.1.0-next.14

### Patch Changes

- react strict mode fiex, migrator fixes, typed-sql basic support, ws replication, db provider hooks
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/ws-common@0.1.0-next.2

## 0.1.0-next.13

### Patch Changes

- rebuild
- Updated dependencies
  - @vlcn.io/crsqlite@0.15.0-next.1
  - @vlcn.io/ws-common@0.1.0-next.1

## 0.1.0-next.0

### Minor Changes

- re-insertion, api naming consistencies, metadata size reduction, websocket server, websocket client, websocket demo

### Patch Changes

- Updated dependencies
  - @vlcn.io/ws-common@0.1.0-next.0
  - @vlcn.io/crsqlite@0.15.0-next.0
