'use strict';

const { src, dest, series } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const version = require('./package.json').version;

async function preBuildAsset() {
  await del('dist');
  return src([
    'src/bin/*',
    'src/front/dist/**/*',
    'src/utils/*.xsl',
    'src/utils/*.html',
  ], { base: 'src' }).pipe(dest('dist'));
}

const build = series(
  function() { return del('build'); },
  function() {
    return src('node_modules/electron/dist/Electron.app/**/*').pipe(dest('build/Electron.app/'));
  },
  function() {
    return src('dist/**/*').pipe(dest('build/Electron.app/Contents/Resources/app/'));
  },
  function() {
    return src('package.json').pipe(dest('build/Electron.app/Contents/Resources/app/'));
  }
);

const winBuild = series(
  function () { return del('build'); },
  function () {
    return src('node_modules/electron/dist/**/*').pipe(dest('build/app/'));
  },
  function () {
    return src('dist/**/*').pipe(dest('build/app/resources/app/'));
  },
  function () {
    return src('package.json').pipe(dest('build/app/resources/app/'));
  }
);

function toZip() {
  return src('build/**/*').pipe(zip(`weart-mac-${version}.zip`)).pipe(dest('build'));
}

function winToZip() {
  return src('build/app/**/*').pipe(zip(`weart-win-${version}.zip`)).pipe(dest('build'));
}

exports.preBuildAsset = preBuildAsset;
exports.build = build;
exports.toZip = toZip;
exports.winBuild = winBuild;
exports.winToZip = winToZip;
