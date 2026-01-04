# モジュール概要
`@sola-nyan/nuxt-hono` は Hono サーバーフレームワークを Nuxt Nitro に簡単に組み込むためのモジュールです。  
サーバーサイドでは`createH3HonoRouter`・`createH3HonoHandler` を提供し、  
クライアントサイドではフェッチクライアントのファクトリとして`createH3HonoClinet`を提供します。  
詳細な実装方法についてはplaygrondを参照してください。

## ディレクトリ構成制限の説明
- デフォルトでは `server` をルートとし、その直下に `hono` ディレクトリを置きます。この中に `routers` サブフォルダを作り、ルーティング定義は `*Router.ts` または `*Router.mts` 形式のファイル名で配置する必要があります。
- FBR(File Based Routing) を有効にすると `server/hono/routers` をの変更を監視し、 `server/hono/general/generatedRoutes.ts` を常に最新化します。

