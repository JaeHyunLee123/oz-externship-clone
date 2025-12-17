import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import api from '@/utils/axios'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function useUserRecoverSendCode(
  options?: UseMutationOptions<void, Error, string>
) {
  const { triggerToast } = useToast()

  return useMutation({
    mutationFn: async (email) => {
      await api.post(`${MSW_BASE_URL}/auth/recover-account/send`, { email })
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
        if (error.status === 400) {
          triggerToast(
            'error',
            '탈퇴 계정이 아니거나 존재하지않는 이메일입니다.'
          )
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
