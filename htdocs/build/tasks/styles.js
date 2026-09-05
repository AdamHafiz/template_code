'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const dartSass = require('sass');
const gulpSass = require('gulp-sass')(dartSass);
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const config = require('../config');
const { onError } = require('../util/error');

/**
 * Sass -> PostCSS。
 * ベンダープレフィックスは package.json の browserslist が基準。
 * （以前は pleeease.json に対象ブラウザが書かれていたが、どのタスクからも
 *   読まれておらず prefix が一切付いていなかった）
 */
function styles() {
  const plugins = [autoprefixer()];

  if (config.isRelease) {
    plugins.push(
      cssnano({
        preset: ['default', { discardComments: { removeAllButFirst: true } }],
      })
    );
  }

  return gulp
    .src(config.src.sass, { sourcemaps: !config.isRelease })
    .pipe(plumber({ errorHandler: onError('styles') }))
    .pipe(
      gulpSass.sync({
        // node_modules をルート扱いにすると @use 'swiper/swiper.css' のように書ける
        loadPaths: ['node_modules'],
      })
    )
    .pipe(postcss(plugins))
    .pipe(
      gulp.dest(`${config.dir.dest}/${config.out.css}`, {
        sourcemaps: config.isRelease ? false : '.',
      })
    );
}

module.exports = { styles };
