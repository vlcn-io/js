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
)
