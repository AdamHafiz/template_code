'use strict';

const path = require('node:path');
const fs = require('node:fs');
const gulp = require('gulp');
const through = require('through2');
const plumber = require('gulp-plumber');
const { optimize: svgo } = require('svgo');

const config = require('../config');
const { onError } = require('../util/error');

const RASTER = new Set(['.jpg', '.jpeg', '.png']);

/**
 * sharp はネイティブモジュールなので、Node のバージョンが古いと読み込みに失敗する。
 * ここで遅延読み込みにしておくと、その場合でも HTML / CSS / JS のビルドは通り、
 * 画像だけが「最適化なしのコピー」に落ちる。
 */
let sharpModule;
let sharpFailed = false;

function getSharp() {
  if (sharpFailed) return null;
  if (sharpModule) return sharpModule;

  try {
    sharpModule = require('sharp');
    return sharpModule;
  } catch (err) {
    sharpFailed = true;
    console.warn('');
    console.warn('[images] sharp を読み込めませんでした。画像は最適化せずコピーします。');
    console.warn(
      '         Node.js 20 LTS 以上で `npm rebuild sharp` を実行してください。'
    );
    console.warn(`         (${err.message.split(String.fromCharCode(10))[0]})`);
    console.warn('');
    return null;
  }
}

const imgDest = path.join(config.root, config.dir.dest, config.out.img);

/**
 * 出力済みで、かつ元画像より新しいものは処理しない。
 * 画像最適化は重いので、差分のみを対象にします。
 * （gulp-changed は v5 から ESM 専用になり require できないため自前で判定）
 */
function onlyChanged() {
  return through.obj((file, enc, cb) => {
    if (file.isNull()) return cb();

    const destPath = path.join(imgDest, file.relative);
    try {
      const dest = fs.statSync(destPath);
      if (dest.mtimeMs >= file.stat.mtimeMs) return cb();
    } catch {
      // 未出力なら通す
    }
    cb(null, file);
  });
}

/**
 * ラスター画像は sharp、SVG は svgo で最適化する。
 * 旧テンプレートは gulp-imagemin / imagemin-pngquant / imagemin-webp / gulp-webp の
 * 4 つを併用していましたが、依存が古く Node の新しいバージョンで入らないことがあるため
 * sharp と svgo の 2 つに集約しました。
 */
function optimizeImages() {
  const { quality } = config.images;

  return gulp
    .src(config.src.images, { encoding: false, allowEmpty: true })
    .pipe(plumber({ errorHandler: onError('images') }))
    .pipe(onlyChanged())
    .pipe(
      through.obj(async function (file, enc, cb) {
        if (!file.isBuffer()) return cb(null, file);

        const ext = path.extname(file.path).toLowerCase();

        try {
          if (ext === '.svg') {
            const result = svgo(file.contents.toString('utf8'), {
              multipass: true,
              plugins: [
                {
                  name: 'preset-default',
                  // viewBox を消されると CSS 側で拡大縮小できなくなるので残す
                  params: { overrides: { removeViewBox: false } },
                },
              ],
            });
            file.contents = Buffer.from(result.data);
          } else if (RASTER.has(ext) && getSharp()) {
            const sharp = getSharp();
            // webp は再エンコード後ではなく元データから作る（劣化を重ねないため）
            const original = file.contents;

            file.contents =
              ext === '.png'
                ? await sharp(original)
                    .png({ quality: quality.png, compressionLevel: 9 })
                    .toBuffer()
                : await sharp(original)
                    .jpeg({ quality: quality.jpeg, mozjpeg: true })
                    .toBuffer();

            // 同じ場所に .webp を並べて置く（<picture> から参照する想定）
            if (config.images.webp) {
              const webpFile = file.clone({ contents: false });
              webpFile.contents = await sharp(original)
                .webp({ quality: quality.webp })
                .toBuffer();
              webpFile.extname = '.webp';
              this.push(webpFile);
            }
          }
          // .gif / .ico はそのまま通す
        } catch (err) {
          console.warn(`[images] 最適化をスキップ: ${file.relative} (${err.message})`);
        }

        cb(null, file);
      })
    )
    .pipe(gulp.dest(imgDest));
}

/** 変換の必要がないファイル（PDF・動画・フォントなど）をコピーするだけ */
function copyStatic() {
  return gulp
    .src(config.src.static, { base: 'src/assets', encoding: false, allowEmpty: true })
    .pipe(gulp.dest(`${config.dir.dest}/assets`));
}

module.exports = { optimizeImages, copyStatic };
