import { defineEventHandler } from "#build/types/nitro-imports"
import { useModuleOption } from "../../internalShared/useModuleOption"
import { useLatestAuthInstance } from "../internal/useLatestAuthInstance"

export default defineEventHandler(async (event) => {
  const ins = useLatestAuthInstance()
  if (!ins?.auth)
    return

  const mod = useModuleOption()
  const routes = mod?.routes ?? []

  const matched = routes
    .filter(r => r.path.startsWith(event.path))
    .sort((a, b) => b.path.length - a.path.length)

  if (matched.length === 0)
    return

  if (!matched[0]?.auth)
    return

  const helper =  ins.helper?.useAuthServer(event)
  const ses = await helper?.useUserSession()

  if (!ses?.user) {
    return await helper?.navigateSocialSignIn({ 
      provider: matched[0].provider, 
      callbackURL: matched[0].callbackURL 
    })
  }   

})
