#! /bin/bash

set -x

rm -rf dist
rm -rf build
mkdir -p build
cp -rf node_modules/electron/dist/Electron.app build/
npm run pre-build
cp -rf dist build/Electron.app/Contents/Resources/
mv build/Electron.app/Contents/Resources/dist build/Electron.app/Contents/Resources/app
cp package.json build/Electron.app/Contents/Resources/app/
cd build/Electron.app/Contents/Resources/app
npm i --only=prod
