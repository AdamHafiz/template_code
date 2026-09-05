'use strict';

/**
 * タスクの中身は build/tasks/ に分けてあります。
 * このファイルは「どのタスクをどの順で流すか」だけを持ちます。
 *
 *   npm run dev     開発サーバー + 監視
 *   npm run build   release/ に本番用を書き出し
 */

const gulp = require('gulp');

const config = require('./build/config');
const { renderEjs } = require('./build/tasks/html');
const { styles } = require('./build/tasks/styles');
const { scripts } = require('./build/tasks/scripts');
const { optimizeImages, copyStatic } = require('./build/tasks/images');
const { serve, reload, stream } = require('./build/tasks/serve');
const { removeDir, cleanExcept } = require('./build/util/fs');

/* ------------------------------------------------------------------ *
 * clean
 * ------------------------------------------------------------------ */

/** develop は assets を残して HTML だけ作り直す（画像の再最適化を毎回走らせない） */
const cleanDevelop = () =>
  cleanExcept(config.dir.develop, ['assets', 'sitemap.xml', '.htaccess']);

const cleanRelease = () => removeDir(config.dir.release);

/* ------------------------------------------------------------------ *
 * 部品
 * ------------------------------------------------------------------ */

const html = gulp.series(cleanDevelop, renderEjs);

/**
 * CSS はページをリロードせずに差し替える（スクロール位置や開閉状態が保てる）。
 * styles() が返すストリームをそのまま browser-sync に流し込むのが要点。
 */
function stylesDev() {
  return styles().pipe(stream());
}

/* ------------------------------------------------------------------ *
 * watch
 * ------------------------------------------------------------------ */

function watch(done) {
  gulp.watch(config.src.ejsWatch, gulp.series(html, reload));
  gulp.watch(config.src.sassWatch, stylesDev);
  gulp.watch(config.src.jsWatch, gulp.series(scripts, reload));
  gulp.watch(config.src.images, gulp.series(optimizeImages, reload));
  gulp.watch(config.siteConfig, gulp.series(html, reload));
  done();
}

/* ------------------------------------------------------------------ *
 * 公開タスク
 * ------------------------------------------------------------------ */

const build = gulp.series(
  config.isRelease ? cleanRelease : cleanDevelop,
  gulp.parallel(renderEjs, styles, scripts, optimizeImages, copyStatic)
);

/** 明示的な clean は develop / release を丸ごと消す（assets も残さない） */
const wipeDevelop = () => removeDir(config.dir.develop);
wipeDevelop.displayName = 'wipeDevelop';

exports.clean = gulp.parallel(wipeDevelop, cleanRelease);
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = optimizeImages;
exports.build = build;

exports.dev = gulp.series(build, serve, watch);

// 旧テンプレートからの移行用エイリアス（gulp d / gulp r をそのまま使えるように）
exports.d = exports.dev;
exports.r = build;

exports.default = exports.dev;
