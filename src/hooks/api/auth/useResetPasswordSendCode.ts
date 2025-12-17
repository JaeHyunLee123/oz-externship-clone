import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserResetPasswordSendCode } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export function useResetPasswordSendCode(
  options?: UseMutationOptions<unknown, Error, UserResetPasswordSendCode>
) {
  const { triggerToast } = useToast()

  return useMutation<unknown, Error, UserResetPasswordSendCode>({
    ...options,
    mutationKey: ['auth', 'reset-password', 'send'],
    mutationFn: async ({ email }) => {
      await api.post(`${MSW_BASE_URL}/auth/reset-password/send`, {
        email: email,
      })
    },
    onSuccess: () => {
      triggerToast(
        'success',
        '이메일 인증 코드를 전송했습니다 ✉️',
        '확인 후 입력해주세요'
      )
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.status
        if (status === 400) {
          triggerToast('error', '잘못된 이메일 형식입니다')
        } else {
          triggerToast('error', '잠시 후 다시 시도해주세요')
        }
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
    },
  })
}
