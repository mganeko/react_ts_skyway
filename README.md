# React.js/TypeScript - SkyWay Example

React.js and TypeScript exmaple for [SkyWay](https://webrtc.ecl.ntt.com).

これは WebRTCクラウドプラットフォーム [SkyWay](https://webrtc.ecl.ntt.com) 向けの、React.js/TypeScript によるサンプルです。

- [skyway-js-sdk](https://github.com/skyway/skyway-js-sdk) を利用しています(Apache 2.0 ライセンス)

## LICENSE / ライセンス

- MIT LICENSE / MITライセンス


# 利用方法

## 事前準備

- [SkyWay](https://webrtc.ecl.ntt.com) にサインアップ
- APIキーを取得

## GitHub Pages で実行（準備中）

- ブラウザを2つ起動、それぞれ https://mganeko.github.io/react_ts_skyway/ にアクセス
- [Start Video]ボタンをクリック
- API Key: に SkyWayのAPIキーを入力
- Room: にルーム名を入力
- [Coonect]ボタンをクリックして接続

URLを次の形式で指定することで、シグナリングキーとルーム名を指定可能

- https://mganeko.github.io/react_ts_skyway/?room=ルーム名&key=APIキー


## 開発環境で実行

- $ git clone https://github.com/mganeko/react_ts_skyway.git
- $ cd react_ts_skyway
- $ npm install 
- $ npm start
- http:localhost:3000 にブラウザでアクセス
- その後は GitHub Pages の例と同様 

## 自分のサーバーで実行

- $ git clone https://github.com/mganeko/react_ts_skyway.git
- $ cd react_ts_skyway
- $ npm install 
- $ npm run build
- build/ 以下をWebサーバーに配置(要https)
- 配置したWebサーバーにブラウザーでアクセス
- その後は GitHub Pages の例と同様 

