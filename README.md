# nuxt-better-auth

Nuxt 4 で better-auth を使うための薄いヘルパーモジュールです。`/api/auth/**` のハンドラ自動登録と、サーバ/クライアントのユーティリティを提供します。

## 特徴
- `/api/auth/**` を better-auth の handler に自動接続
- サーバ: `createBetterAuth` で auth インスタンスと便利関数を生成
- クライアント: `createBetterAuthClient` で session 管理済みクライアントを生成
- Nuxt の auto-import に対応（server/client 両方）

## 要件
- Nuxt 4
- better-auth 1.4+

## インストール
```bash
npm i @sola-nyan/nuxt-better-auth better-auth
```

## セットアップ
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sola-nyan/nuxt-better-auth'],
})
```

モジュールは `/api/auth/**` のサーバーハンドラを登録します。`better-auth` 側の `baseURL` はこのパスと一致させてください。

## サーバ側: createBetterAuth
`createBetterAuth` は better-auth の初期化 + 便利関数 + `/api/auth` ハンドラへの共有を行います。`/api/auth` にアクセスする前に必ず一度呼び出されている必要があります（未初期化だと 500 になります）。

推奨: `server/utils/auth.ts` を作成し、サーバー処理から import して必ず読み込む。

```ts
// server/utils/auth.ts
import { createBetterAuth } from '#imports'

export const {
  auth,
  useAuthServer,
  requireSession,
  useUserSession,
  navigateSocialSignIn,
} = createBetterAuth({
  secret: process.env.AUTH_SESSION_SECRET,
  baseURL: `${process.env.BASE_URL}/api/auth`,
  // ...better-auth のオプション
})
```

### 使える関数
- `auth`: better-auth のインスタンス
- `useAuthServer(event)`: event に束縛された `requireSession`/`useUserSession`
- `requireSession(event)`: 未ログインなら 401 を投げる
- `useUserSession(event)`: `{ user, session }` を返す
- `navigateSocialSignIn(event, { provider, callbackURL })`: OAuth 用リダイレクト Response を返す（必ず `return` する）

#### 例: API での保護
```ts
export default defineEventHandler(async (event) => {
  const { requireSession } = useAuthServer(event)
  const session = await requireSession()
  return { userId: session.user.id }
})
```

#### 例: Social Sign-in リダイレクト
```ts
export default defineEventHandler((event) => {
  return navigateSocialSignIn(event, { provider: 'microsoft', callbackURL: '/' })
})
```

## クライアント側: createBetterAuthClient
`better-auth/vue` の `createAuthClient` をラップし、`useSession(useFetch)` を済ませた状態で返します。

```ts
// app/utils/authClient.ts
export async function useAuthClient() {
  return await createBetterAuthClient({
    baseURL: '/api/auth',
  })
}
```

```vue
<script setup lang="ts">
const auth = await useAuthClient()
const { loggedIn, user, signIn, signOut } = auth
</script>
```

- `loggedIn`: `session` があるかどうか
- `user` / `session`: `ComputedRef` で常に最新
- `signOut({ redirectTo })`: ログアウト後にリダイレクト（省略時は `/`）

## 型の拡張
サーバで `user.additionalFields` / `session` を追加している場合、クライアント側で型を合成できます。

```ts
type AddFields = {
  user: { empId: string; admin: boolean }
  session: { role: 'admin' | 'user' }
}

const auth = await createBetterAuthClient<AddFields>({ baseURL: '/api/auth' })
```

サーバ側の型は `auth.$Infer` が利用できます。

```ts
export type UserInfo = typeof auth.$Infer.Session.user
```

## 注意点
- `/api/auth/**` はモジュール側で固定登録されています。`baseURL` は必ず `/api/auth` に合わせてください。
- `createBetterAuth` は最新インスタンスを共有するため、複数回初期化は想定していません。
- `createBetterAuthClient` は async なので、`<script setup>` の top-level `await` か `useAsyncData` で使ってください。
