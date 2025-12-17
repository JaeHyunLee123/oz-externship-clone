import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UpdateUserInfoRequest } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useUserInformation } from '@/hooks/api'

export default function useUpdateUserInfo(
  options?: UseMutationOptions<unknown, AxiosError, UpdateUserInfoRequest>
) {
  const { triggerToast } = useToast()
  const { refetch } = useUserInformation()

  return useMutation<unknown, AxiosError, UpdateUserInfoRequest>({
    ...options,
    mutationKey: ['user', 'update-info'],
    mutationFn: async ({ nickname, phoneNumber }) => {
      return await api.put(`${MSW_BASE_URL}/users/me`, {
        nickname,
        phone_number: phoneNumber,
      })
    },
    onSuccess: async (_, __, context) => {
      await refetch()
      triggerToast('success', '프로필이 성공적으로 변경되었습니다 ✅')
      options?.onSuccess?.(_, __, context)
    },
    onError: (error, variables, context) => {
      const status = error.status
      if (status === 400) {
        triggerToast('error', '잘못된 요청입니다')
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
      options?.onError?.(error, variables, context)
    },
  })
}
