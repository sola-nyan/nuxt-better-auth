export async function useAuthClient() {
  return await createBetterAuthClient({
    baseURL: 'http://localhost:3000',
  })
}
