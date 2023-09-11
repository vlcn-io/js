# @vlcn.io/ws-litefs

Alpha quality websocket support on LiteFS.

If you're not do a streaming sync and syncing over `REST` you can simply use the LiteFS proxy: https://fly.io/docs/litefs/proxy/

WebSocket sync requires us to:
1. Do our own forwarding of writes
2. Handle getting change notifications to replicas

This package accomplishes that although it currently does not handle the case where the primary fails over. This will be fixed up in `LiteFSWriteService` in the near future.