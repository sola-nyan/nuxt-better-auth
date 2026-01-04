import { defineEventHandler } from 'h3'
import {
  navigateSocialSignIn,
  requireAdminSession,
  requireSession,
  useUserSession,
} from '../utils/authServerClient'

export default defineEventHandler(async (event) => {
  // API系に対する認証
  if (event.path.startsWith('/api')) {
    if (event.path.startsWith('/api/auth'))
      return
    if (event.path.startsWith('/api/public'))
      return
    await requireSession(event)
    return
  }

  // 画面系に対する認証(サーバーサイド)
  if (event.path.startsWith('/admin')) {
    // 管理系画面には管理者権限が必要
    await requireAdminSession(event)
  }
  else {
    // それ以外ではログインしてればOK、してないならログイン画面に飛ばす
    const { user } = await useUserSession(event)

    if (!user)
      return await navigateSocialSignIn(event, { provider: 'microsoft', callbackURL: '/' })
  }
})
