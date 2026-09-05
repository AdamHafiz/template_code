'use strict';

const notifier = require('node-notifier');
const config = require('../config');

/**
 * plumber 用のエラーハンドラ。
 * dev では watch を止めずにデスクトップ通知＋ログ、release では即座に失敗させる。
 */
function onError(taskName) {
  return function (err) {
    const message = err.messageFormatted || err.message || String(err);

    console.error(`\n[${taskName}] ${message}\n`);

    if (config.isRelease) {
      // 壊れたものをそのまま納品しないよう、本番ビルドは落とす
      process.exitCode = 1;
      throw err;
    }

    try {
      notifier.notify({
        title: `gulp ${taskName} error`,
        message: message.slice(0, 200),
      });
    } catch {
      // 通知が使えない環境でもビルドは続ける
    }

    this.emit('end');
  };
}

module.exports = { onError };
