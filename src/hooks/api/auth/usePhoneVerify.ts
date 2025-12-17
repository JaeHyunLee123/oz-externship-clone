import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserPhoneVerify } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function usePhoneVerify(
  options?: UseMutationOptions<unknown, Error, UserPhoneVerify>
) {
  const { triggerToast } = useToast()

  return useMutation<unknown, Error, UserPhoneVerify>({
    ...options,
    mutationKey: ['auth', 'phone', 'verify'],
    mutationFn: async ({ phoneNumber, verificationCode }) => {
      await api.post(`${MSW_BASE_URL}/auth/phone/verify`, {
        phone_number: phoneNumber,
        verification_code: verificationCode,
      })
    },
    onSuccess: () => {
      triggerToast('success', '인증 완료 ✅', '다음 단계를 진행해주세요')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.status
        if (status === 400) {
          triggerToast('error', '잘못된 인증코드 형식입니다')
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
