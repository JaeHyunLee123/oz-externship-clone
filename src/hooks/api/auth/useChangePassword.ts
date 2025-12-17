import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import api from '@/utils/axios'
import { MSW_BASE_URL } from '@/constants/url-constants'
import type { AxiosError } from 'axios'
import useToast from '@/hooks/useToast'
import type { PasswordChangeFormType } from '@/schemas/form-schema/password-change-schema'

export default function useChangePassword(
  options?: UseMutationOptions<unknown, AxiosError, PasswordChangeFormType>
) {
  const { triggerToast } = useToast()
  // 비밀번호 관련 로직은 보안상 신경써야할 부분들이 더 많기에 별도 api가 존재하는 편이 바람직하나, 현재 상황에 새로 요구사항부터 생성하기 어려울 것 같다라는 판단으로 보안을 포기한 기능구현에만 초점을 맞춤.
  return useMutation<unknown, AxiosError, PasswordChangeFormType>({
    ...options,
    mutationKey: ['user'],
    mutationFn: async (payload) => {
      const verifyResponse = await api.get(`${MSW_BASE_URL}/users/me`, {
        params: { password: payload.currentPassword },
      })
      if (verifyResponse.data !== payload.currentPassword) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.')
      }
      return api.put(`${MSW_BASE_URL}/user`, {
        password: payload.newPassword,
      })
    },
    onSuccess: async (_, __, context) => {
      triggerToast('success', '비밀번호가 성공적으로 변경되었습니다 ✅')
      options?.onSuccess?.(_, __, context)
    },
    onError: (error, variables, context) => {
      const status = error.response?.status
      if (status === 400) {
        triggerToast('error', '비밀번호가 잘못 입력되었습니다.')
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요.')
      }
      options?.onError?.(error, variables, context)
    },
  })
}
