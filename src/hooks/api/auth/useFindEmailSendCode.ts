import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserFindEmailSendCode } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export function useFindEmailSendCode(
  options?: UseMutationOptions<unknown, Error, UserFindEmailSendCode>
) {
  const { triggerToast } = useToast()

  return useMutation<unknown, Error, UserFindEmailSendCode>({
    ...options,
    mutationKey: ['auth', 'find-email', 'send'],
    mutationFn: async ({ phoneNumber }) => {
      await api.post(`${MSW_BASE_URL}/auth/find-email/send-code`, {
        phone_number: phoneNumber,
      })
    },
    onSuccess: () => {
      triggerToast(
        'success',
        '휴대전화 인증 코드를 전송했습니다 ✉️',
        '확인 후 입력해주세요'
      )
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.status
        if (status === 400) {
          triggerToast('error', '잘못된 휴대전화 형식입니다')
        } else {
          triggerToast('error', '잠시 후 다시 시도해주세요')
        }
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
    },
  })
}
