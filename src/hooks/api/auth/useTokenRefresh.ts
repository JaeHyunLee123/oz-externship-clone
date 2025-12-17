import { MSW_BASE_URL } from '@/constants/url-constants'
import { useLoginStore } from '@/store/useLoginStore'
import { setAccessToken } from '@/utils'
import api from '@/utils/axios'
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'

export default function useTokenRefresh(options?: UseMutationOptions) {
  const qc = useQueryClient()
  const { setIsLoggedIn } = useLoginStore()

  return useMutation({
    ...options,
    mutationKey: ['token', 'refresh'],
    mutationFn: async () => {
      const response = await api.post(`${MSW_BASE_URL}/auth/refresh`)
      const newAccessToken = response.data.access
      return newAccessToken
    },
    onSuccess: (newAccessToken: string) => {
      setAccessToken(newAccessToken)
      setIsLoggedIn(true)
      qc.invalidateQueries({ queryKey: ['info'] })
    },
    onError: () => {
      setIsLoggedIn(false)
      qc.removeQueries({ queryKey: ['info'] })
    },
  })
}
