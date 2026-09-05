# htdocs

作業ディレクトリです。npm コマンドはすべてここで実行します。

```bash
npm install
npm run dev     # 開発サーバー + 監視 → develop/
npm run build   # 本番ビルド        → release/
```

セットアップ手順・ディレクトリの説明・書き方のルールは、
リポジトリ直下の [README.md](../README.md) にまとめてあります。

## よく触るファイル

| やりたいこと            | ファイル                                     |
| ----------------------- | -------------------------------------------- |
| サイト名・meta を変える | `src/config/site.json`                       |
| 色・フォントを変える    | `src/sass/foundation/_variables.scss`        |
| CSS を追加する          | `src/sass/` に置いて `share.scss` に `@use`  |
| JS を追加する           | `src/js/modules/` に置いて `index.js` で呼ぶ |
| ビルド設定を変える      | `build/config.js`                            |
