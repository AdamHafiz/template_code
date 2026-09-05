'use strict';

const browserSync = require('browser-sync').create();
const config = require('../config');

function serve(done) {
  browserSync.init({
    server: { baseDir: config.dir.develop },
    startPath: config.server.startPath,
    ghostMode: config.server.ghostMode,
    notify: config.server.notify,
    open: config.server.open,
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

/**
 * CSS 差し替え用のストリーム。
 * 単体のタスクではなく、styles のストリームに .pipe() でつないで使います。
 * （単体で呼ぶと何も流れてこないストリームになり、タスクが終わりません）
 */
function stream() {
  return browserSync.stream();
}

module.exports = { serve, reload, stream };
