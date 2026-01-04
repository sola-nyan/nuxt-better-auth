<!-- eslint-disable no-console -->
<script setup lang="ts">
import { useFetch } from '#app'
import { useAuthClient } from './app/utils/authClient'

const authClient = await useAuthClient()

async function callAPI() {
  return await useFetch('/api/test/hello')
}

async function callAPISignOut() {
  return await authClient.signOut()
}
</script>

<template>
  <div class="p-3 [&>*]:m-2">
    <div>
      <div>
        <input
          type="button"
          value="CALL API"
          @click="callAPI"
        >
        <input
          type="button"
          value="CALL API SIGNOUT"
          @click="callAPISignOut"
        >
      </div>
    </div>
  </div>
  <NuxtPage />
</template>
