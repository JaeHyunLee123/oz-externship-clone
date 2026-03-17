import { Outlet } from 'react-router'
import { MyPageSideBar } from '@/components/my-page'
import useWindowWidth from '@/hooks/useWindowWidth'
import { MD_WIDTH_PIXEL } from '@/constants/break-points'
import MobileMyPageNavBar from '@/components/my-page/mobile-nav-bar/MobileMypageNavBar'

export default function MyPageLayout() {
  const width = useWindowWidth()

  return (
    <div className="flex flex-col items-center justify-start gap-8 p-8 md:flex-row md:items-start md:justify-center">
      {width < MD_WIDTH_PIXEL ? <MobileMyPageNavBar /> : <MyPageSideBar />}

      <div className="flex min-h-[700px] flex-1 flex-col rounded-lg border border-gray-200 bg-white p-8">
        <Outlet />
      </div>
    </div>
  )
}
