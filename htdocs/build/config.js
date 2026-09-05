'use strict';

/**
 * ビルド全体の設定。
 * パスやフラグを変えたいときは、まずこのファイルだけを見れば済むようにしています。
 */

const path = require('node:path');

const root = path.resolve(__dirname, '..');
const isRelease = process.env.NODE_ENV === 'production';

/** develop / release どちらに書き出すか */
const dest = isRelease ? 'release' : 'develop';

module.exports = {
  isRelease,
  root,

  dir: {
    src: 'src',
    develop: 'develop',
    release: 'release',
    dest,
  },

  /** 監視・コンパイル対象 */
  src: {
    ejs: ['src/ejs/**/*.ejs', '!src/ejs/**/_*.ejs', '!src/ejs/**/_*/**'],
    ejsWatch: 'src/ejs/**/*.ejs',
    sass: ['src/sass/**/*.scss', '!src/sass/**/_*.scss'],
    sassWatch: 'src/sass/**/*.scss',
    js: 'src/js/index.js',
    jsWatch: 'src/js/**/*.js',
    images: 'src/assets/img/**/*.{jpg,jpeg,png,gif,svg,ico}',
    /** 変換せずそのまま配信するもの（PDF・動画・JSON など） */
    static: ['src/assets/data/**/*', 'src/assets/**/*.{mp4,webm,pdf,woff,woff2}'],
  },

  /** 出力先（dest からの相対） */
  out: {
    css: 'assets/css',
    js: 'assets/js',
    img: 'assets/img',
  },

  /** サイト設定 JSON */
  siteConfig: 'src/config/site.json',

  html: {
    /**
     * release でも HTML を読みやすい形で残すか。
     * クライアント納品が前提の案件が多いので既定は true（整形して出力）。
     * 転送量を詰めたいときだけ false にしてください。
     */
    beautify: true,
    beautifyOptions: {
      indent_size: 2,
      indent_char: ' ',
      preserve_newlines: false,
      max_preserve_newlines: 0,
      extra_liners: [],
      end_with_newline: true,
    },
  },

  images: {
    /** ラスター画像の再エンコード品質 */
    quality: { jpeg: 82, png: 90, webp: 80 },
    /** jpg / png から .webp を併せて書き出す */
    webp: true,
  },

  server: {
    startPath: '/',
    ghostMode: false,
    notify: false,
    // 自動でブラウザを開きたくないときは BS_OPEN=false を付けて実行
    open: process.env.BS_OPEN === 'false' ? false : 'external',
  },
};
