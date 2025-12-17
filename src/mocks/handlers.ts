import { MSW_BASE_URL } from '@/constants/url-constants'
import { http, HttpResponse } from 'msw'
import { bookmarkedRecruitmentsHandlers } from '@/mocks/handlers/bookmarked-recruitments-handler'
import { appliedRecruitmentsHandlers } from '@/mocks/handlers/applied-recruitments-handler'
import { chatHandlers } from '@/mocks/handlers/chat-handler'
import { bookmarkedLecturesHandlers } from '@/mocks/handlers/bookmarked-lectures-handler'
import { notificationHandlers } from '@/mocks/handlers/notification-handler'
import { completedStudiesHandlers } from '@/mocks/handlers/completed-study-handler'
import { authHandlers } from '@/mocks/handlers/auth-handler'
import { userRecoverHandlers } from '@/mocks/handlers/user-recover-handler'
import { userInfoHandlers } from '@/mocks/handlers/user-info-handler'

const getTestMSW = http.get(`${MSW_BASE_URL}/`, () => {
  return HttpResponse.text('msw is working!')
})

export const handlers = [
  getTestMSW,
  ...bookmarkedRecruitmentsHandlers,
  ...appliedRecruitmentsHandlers,
  ...authHandlers,
  ...chatHandlers,
  ...bookmarkedLecturesHandlers,
  ...notificationHandlers,
  ...completedStudiesHandlers,
  ...userRecoverHandlers,
  ...userInfoHandlers,
]
