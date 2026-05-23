# ブロック崩しアプリケーション解説書

## 1. 文書概要

この文書は、PC ブラウザ向けに実装されたブロック崩しゲームの利用方法と内部構成を説明するための解説書です。  
対象読者は以下を想定しています。

- ゲームを遊ぶ利用者
- 実装内容を理解したい開発者
- 今後の改修や機能追加を担当する人

---

## 2. アプリケーション概要

本アプリケーションは、パドルでボールを跳ね返しながらブロックを破壊していくシングルプレイの 2D ブロック崩しゲームです。

主な特徴は以下の通りです。

- PC ブラウザで動作
- 画面は 1 画面固定
- キーボード操作に対応
- レベル 1 から 3 までのステージ構成
- ライフ制によるゲームオーバー判定
- 4 種類のアイテムを実装
- タイトル、プレイ中、ゲームオーバー、ゲームクリア画面を実装

---

## 3. 実行方法

### 3.1 必要なもの

- 一般的な PC ブラウザ
  - Microsoft Edge
  - Google Chrome
  - Firefox など

### 3.2 起動方法

このアプリは外部ライブラリを使わない静的構成です。  
そのため、以下のどちらかで実行できます。

1. `index.html` をブラウザで直接開く
2. ローカルサーバー上に配置してブラウザで開く

対象ファイル:

- [index.html](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\index.html:1)
- [style.css](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\style.css:1)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:1)

---

## 4. 操作方法

### 4.1 基本操作

- `←` / `→`
  - パドルを左右に移動します
- `A` / `D`
  - パドルを左右に移動します
- `Space`
  - タイトル画面からゲーム開始
  - 一時停止中の再開
- `P`
  - プレイ中の一時停止
  - 一時停止中の再開
- `R`
  - タイトルへ戻して再スタート

### 4.2 ゲームの目的

- ボールを使ってすべてのブロックを破壊する
- レベル 1 から順にクリアする
- レベル 3 をクリアするとゲームクリア
- ボールを 3 回落とすとゲームオーバー

---

## 5. 画面構成

### 5.1 左側 HUD パネル

左側にはゲーム情報を表示する HUD を配置しています。

- `LEVEL`
  - 現在のレベル
- `LIFE`
  - 残りライフ
- `SCORE`
  - 現在スコア
- `STATUS`
  - タイトル、プレイ中、一時停止、クリアなどの状態表示
- `EFFECT`
  - パドル拡大や速度低下の残り時間表示
- `LEGEND`
  - 操作方法の簡易説明

定義場所:

- [index.html](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\index.html:10)

### 5.2 ゲームキャンバス

右側には `canvas` を使ったゲーム画面を配置しています。

- 画面サイズは `960 x 600`
- 背景、ブロック、パドル、ボール、アイテム、オーバーレイを描画

定義場所:

- [index.html](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\index.html:41)

---

## 6. ゲーム仕様

### 6.1 ライフ

- 初期ライフは 3
- 画面下にすべてのボールを落とすとライフを 1 消費
- ライフが 0 になるとゲームオーバー

### 6.2 レベル

- レベルは 1 から 3 の全 3 段階
- レベルが進むほど以下が強化されます
  - ブロック数
  - 耐久ブロックの比率
  - ボール初速
  - アイテム出現率の微調整

レベル定義:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:36)

### 6.3 スコア

- 通常ブロック破壊: 100 点
- 耐久ブロックの最終破壊: 200 点
- スコア加算アイテム取得: 500 点

### 6.4 ブロック

- `1` のブロックは通常ブロック
- `2` のブロックは耐久ブロック
- 耐久ブロックは 2 回ヒットで破壊

### 6.5 ボール

- 初期状態では 1 個
- 壁、パドル、ブロックで反射
- パドルの当たった位置に応じて反射角が変化
- マルチボールで複数化可能
- 最大同時ボール数は 5

---

## 7. アイテム仕様

このゲームでは、アイテムを内包したブロックを壊すとアイテムが落下します。  
パドルで取得すると効果が発動します。

### 7.1 マルチボール

- 種別: `multiball`
- 効果:
  - ボール数を増やす
  - 取得時のボール進行方向を基準に分裂
- 制限:
  - 最大同時ボール数は 5

### 7.2 パドル拡大

- 種別: `expand`
- 効果:
  - パドル幅を広げる
- 効果時間:
  - 10 秒
- 重複取得:
  - 残り時間を加算

### 7.3 ボール速度低下

- 種別: `slow`
- 効果:
  - 全ボールの速度を低下
- 効果時間:
  - 8 秒
- 重複取得:
  - 残り時間を加算

### 7.4 スコア加算

- 種別: `score`
- 効果:
  - 即時に 500 点加算

アイテム処理の実装箇所:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:152)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:395)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:432)

---

## 8. 画面状態遷移

このアプリは `state.mode` により画面状態を管理しています。

主な状態は以下です。

- `title`
  - タイトル画面
- `playing`
  - プレイ中
- `paused`
  - 一時停止中
- `level-clear`
  - レベル開始前の演出表示
- `game-over`
  - ゲームオーバー
- `clear`
  - ゲームクリア

状態管理の中心:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:76)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:195)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:202)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:556)

---

## 9. ファイル構成

### 9.1 `index.html`

役割:

- ゲーム画面全体の HTML を定義
- HUD パネルとキャンバスを配置
- `script.js` を読み込む

### 9.2 `style.css`

役割:

- レイアウトと装飾を定義
- 左側 HUD と右側ゲーム領域の見た目を作成
- モバイル幅でも崩れにくいレスポンシブ対応を実施

### 9.3 `script.js`

役割:

- ゲーム状態の管理
- キー入力の処理
- 物理更新と当たり判定
- 描画処理
- レベル管理
- アイテム効果の管理

---

## 10. 内部構造の解説

### 10.1 状態オブジェクト

アプリ全体の進行状況は `state` オブジェクトで管理されています。

主な保持値:

- `mode`
  - 現在のゲーム状態
- `level`
  - 現在レベル
- `score`
  - 現在スコア
- `lives`
  - 残りライフ
- `paddle`
  - パドル情報
- `balls`
  - ボール配列
- `blocks`
  - ブロック配列
- `items`
  - 落下中アイテム配列
- `effects`
  - 時間制効果の残り時間

### 10.2 更新ループ

ゲームは `requestAnimationFrame` によるループで動いています。

流れ:

1. `loop()` が毎フレーム呼ばれる
2. 経過時間 `dt` を計算
3. `update(dt)` で状態更新
4. `draw()` で画面描画

関連箇所:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:259)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:468)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:598)

### 10.3 入力処理

キーボード状態は `keys` オブジェクトで保持しています。

- `keydown`
  - 押下状態を `true`
- `keyup`
  - 押下状態を `false`
- 毎フレーム `updatePaddle()` がその状態を参照して移動

関連箇所:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:32)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:297)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:628)

### 10.4 当たり判定

主な当たり判定は以下です。

- ボールと壁
- ボールとパドル
- ボールとブロック
- アイテムとパドル

ブロックとの衝突では重なり量を比較して、反射方向を決定しています。

関連箇所:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:303)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:331)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:351)
- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:406)

### 10.5 描画処理

描画は Canvas 2D API で行っています。

主な描画関数:

- `drawBackground()`
- `drawBlocks()`
- `drawPaddle()`
- `drawBalls()`
- `drawItems()`
- `drawOverlay()`

関連箇所:

- [script.js](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\script.js:468)

---

## 11. デザイン方針

見た目は近未来寄りのガラス調 UI をベースにしています。

主なポイント:

- ダークトーンの背景
- シアン系アクセントカラー
- 左右 2 カラム構成
- HUD を常時見える位置に固定
- キャンバスまわりをパネル化してゲーム感を強調

スタイル定義:

- [style.css](c:\Users\hrhak\OneDrive\Desktop\趣味\生成AI\ブロック崩し\style.css:1)

---

## 12. 改修しやすいポイント

今後の拡張では、次の箇所を触ると対応しやすい構成です。

### 12.1 レベル追加

- `levelConfigs` に新しい設定を追加
- `advanceLevel()` の終了条件を調整

### 12.2 アイテム追加

- `ITEM_WEIGHTS` に新規種別を追加
- `applyItem()` に効果を追加
- `drawItems()` に色とラベルを追加

### 12.3 演出追加

- `drawOverlay()` に演出文言を追加
- ブロック破壊時にエフェクト用配列を追加して描画可能

### 12.4 サウンド追加

- `Audio` または Web Audio API を利用
- ブロック破壊、アイテム取得、ゲームオーバーなどに音を付与

### 12.5 スマホ対応

- タッチ入力の追加
- キャンバスサイズや HUD 配置の再設計

---

## 13. 利用上の注意

- ブラウザの種類によって見た目や文字描画が多少変わる場合があります
- 直接ファイルを開く構成のため、ブラウザ設定によっては挙動差が出る可能性があります
- セーブ機能やランキング機能は未実装です
- サウンドは未実装です

---

## 14. まとめ

このブロック崩しアプリは、要求仕様に沿って次の内容を満たすよう構成されています。

- 3 ライフ制のゲームオーバー判定
- 3 レベル構成
- ブロック破壊と耐久ブロック
- マルチボールを含む 4 種類のアイテム
- スコア、ライフ、レベルの常時表示
- タイトル、プレイ中、ゲームオーバー、ゲームクリア画面

ゲームとして遊べるだけでなく、HTML、CSS、JavaScript の役割分担が明確で、今後の改造や学習素材としても扱いやすい構成になっています。
