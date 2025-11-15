# zklinker TODO

## 0. 設計・開発環境まわり

- [x] 0. 開発言語・ランタイムの決定
  - TypeScript
  - Node.js v24.11.1

## 1. プロジェクト構成

- [x] 1. プロジェクトのディレクトリ構造の決定
  - /cli
  - /supabase
- [x] 1.1 プロジェクトの初期化
  - [x] cli: npm init / TypeScript セットアップ（tsconfig, scripts）
  - [x] cli: commander 導入 & main.ts で `zklinker index/search` の枠だけ作る
  - [x] cli: bin/zklinker 作成 & npm link で動作確認
  - [x] supabase: `supabase init`
  - [x] supabase: functions/search の stub 実装（POST を受けてダミー返却）

## 2. テーブル定義（Postgres + pgvector）

- [x] 2. テーブル & スキーマ設計
  - [x] 2.1 notes テーブルのカラム設計
    - id（uuid）
    - filename（text, unique）  ← ファイル名 = ノートの識別子
    - embedding（vector）
    - created_at / updated_at（timestamp）
  - [x] 2.2 同一ファイル再インデックス時のキー方針
    - 「同じノート = 同じファイル名」とみなす
    - DB 上は `filename` に UNIQUE 制約をつける
    - `zklinker index` は `INSERT ... ON CONFLICT (filename) DO UPDATE` で再インデックス対応
  - [x] 2.3 pgvector 拡張の有効化
  - [x] 2.4 embedding カラム型 & 次元数の確定
  - [x] 2.5 類似検索用のインデックス作成（ivfflat など）
  - [x] 2.6 初期マイグレーション SQL 作成（supabase/migrations 配下）

## 3. 認証方式の検討

- [x] 3. 認証・権限の設計
  - [x] 3.1 想定：当面は「自分専用」運用
  - [x] 3.2 Supabase のキー運用方針
    - CLI は SUPABASE_SERVICE_ROLE_KEY を .env に保持し、REST API を直接叩く
    - Edge Function `/search` 内でも SUPABASE_SERVICE_ROLE_KEY を使って DB にアクセスする
  - [x] 3.3 単ユーザ運用の場合の簡易ルール
    - notes テーブルの RLS は無効化 or 設定しない
    - `/functions/v1/search` は以下のどちらかで保護
      - [x] 認証なし（ローカル & 自分専用運用に割り切る場合）
      - [x] カスタムヘッダ `X-Zklinker-Secret` による簡易認証

## 4. 埋め込みまわり

- [x] 4. 埋め込み設定
  - [x] 4.1 使う埋め込みモデルの決定
    - OpenAI `text-embedding-3-small` を採用
    - Groq は現時点で埋め込みAPIを提供していないため、採用対象外
  - [x] 4.2 モデルの次元数と DB 側 vector 型の整合
    - `embedding vector(1536)` として既存テーブル定義と一致
  - [x] 4.3 API キー管理（.env / 環境変数）
    - CLI からは環境変数経由で参照

## 5. CLI 実装

- [x] 5. zklinker index 実装
  - [x] 5.1 カレントディレクトリ配下の .md ファイル列挙
  - [x] 5.2 ファイル名（basename）の取得 → filename として送る
  - [x] 5.3 埋め込み生成（OpenAI など）呼び出し
  - [x] 5.4 Supabase への upsert（notes テーブル更新, conflict target: filename）
  - [x] 5.5 進捗ログ・簡易な集計（何件インデックスしたか）
- [x] 5. zklinker search 実装
  - [x] 5.6 引数 <text> の受け取り & 埋め込み生成
  - [x] 5.7 /api/v1/search を呼び出し
  - [x] 5.8 上位8件の `filename` と `score` を CLI で整形表示

## 6. API 設計

- [x] 6. /api/v1/search の設計
  - [x] 6.1 リクエスト形式の決定
    - `POST /api/v1/search`
    - body: `{ "query": string, "topK"?: number }`
  - [x] 6.2 レスポンス形式の決定
    - `results: [{ filename, score }]`

## 7. デプロイ / 本番運用準備

- [x] 7.1 Supabase 本番プロジェクト作成
  - Supabase ダッシュボードで新しいプロジェクト（prod）を作成
  - プロジェクト URL / anon key / service_role key を控える
- [x] 7.2 本番DBへのスキーマ反映
  - ローカルの `supabase/migrations` を使って本番プロジェクトにマイグレーション適用
    - `supabase db push` 等で本番に `notes` テーブル & pgvector を反映
- [x] 7.3 Edge Function `search` の本番デプロイ
  - `supabase functions deploy search` でクラウドにデプロイ
  - 本番環境の Function URL をメモ（`https://<project-ref>.functions.supabase.co/search`）
- [x] 7.4 本番用環境変数の設定
  - Supabase ダッシュボードの Function env に以下を設定
    - `SUPABASE_URL`（本番プロジェクトの URL）
    - `SUPABASE_SERVICE_ROLE_KEY`
  - CLI 側にも本番用 `.env` or プロファイルを用意
    - `ZKL_SUPABASE_URL`（本番）
    - `ZKL_SUPABASE_SERVICE_ROLE_KEY`（本番）
    - `ZKL_OPENAI_API_KEY`
