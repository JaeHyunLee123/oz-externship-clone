import { ListItemSkeleton } from '@/components'
import { Input } from '@/components/common/input'
import { BookmarkedRecruitmentCard } from '@/components/my-page'
import { SearchIcon } from 'lucide-react'
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import type { BookmarkedRecruitments } from '@/types/api-response-types/recruitment-response-types'
import { useCallback, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import EmptyResultState from '@/components/common/state/EmptyResultState'
import { useObserver } from '@/hooks'

const ESTIMATE_CARD_SIZE_PX = 260
const OVER_SCAN = 3


interface BookmarkedRecruitmentProps {
  bookmarkedRecruitmentInfinteQueryResult: UseInfiniteQueryResult<
    InfiniteData<BookmarkedRecruitments, unknown>,
    Error
  >
  searchState: string
  setSearchState: React.Dispatch<React.SetStateAction<string>>
}

export default function BookmarkedRecruitment({
  bookmarkedRecruitmentInfinteQueryResult,
  searchState,
  setSearchState,
}: BookmarkedRecruitmentProps) {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    bookmarkedRecruitmentInfinteQueryResult



  const recruitments = data ? data.pages.flatMap((page) => page.results) : []

  //버추얼리스트 스크롤 대상
  const parentRef = useRef<HTMLDivElement>(null)
  
  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // 무한 스크롤 옵저버 센서 부착용 훅
  const observerRef = useObserver(handleIntersect, {
    threshold: 0,
    root: parentRef.current,
  })

  //가상화 인스턴스
  const virtualizer = useVirtualizer({
    count: hasNextPage ? recruitments.length + 1 : recruitments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATE_CARD_SIZE_PX,
    overscan: OVER_SCAN,
  })

  const items = virtualizer.getVirtualItems()
  return (
    <div className="flex h-full flex-col max-h-[1500px]">
      <header className="mb-6 flex w-full flex-shrink-0 flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex w-full flex-col items-start justify-center gap-2 lg:w-auto">
          <h1 className="text-heading3 text-gray-900">북마크한 공고</h1>
          <span className="text-gray-600">
            나중에 지원할 스터디 공고들을 모아두었습니다.
          </span>
        </div>
        <div className="w-full lg:max-w-80">
          <Input
            placeholder="공고 제목으로 검색..."
            className="w-full"
            icon={SearchIcon}
            iconPosition="start"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
          />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto" ref={parentRef}>
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.length > 0 ? (
              items.map((virtualRow) => {
                const isLoaderRow = virtualRow.index > recruitments.length - 1
                const recruitment = recruitments[virtualRow.index]

                if (isLoaderRow && hasNextPage) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={(node) => {
                        // virtualizer 측정용 ref와 observer 타겟용 ref 모두 연결
                        virtualizer.measureElement(node)
                        if (node) observerRef.current = node
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="mb-2">
                          <ListItemSkeleton />
                        </div>
                      ))}
                    </div>
                  )
                }

                if (recruitment) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className="mb-2"
                    >
                      <BookmarkedRecruitmentCard recruitment={recruitment} />
                    </div>
                  )
                }

                return null
              })
            ) : (
              <EmptyResultState
                onClick={() => {
                  setSearchState('')
                }}
                className="p-2"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
