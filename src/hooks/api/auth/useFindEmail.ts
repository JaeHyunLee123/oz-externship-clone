import { MSW_BASE_URL } from '@/constants/url-constants'
import useToast from '@/hooks/useToast'
import type { UserFindEmail } from '@/types/api-request-types/auth-request-types'
import api from '@/utils/axios'
import { formattedPhoneToE164KR } from '@/utils/formatted-phone'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router'

export function useFindEmail(
  options?: UseMutationOptions<string, Error, UserFindEmail>
) {
  const { triggerToast } = useToast()
  const navigate = useNavigate()

  return useMutation<string, Error, UserFindEmail>({
    ...options,
    mutationKey: ['info', 'reset-password'],
    mutationFn: async ({ name, phoneNumber, verificationCode }) => {
      const response = await api.post(`${MSW_BASE_URL}/info/find-email/`, {
        name: name,
        phone_number: formattedPhoneToE164KR(phoneNumber),
        code: verificationCode,
      })
      const email = response.data.email
      return email
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.status
        if (status === 400) {
          triggerToast('error', '인증코드 검증에 실패했습니다')
        } else if (status === 404) {
          triggerToast(
            'warning',
            '가입하지 않은 사용자 입니다',
            '회원가입을 진행해주세요'
          )
          navigate('/auth/signup')
        } else {
          triggerToast('error', '잠시 후 다시 시도해주세요')
        }
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
    },
  })
}
