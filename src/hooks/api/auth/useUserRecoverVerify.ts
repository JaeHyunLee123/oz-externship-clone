import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserRecoverVerifyBody } from '@/types/api-request-types/user-recover-request-types'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function useUserRecoverVerify(
  options?: UseMutationOptions<void, Error, UserRecoverVerifyBody>
) {
  const { triggerToast } = useToast()

  return useMutation({
    mutationFn: async ({ email, verificationCode }) => {
      await api.post(`${MSW_BASE_URL}/auth/recover-account/verify`, {
        email,
        verification_code: verificationCode,
      })
    },
    onSuccess: () => {
      triggerToast('success', '인증 완료 ✅', '확인 버튼을 눌러주세요.')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.status === 400) {
          triggerToast('error', '잘못된 인증코드입니다.')
        } else {
          triggerToast('error', '잠시 후 다시 시도해주세요.')
        }
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요.')
      }
    },
    ...options,
  })
}
