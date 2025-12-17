import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserEmailVerify } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function useEmailVerify(
  options?: UseMutationOptions<unknown, Error, UserEmailVerify>
) {
  const { triggerToast } = useToast()

  return useMutation<unknown, Error, UserEmailVerify>({
    ...options,
    mutationKey: ['auth', 'email', 'verify'],
    mutationFn: async ({ email, verificationCode }) => {
      await api.post(`${MSW_BASE_URL}/auth/email/verify`, {
        email: email,
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
            '이미 가입된 이메일입니다',
            '다른 이메일을 사용해주세요'
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
