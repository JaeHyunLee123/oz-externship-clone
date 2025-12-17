import { MSW_BASE_URL } from '@/constants/url-constants'
import { useLoginStore } from '@/store/useLoginStore'
import type { UserInformation } from '@/types/api-response-types/auth-response-types'
import api from '@/utils/axios'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export default function useUserInformation<T = UserInformation>(
  options?: UseQueryOptions<UserInformation, Error, T>
) {
  const { isLoggedIn } = useLoginStore()

  return useQuery<UserInformation, Error, T>({
    ...options,
    queryKey: ['info'],
    queryFn: async () => {
      const response = await api.get(`${MSW_BASE_URL}/info/`)
      const data = response.data

      return {
        ...data,
        phoneNumber: data.phone_number,
        profileImageUrl: data.profile_image_url,
        createdAt: data.created_at,
      }
    },
    enabled: isLoggedIn,
  })
}
