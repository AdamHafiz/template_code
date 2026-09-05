'use strict';

const config = require('./config');

module.exports = {
  mode: config.isRelease ? 'production' : 'development',
  // dev はビルドが速い eval 系、release ではソースを配信しない
  devtool: config.isRelease ? false : 'eval-cheap-module-source-map',
  entry: './src/js/index.js',
  output: {
    filename: 'project.js',
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      // import Foo from '@/modules/foo' と書けるようにする
      '@': require('node:path').resolve(config.root, 'src/js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // preset は package.json の browserslist を見るので、対象ブラウザは一箇所で管理できる
          options: { presets: [['@babel/preset-env', { bugfixes: true }]] },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  performance: {
    // 静的サイトなので警告は出さない（three.js などを入れるとすぐ超えるため）
    hints: false,
  },
  stats: 'minimal',
};
