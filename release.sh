#!/usr/bin/env bash
rm -rf ./dist
mkdir -p ./dist/better-refassist
npm run build
cp -rf ./popup.html ./manifest.json ./build ./assets ./dist/better-refassist
zip -r ./dist/better-refassist.zip ./dist/better-refassist/*