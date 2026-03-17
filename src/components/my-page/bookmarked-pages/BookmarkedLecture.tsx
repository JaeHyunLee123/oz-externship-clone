import { ListItemSkeleton } from '@/components'
import { Input } from '@/components/common/input'
import EmptyResultState from '@/components/common/state/EmptyResultState'
import BookmarkedLectureCard from '@/components/my-page/bookmarked-lecture/BookmarkedLectureCard'
import type { BookmarkedLectures } from '@/types/api-response-types/lecture-response-type'
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { SearchIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

const ESTIMATE_CARD_SIZE_PX = 260


interface BookmarkedLectureProps {
  bookmarkedLecturesInfiniteQueryResult: UseInfiniteQueryResult<
    InfiniteData<BookmarkedLectures, unknown>,
    Error
  >

  searchState: string
  setSearchState: React.Dispatch<React.SetStateAction<string>>
}

export default function BookmarkedLecture({
  bookmarkedLecturesInfiniteQueryResult,
  searchState,
  setSearchState,
}: BookmarkedLectureProps) {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    bookmarkedLecturesInfiniteQueryResult



  const lectures = data ? data.pages.flatMap((page) => page.results) : []

  //버추얼리스트 스크롤 대상
  const parentRef = useRef<HTMLDivElement>(null)
  //가상화 인스턴스
  const virtualizer = useVirtualizer({
    count: hasNextPage ? lectures.length + 1 : lectures.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATE_CARD_SIZE_PX,
    overscan: 5,
  })

  //무한 스크롤 트리거
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= lectures.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    lectures.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    virtualizer,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    virtualizer.getVirtualItems(),
  ])

  const items = virtualizer.getVirtualItems()
  return (
    <div className="flex h-full flex-col max-h-[1500px]">
      <header className="mb-6 flex flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex w-full flex-col gap-2 lg:w-auto">
          <h1 className="text-heading3 text-gray-900">북마크한 강의</h1>
          <span className="font-medium text-gray-600">
            나중에 수강할 강의들을 모아두었습니다
          </span>
        </div>
        <div className="w-full flex-1 lg:max-w-80">
          <Input
            placeholder="강의명이나 강사명으로 검색..."
            icon={SearchIcon}
            iconPosition="start"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
          />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto " ref={parentRef}>
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
                const isLoaderRow = virtualRow.index > lectures.length - 1
                const lecture = lectures[virtualRow.index]

                if (isLoaderRow && isFetchingNextPage) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                    >
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="mb-2">
                          <ListItemSkeleton />
                        </div>
                      ))}
                    </div>
                  )
                }

                if (lecture) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className="mb-2"
                    >
                      <BookmarkedLectureCard lecture={lecture} />
                    </div>
                  )
                }

                return null
              })
            ) : (
              <EmptyResultState
                className="p-2"
                onClick={() => {
                  setSearchState('')
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
