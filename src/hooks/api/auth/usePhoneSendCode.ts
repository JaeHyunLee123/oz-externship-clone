import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserPhoneSendCode } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function usePhoneSendCode(
  options?: UseMutationOptions<unknown, Error, UserPhoneSendCode>
) {
  const { triggerToast } = useToast()

  return useMutation<unknown, Error, UserPhoneSendCode>({
    ...options,
    mutationKey: ['auth', 'phone', 'send-code'],
    mutationFn: async ({ phoneNumber }) => {
      await api.post(`${MSW_BASE_URL}/auth/phone/send-code`, {
        phone_number: phoneNumber,
      })
    },
    onSuccess: () => {
      triggerToast(
        'success',
        '휴대전화 번호 인증 코드를 전송했습니다 ✉️',
        '확인 후 입력해주세요'
      )
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.status
        if (status === 400) {
          triggerToast('error', '잘못된 휴대전화 번호 형식입니다')
        } else if (status === 409) {
          triggerToast(
            'error',
            '이미 가입된 휴대전화 번호입니다',
            '다른 번호를 사용해주세요'
          )
        } else {
          triggerToast('error', '잠시 후 다시 시도해주세요')
        }
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
    },
  })
}
