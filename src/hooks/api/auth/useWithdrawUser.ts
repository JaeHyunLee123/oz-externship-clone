import { MSW_BASE_URL } from '@/constants/url-constants'
import api from '@/utils/axios'
import useToast from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { useLoginStore } from '@/store/useLoginStore'
import { clearAccessToken } from '@/utils'
import type { AxiosError } from 'axios'
import type { WithdrawalRequest } from '@/types/api-request-types/auth-request-types'
import { useNavigate } from 'react-router'

export default function useWithdrawUser() {
  const { triggerToast } = useToast()
  const { setIsLoggedIn } = useLoginStore()
  const navigate = useNavigate()

  return useMutation<void, AxiosError, WithdrawalRequest>({
    mutationKey: ['user', 'withdraw'],
    mutationFn: async (payload) => {
      return await api.delete(`${MSW_BASE_URL}/auth/withdraw`, {
        data: payload,
      })
    },
    onSuccess: async () => {
      await api.post(`${MSW_BASE_URL}/auth/logout`)
      triggerToast('success', '회원 탈퇴가 완료되었습니다 ✅')
      clearAccessToken()
      setIsLoggedIn(false)
      navigate('/')
    },

    onError: (error) => {
      const status = error.response?.status
      if (status === 400) {
        triggerToast('error', '잘못된 요청입니다')
      } else if (status === 401) {
        triggerToast('error', '로그인이 필요합니다')
      } else {
        triggerToast('error', '잠시 후 다시 시도해주세요')
      }
    },
  })
}
