#! /bin/bash

# cargo clean in core/rs/bundle

mkdir -p packages/crsqlite-wasm/dist
cd deps/emsdk
./emsdk install 3.1.45
./emsdk activate 3.1.45
source ./emsdk_env.sh
cd ../wa-sqlite
make debug
cp debug/crsqlite.wasm ../../packages/crsqlite-wasm/dist/crsqlite.wasm
cp debug/crsqlite.mjs ../../packages/crsqlite-wasm/src/crsqlite.mjs
