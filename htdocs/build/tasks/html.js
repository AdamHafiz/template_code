'use strict';

const path = require('node:path');
const fs = require('node:fs');
const gulp = require('gulp');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const beautify = require('gulp-html-beautify');
const through = require('through2');

const config = require('../config');
const { onError } = require('../util/error');

/**
 * site.json は毎回読み直す。
 * require のキャッシュに載せてしまうと、watch 中に JSON を直しても反映されない。
 */
function loadSite() {
  const file = path.join(config.root, config.siteConfig);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * ページごとの相対パスを自動で求める。
 * 例) about/index.ejs -> '../'  /  index.ejs -> './'
 * 各ページで relative_path を手書きしていた頃の書き間違いを無くすための処理。
 */
function toRelativePath(relativeEjsPath) {
  const depth = relativeEjsPath.split(path.sep).length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

/** index.ejs -> 'index'、about/index.ejs -> 'about/index' */
function toPageId(relativeEjsPath) {
  return relativeEjsPath
    .split(path.sep)
    .join('/')
    .replace(/\.ejs$/, '');
}

/** ページ ID から公開 URL を作る。index は省略する。 */
function toPageUrl(pageId) {
  return pageId === 'index' ? '' : pageId.replace(/(^|\/)index$/, '$1');
}

/** キャッシュバスター。CSS / JS の URL に ?v= を付けて古い配信物を掴ませない。 */
const assetVersion = Date.now().toString(36);

function renderEjs() {
  const site = loadSite();

  return gulp
    .src(config.src.ejs, { base: 'src/ejs' })
    .pipe(plumber({ errorHandler: onError('html') }))
    .pipe(
      through.obj(function (file, enc, cb) {
        const relativeEjsPath = path.relative(
          path.join(config.root, 'src/ejs'),
          file.path
        );
        const pageId = toPageId(relativeEjsPath);
        const page = site.pages[pageId];

        if (!page) {
          // 落とさずに警告のみ。ページ追加直後でも watch を止めない。
          console.warn(
            `[html] site.json に "${pageId}" の定義がありません。既定値で出力します。`
          );
        }

        // EJS から参照できる値をここで一括で渡す
        file.data = {
          site: site.site,
          lang: page?.lang ?? site.lang,
          page: { id: pageId, url: toPageUrl(pageId), ...(page ?? {}) },
          relative_path: toRelativePath(relativeEjsPath),
          isRelease: config.isRelease,
          assetVersion,
          /** キャッシュバスター付きの asset URL を返すヘルパー */
          asset(relative_path, file) {
            return `${relative_path}${file}?v=${assetVersion}`;
          },
        };
        cb(null, file);
      })
    )
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(config.html.beautify ? beautify(config.html.beautifyOptions) : through.obj())
    .pipe(gulp.dest(config.dir.dest));
}

module.exports = { renderEjs, loadSite };
