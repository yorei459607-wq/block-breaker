# Block Breaker

ブラウザでそのまま遊べる、シングルプレイのブロック崩しゲームです。

## ローカルで開く

`index.html` をブラウザで開くだけで動作します。  
もしブラウザの制約で直接起動が不安定な場合は、簡単なローカルサーバー経由で開いてください。

PowerShell 例:

```powershell
cd .\ブロック崩し
python -m http.server 8000
```

その後、`http://localhost:8000` を開きます。

## デプロイ方法

このリポジトリは静的サイトとして公開できます。

### GitHub Pages

`.github/workflows/deploy-pages.yml` を用意してあるので、GitHub の `main` ブランチへ push すると公開できます。

1. GitHub にこのフォルダをリポジトリとして push
2. GitHub の `Settings > Pages` を開く
3. `Build and deployment` を `GitHub Actions` にする
4. `main` に push
5. 数分待つと公開 URL が発行される

公開 URL の例:

```text
https://<your-account>.github.io/<repository-name>/
```

### Netlify

`netlify.toml` を追加済みです。  
GitHub リポジトリを Netlify に接続するだけで公開できます。

- Build command: なし
- Publish directory: `.`

### Vercel

`vercel.json` を追加済みです。  
GitHub リポジトリを Vercel に import するだけで静的サイトとして公開できます。

## ファイル構成

- `index.html`: 画面の土台
- `style.css`: UI デザイン
- `script.js`: ゲームロジック
- `site.webmanifest`: Web アプリ用の基本メタ情報
- `.github/workflows/deploy-pages.yml`: GitHub Pages 自動公開設定
- `netlify.toml`: Netlify 用設定
- `vercel.json`: Vercel 用設定

## 操作方法

- `←` / `→` または `A` / `D`: パドル移動
- `Space`: 開始 / 再開
- `P`: 一時停止
- `R`: タイトルへ戻る

## ドキュメント

- [アプリケーション解説書](doc/application_guide.md)
- [要求仕様書](doc/block_breaker_requirements.md)
