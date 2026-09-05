'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const config = require('../config');
const webpackConfig = require('../webpack.config');
const { onError } = require('../util/error');

/**
 * webpack でバンドルする。
 * 以前はストリームを return せず done() を即呼んでいたため、
 * JS の書き出し完了前にブラウザがリロードされることがあった。ここでは必ず return する。
 */
function scripts() {
  return gulp
    .src(config.src.js)
    .pipe(plumber({ errorHandler: onError('scripts') }))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(`${config.dir.dest}/${config.out.js}`));
}

module.exports = { scripts };
