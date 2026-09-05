'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config');

/**
 * ディレクトリを中身ごと削除する。
 * 以前は del パッケージを使っていたが、Node 18 以降は fs.rm で足りるので依存を減らした。
 */
async function removeDir(dir) {
  await fs.rm(path.join(config.root, dir), { recursive: true, force: true });
}

/**
 * dir 直下を、keep に挙げたもの以外削除する。
 * develop の assets（ビルド成果物ではない画像など）を残したまま HTML だけ作り直す用途。
 */
async function cleanExcept(dir, keep = []) {
  const target = path.join(config.root, dir);
  let entries;
  try {
    entries = await fs.readdir(target);
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }

  await Promise.all(
    entries
      .filter((name) => !keep.includes(name))
      .map((name) => fs.rm(path.join(target, name), { recursive: true, force: true }))
  );
}

module.exports = { removeDir, cleanExcept };
