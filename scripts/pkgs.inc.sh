declare -a pkgs=(
  "@vlcn.io/create"
  "@vlcn.io/crsqlite-wasm"
  "@vlcn.io/crsqlite-allinone"
  "@vlcn.io/sync-p2p"
  "@vlcn.io/react"
  "@vlcn.io/direct-connect-browser"
  "@vlcn.io/direct-connect-common"
  "@vlcn.io/direct-connect-nodejs"
  "@vlcn.io/rx-tbl"
  "@vlcn.io/xplat-api"
  "@vlcn.io/wa-sqlite"
  "@vlcn.io/ws-common"
  "@vlcn.io/ws-server"
  "@vlcn.io/ws-client"
  "@vlcn.io/ws-browserdb"
  "@vlcn.io/typed-sql"
  "@vlcn.io/typed-sql-cli"
)

# two packages have directory names mismatched with package names hence this array.
declare -a pkgslocal=(
  "@vlcn.io/create:../vulcan/js/packages/create"
  "@vlcn.io/crsqlite-wasm:../vulcan/js/packages/crsqlite-wasm"
  "@vlcn.io/crsqlite-allinone:../vulcan/js/packages/node-allinone"
  "@vlcn.io/sync-p2p:../vulcan/js/packages/p2p"
  "@vlcn.io/react:../vulcan/js/packages/react"
  "@vlcn.io/direct-connect-browser:../vulcan/js/packages/direct-connect-browser"
  "@vlcn.io/direct-connect-common:../vulcan/js/packages/direct-connect-common"
  "@vlcn.io/direct-connect-nodejs:../vulcan/js/packages/direct-connect-nodejs"
  "@vlcn.io/rx-tbl:../vulcan/js/packages/rx-tbl"
  "@vlcn.io/xplat-api:../vulcan/js/packages/xplat-api"
  "@vlcn.io/wa-sqlite:../vulcan/js/packages/wa-sqlite"
  "@vlcn.io/ws-common:../vulcan/js/packages/ws-common"
  "@vlcn.io/ws-server:../vulcan/js/packages/ws-server"
  "@vlcn.io/ws-client:../vulcan/js/packages/ws-client"
  "@vlcn.io/ws-browserdb:../vulcan/js/packages/ws-browserdb"
  "@vlcn.io/typed-sql:../vulcan/typed-sql/packages/typed-sql"
  "@vlcn.io/typed-sql-cli:../vulcan/typed-sql/packages/cli"
)