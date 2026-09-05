# Static Site Template

静的サイト（LP・コーポレート・キャンペーンサイト）を作るための制作テンプレートです。
SPA フレームワークは使わず、**EJS でページを組み、Sass でスタイルを書き、webpack で JS を束ねる**という
昔ながらの構成を、いまの Node と CSS で動くように整えたものです。

```
npm install     # 初回のみ
npm run dev     # 開発（http://localhost:3000 が開きます）
npm run build   # 納品物を release/ に出力
```

> コマンドはすべて `htdocs/` の中で実行します。

---

## 目次

- [必要な環境](#必要な環境)
- [はじめかた](#はじめかた)
- [コマンド一覧](#コマンド一覧)
- [ディレクトリ構成](#ディレクトリ構成)
- [ページを追加する](#ページを追加する)
- [スタイルを書く](#スタイルを書く)
- [JavaScript を書く](#javascript-を書く)
- [画像を置く](#画像を置く)
- [ビルド設定を変える](#ビルド設定を変える)
- [Git 運用ルール](#git-運用ルール)
- [困ったときは](#困ったときは)

---

## 必要な環境

|         | バージョン      | 備考                                           |
| ------- | --------------- | ---------------------------------------------- |
| Node.js | **20 LTS 以上** | `.nvmrc` があるので `nvm use` で切り替わります |
| npm     | 9 以上          | Node に同梱のもので構いません                  |

> **Node 18 を使っている場合の注意**
> 画像最適化に使う `sharp` は Node 18.17 未満を対象外にしており、`npm install` のときに
> ネイティブバイナリが黙って入りません。その状態でも HTML / CSS / JS のビルドは通り、
> 画像だけが「最適化なしのコピー」になります（実行時に警告が出ます）。
> 画像最適化まで動かしたいときは Node 20 に上げてから `npm install` をやり直してください。

---

## はじめかた

```bash
cd htdocs
nvm use          # .nvmrc を読んで Node 20 に切り替え
npm install
npm run dev
```

`npm run dev` でローカルサーバーが立ち上がり、`src/` を保存するたびに反映されます。
CSS だけはページをリロードせずに差し替わるので、モーダルやアコーディオンを開いたまま
見た目を調整できます。

最初にやること:

1. `htdocs/src/config/site.json` の `site` を実際のサイト情報に書き換える
2. `htdocs/src/sass/foundation/_variables.scss` の色とフォントを案件のものに変える
3. `htdocs/src/ejs/index.ejs` の中身を消して、マークアップを書き始める

---

## コマンド一覧

| コマンド               | 何をするか                                        |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | 開発サーバー + ファイル監視。出力先は `develop/`  |
| `npm run build`        | 本番ビルド。CSS / JS を圧縮して `release/` に出力 |
| `npm run preview`      | 本番ビルドしたものをローカルで表示して確認する    |
| `npm run images`       | 画像だけ最適化し直す                              |
| `npm run clean`        | `develop/` と `release/` を消す                   |
| `npm run format`       | Prettier で全ファイルを整形                       |
| `npm run format:check` | 整形漏れがないかチェックのみ（CI 向け）           |

個別のタスクを直接叩くこともできます。

```bash
npx gulp html      # EJS のみ
npx gulp styles    # Sass のみ
npx gulp scripts   # JS のみ
```

自動でブラウザを開きたくないときは `BS_OPEN=false npm run dev` としてください。

---

## ディレクトリ構成

```
htdocs/
├── build/                    ビルド処理（基本さわらない）
│   ├── config.js             ★ パス・品質・フラグの設定はここに集約
│   ├── webpack.config.js
│   ├── tasks/                html / styles / scripts / images / serve
│   └── util/
│
├── src/                      ★ 作業するのはここ
│   ├── config/site.json      サイト情報と全ページの meta
│   ├── ejs/
│   │   ├── index.ejs         トップページ
│   │   ├── about/index.ejs   下層ページのサンプル
│   │   └── _partials/        head / header / footer など共通パーツ
│   ├── sass/
│   │   ├── share.scss        CSS のエントリ（@use を並べる場所）
│   │   ├── _tools.scss       変数・関数・mixin の入口
│   │   ├── foundation/       リセット、変数、関数、mixin、base
│   │   ├── layout/           l-  ヘッダー・フッターなど枠組み
│   │   ├── component/        c-  ボタンなど使い回すパーツ
│   │   └── page/             p-  ページ固有
│   ├── js/
│   │   ├── index.js          エントリ。モジュールを呼ぶだけ
│   │   └── modules/          機能ごとに分ける
│   └── assets/
│       ├── img/              最適化される画像
│       └── data/             そのままコピーされるファイル（PDF・動画など）
│
├── develop/                  開発用の出力（Git 管理外）
└── release/                  納品用の出力（Git 管理外）
```

`develop/` と `release/` はビルドのたびに作り直されます。**直接編集しても次のビルドで消えます。**

---

## ページを追加する

ページ追加は **2 ステップ** です。

**1. EJS を置く**

```
src/ejs/company/index.ejs   →  /company/ として出力
src/ejs/contact.ejs         →  /contact.html として出力
```

`_` で始まるファイルは部品扱いになり、単体では出力されません。

**2. `src/config/site.json` の `pages` にキーを足す**

キーは `src/ejs/` からの、拡張子を除いたパスです。

```json
{
  "pages": {
    "index": { "isTop": true, "title": "サイト名" },
    "company/index": {
      "title": "会社概要",
      "description": "このページ専用の説明文",
      "noindex": false
    }
  }
}
```

`description` などを省略すると `site` の共通値が使われます。

### EJS の中で使える値

ページ側で変数を宣言する必要はありません。ビルド時に自動で渡されます。

| 変数                               | 中身                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `site`                             | `site.json` の `site`（サイト名・baseUrl など）          |
| `page`                             | そのページの設定 + `id` / `url`                          |
| `lang`                             | 言語コード                                               |
| `relative_path`                    | ルートまでの相対パス。`./` や `../` が**自動で入ります** |
| `isRelease`                        | 本番ビルドなら `true`                                    |
| `asset(relative_path, ファイル名)` | キャッシュ対策の `?v=` 付き URL を返す                   |

`relative_path` を各ページで手書きしていた頃の書き間違いは、これで起きません。

### 開発環境の noindex

`npm run dev` で出力した HTML には自動で `<meta name="robots" content="noindex, nofollow">` が入ります。
確認用 URL がうっかり検索結果に載るのを防ぐためのもので、`npm run build` では入りません。
特定のページだけ本番でも除外したい場合は `site.json` でそのページに `"noindex": true` を指定します。

---

## スタイルを書く

### 書き始める場所

| 種類                         | 置き場所          | クラス名 |
| ---------------------------- | ----------------- | -------- |
| ヘッダー・フッターなど枠組み | `sass/layout/`    | `l-`     |
| ボタンなど使い回すパーツ     | `sass/component/` | `c-`     |
| そのページだけのもの         | `sass/page/`      | `p-`     |

ファイルを追加したら `src/sass/share.scss` に `@use` を 1 行足してください。

### 各ファイルの先頭

変数・関数・mixin は `_tools.scss` にまとめてあるので、**この 1 行だけ**書けば全部使えます。

```scss
@use '../tools' as *;
```

### よく使う関数・mixin

```scss
.foo {
  font-size: rem(16); // 16px 相当（html が 62.5% なので 1.6rem）
  width: get-vw(750); // デザインの 750px を vw に変換
  max-width: get-min(1200); // vw で伸縮しつつ 1200px で頭打ち
  z-index: z('header'); // 数値の書き散らしを防ぐ

  @include sp {
    // 767px 以下
    font-size: rem(14);
  }

  @include pc {
    // 768px 以上
    @include hover {
      // マウスが使える環境のみ hover
      opacity: 0.7;
    }
  }

  @include container; // 中央寄せ + 左右パディング
  @include line-clamp(2); // 2 行で「…」
}

.title {
  font-size: fluid(24, 48); // 画面幅に応じて 24px〜48px を滑らかに補間
}
```

### 表示の出し分け

```html
<p class="u-pc-only">PC だけ表示</p>
<p class="u-sp-only">SP だけ表示</p>
```

### 色とフォント

案件ごとに変えるのは `foundation/_variables.scss` の color ブロックだけで済むようにしています。

### 外部ライブラリの CSS

`foundation/_vendor.scss` にまとめてあります。`node_modules` にパスが通っているので、
パッケージ名から直接書けます。使わないライブラリは行ごと消してください（そのぶん CSS が軽くなります）。

```scss
@use 'swiper/swiper.css';
```

---

## JavaScript を書く

`src/js/index.js` は「何を動かすか」だけを書く場所です。処理は `src/js/modules/` に分けます。

```js
import { initSlider } from '@/modules/slider';
```

`@` は `src/js` を指すエイリアスです。深い階層からでも同じ書き方ができます。

同梱しているモジュール:

| モジュール            | 中身                                                          |
| --------------------- | ------------------------------------------------------------- |
| `modules/device.js`   | 端末・ブラウザ判定。`body` に `is-sp` / `is-ios` などを付ける |
| `modules/viewport.js` | モバイルのアドレスバーに影響されない `--vh` を CSS 変数で提供 |
| `modules/slider.js`   | Swiper のサンプル。要素が無いページでは何もしません           |

### ライブラリを足す

```bash
npm install パッケージ名
```

`import` すればそのままバンドルされます。トランスパイルの対象ブラウザは
`package.json` の `browserslist` を見ています。CSS のベンダープレフィックスも
同じ設定を参照するので、**対象ブラウザは 1 箇所で管理できます**。

---

## 画像を置く

`src/assets/img/` に置くと、ビルド時に最適化されて出力されます。

- `.jpg` / `.png` → 再エンコード + **同じ場所に `.webp` も自動生成**
- `.svg` → 不要な属性やコメントを削除（`viewBox` は残します）
- `.gif` / `.ico` → そのままコピー

```html
<picture>
  <source srcset="<%= relative_path %>assets/img/hero.webp" type="image/webp" />
  <img src="<%= relative_path %>assets/img/hero.jpg" alt="" />
</picture>
```

一度出力した画像は、元ファイルを更新するまで再処理されません。
PDF や動画など変換したくないものは `src/assets/data/` に置いてください（そのままコピーされます）。

品質を変えたいときは `build/config.js` の `images.quality` を調整します。

---

## ビルド設定を変える

さわる場所はほぼ `build/config.js` に集約してあります。

| 設定             | 内容                                                            |
| ---------------- | --------------------------------------------------------------- |
| `html.beautify`  | `release` の HTML を整形して出力するか（既定 `true`。納品想定） |
| `images.quality` | JPEG / PNG / WebP の品質                                        |
| `images.webp`    | `.webp` の自動生成を止めたいときは `false`                      |
| `server`         | 自動オープンなど browser-sync の設定                            |
| `src` / `out`    | 入出力パス                                                      |

対象ブラウザは `package.json` の `browserslist` です。

---

## Git 運用ルール

### コミットしないもの

`develop/` と `release/` は **コミットしません**（`.gitignore` 済み）。
ビルドのたびに内容が変わるファイルなので、追跡すると pull のたびに必ず衝突します。

### コミットメッセージ

```
対応ページ、箇所：対応内容
```

例:

```
トップ ファーストビュー：スライダーの表示速度を調整
下層 会社概要：テーブルのSP表示崩れを修正
```

---

## 困ったときは

**`npm run dev` でエラーが出る**
Node のバージョンを確認してください（`node -v` が 20 以上か）。`nvm use` で切り替わります。

**画像が最適化されない / sharp の警告が出る**
Node 20 に切り替えてから、`npm install` をやり直すか `npm rebuild sharp` を実行してください。

**Sass の変数が見つからないと言われる**
そのファイルの先頭に `@use '../tools' as *;` があるか確認してください。
`@use` はファイルごとに必要です（`@import` と違い、他のファイルには波及しません）。

**CSS を書いたのに反映されない**
`src/sass/share.scss` に `@use` を足したか確認してください。
`_` 始まりのファイルは、どこからも `@use` されないと出力に含まれません。

**ビルドは通るのにブラウザで古い CSS が出る**
CSS / JS の URL には `?v=` が付いているので通常は起きませんが、
その場合はスーパーリロード（Ctrl+Shift+R）を試してください。

---

## 旧テンプレートからの変更点

以前のテンプレートを使っていた方向けの要点です。

|                        | 旧                                                                 | 新                                                                    |
| ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| コマンド               | `gulp d` / `gulp r`                                                | `npm run dev` / `npm run build`（`gulp d` / `gulp r` も残しています） |
| gulpfile               | 1 ファイル約 300 行                                                | `build/tasks/` に分割、`gulpfile.js` は流れだけ                       |
| meta 情報              | `src/config/meta.json`                                             | `src/config/site.json`（ページごとの上書き・canonical 対応）          |
| relative_path          | ページごとに手書き                                                 | ビルド時に自動計算                                                    |
| ベンダープレフィックス | **付いていなかった**（`pleeease.json` はどこからも読まれていない） | autoprefixer + `browserslist`                                         |
| Sass の構成            | `setting/` + `template/`                                           | `foundation/` `layout/` `component/` `page/`                          |
| 画像最適化             | imagemin 系 4 パッケージ                                           | `sharp` + `svgo` の 2 つ                                              |
| 画像の webp            | 別タスクで手動実行                                                 | ビルド時に自動生成                                                    |
| ソースマップ           | 本番にも出力                                                       | 開発のみ                                                              |
| キャッシュ対策         | なし                                                               | CSS / JS に `?v=` を自動付与                                          |

Sass 側で挙動が変わっているもの:

- `.sp-none` → `.u-pc-only`、`.pc-none` → `.u-sp-only`
  （旧 `.sp-none` は PC でも SP でも `display: none` になっており、常に非表示でした）
- `body` の文字サイズ
  （旧テンプレートは `html` と `body` の両方に `font-size: 62.5%` が掛かっており、実寸が 6.25px になっていました）
- `@include max-screen()` → `@include sp()`、`@include min-screen()` → `@include pc()`
- `*:focus { outline: 0 }` を廃止し、キーボード操作時のみ表示する `:focus-visible` に変更
