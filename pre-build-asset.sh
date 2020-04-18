#! /bin/bash

set -x

rm -rf dist
mkdir -p dist/bin
mkdir -p dist/image
mkdir -p dist/style
mkdir -p dist/utils

cp src/bin/* dist/bin/
cp src/image/* dist/image/
cp src/style/* dist/style/
cp src/*.html dist/
cp src/utils/*.xsl dist/utils/
cp src/utils/*.html dist/utils/
