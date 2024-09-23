#!/usr/bin/env bash
rm -rf ./dist
mkdir -p ./dist/better-refassist
./node_modules/typescript/bin/tsc -p ./src/js/tsconfig.json
cp -rf ./popup.html ./manifest.json ./build ./assets ./dist/better-refassist
cd ./dist || exit
/usr/bin/zip better-refassist.zip -r ./*