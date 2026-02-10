import { createError, defineEventHandler, toWebRequest } from 'h3'
import { useLatestAuthInstance } from '../internal/useLatestAuthInstance'

export default defineEventHandler(async (event) => {
  const ins = useLatestAuthInstance()
  if (!ins.auth) {
    throw createError({
      status: 500,
      message: 'No better-auth instance found',
    })
  }
  return ins.auth.handler(toWebRequest(event))
})
