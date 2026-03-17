import { Dropdown, ListItemSkeleton } from '@/components'
import { Input } from '@/components/common/input'
import EmptyResultState from '@/components/common/state/EmptyResultState'
import { BookmarkedRecruitmentCard } from '@/components/my-page'
import BookmarkedLectureCard from '@/components/my-page/bookmarked-lecture/BookmarkedLectureCard'
import { useWindowWidth } from '@/hooks'
import type { BookmarkedLectures } from '@/types/api-response-types/lecture-response-type'
import type { BookmarkedRecruitments } from '@/types/api-response-types/recruitment-response-types'
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

const ENTIRE = '전체'
const RECRUITMENT = '공고'
const LECTURE = '강의'

const ESTIMATE_CARD_SIZE_PX = 260
const OVER_SCAN = 3

type optionKey = 'entire' | 'lecture' | 'recruitment'
type optionValue = typeof ENTIRE | typeof RECRUITMENT | typeof LECTURE

const OPTION_MAP: Record<optionKey, optionValue> = {
  entire: ENTIRE,
  lecture: LECTURE,
  recruitment: RECRUITMENT,
}

interface BookmarkedContentProps {
  initialOption?: optionKey
  bookmarkedRecruitmentInfinteQueryResult: UseInfiniteQueryResult<
    InfiniteData<BookmarkedRecruitments, unknown>,
    Error
  >
  bookmarkedLecturesInfiniteQueryResult: UseInfiniteQueryResult<
    InfiniteData<BookmarkedLectures, unknown>,
    Error
  >
  searchState: string
  setSearchState: React.Dispatch<React.SetStateAction<string>>
}

export default function BookmarkedContent({
  initialOption = 'entire',
  bookmarkedRecruitmentInfinteQueryResult,
  bookmarkedLecturesInfiniteQueryResult,
  searchState,
  setSearchState,
}: BookmarkedContentProps) {
  const bookmarkedDropdownOption: { label: string }[] = useMemo(
    () => [{ label: ENTIRE }, { label: RECRUITMENT }, { label: LECTURE }],
    []
  )

  const [selectedOption, setSelectedOption] = useState<string>(
    OPTION_MAP[initialOption]
  )

  const {
    data: recruitmentsInfiniteData,
    isFetchingNextPage: isFetchingNextRecruitments,
    fetchNextPage: fetchNextRecruitments,
    hasNextPage: hasNextRecruitment,
  } = bookmarkedRecruitmentInfinteQueryResult

  const {
    data: lecturesInfiniteData,
    isFetchingNextPage: isFetchingNextLectures,
    fetchNextPage: fetchNextLectures,
    hasNextPage: hasNextLecture,
  } = bookmarkedLecturesInfiniteQueryResult

  const lectures = useMemo(
    () =>
      lecturesInfiniteData
        ? lecturesInfiniteData.pages.flatMap((page) => page.results)
        : [],
    [lecturesInfiniteData]
  )

  const recruitments = useMemo(
    () =>
      recruitmentsInfiniteData
        ? recruitmentsInfiniteData.pages.flatMap((page) => page.results)
        : [],
    [recruitmentsInfiniteData]
  )

  const contents = useMemo(() => {
    if (selectedOption.startsWith(LECTURE)) {
      return [...lectures]
    }

    if (selectedOption.startsWith(RECRUITMENT)) {
      return [...recruitments]
    }

    return [...recruitments, ...lectures]
  }, [selectedOption, recruitments, lectures])

  const additionalVirtualItemCount =
    (hasNextRecruitment ? 1 : 0) + (hasNextLecture ? 1 : 0)

  //버추얼리스트 스크롤 대상
  const parentRef = useRef<HTMLDivElement>(null)
  //가상화 인스턴스
  const virtualizer = useVirtualizer({
    count: contents.length + additionalVirtualItemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATE_CARD_SIZE_PX,
    overscan: OVER_SCAN,
  })

  //무한 스크롤 트리거
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= contents.length - 1 &&
      hasNextRecruitment &&
      !isFetchingNextRecruitments
    ) {
      fetchNextRecruitments()
    }

    if (
      lastItem.index >= contents.length - 1 &&
      hasNextLecture &&
      !isFetchingNextLectures
    ) {
      fetchNextLectures()
    }
  }, [
    contents.length,
    fetchNextLectures,
    fetchNextRecruitments,
    hasNextLecture,
    hasNextRecruitment,
    isFetchingNextLectures,
    isFetchingNextRecruitments,
    virtualizer,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    virtualizer.getVirtualItems(),
  ])

  const windowWidth = useWindowWidth()

  const items = virtualizer.getVirtualItems()

  //북마크한 공고와 강의 개수를 메뉴에 표시
  useEffect(() => {
    if (recruitments.length > 0) {
      const temp = `${RECRUITMENT} (${recruitments.length})`
      bookmarkedDropdownOption[1].label = temp

      if (selectedOption.startsWith(RECRUITMENT)) {
        setSelectedOption(temp)
      }
    }

    if (lectures.length > 0) {
      const temp = `${LECTURE} (${lectures.length})`
      bookmarkedDropdownOption[2].label = temp

      if (selectedOption.startsWith(LECTURE)) {
        setSelectedOption(temp)
      }
    }

    if (recruitments.length > 0 || lectures.length > 0) {
      const temp = `${ENTIRE} (${lectures.length + recruitments.length})`
      bookmarkedDropdownOption[0].label = temp

      if (selectedOption.startsWith(ENTIRE)) {
        setSelectedOption(temp)
      }
    }
  }, [bookmarkedDropdownOption, selectedOption, recruitments, lectures])

  const navigate = useNavigate()

  const handleDropdownSelect = (label: string) => {
    setSelectedOption(label)

    if (label.startsWith(RECRUITMENT)) {
      navigate('/my-page/bookmarked/recruitment')
    } else if (label.startsWith(LECTURE)) {
      navigate('/my-page/bookmarked/lecture')
    } else {
      navigate('/my-page/bookmarked')
    }
  }

  //공고를 선택했는지 여부
  const isRecruitmentSelected =
    selectedOption.startsWith(ENTIRE) || selectedOption.startsWith(RECRUITMENT)
  //강의를 선택했는지 여부
  const isLectureSelected =
    selectedOption.startsWith(ENTIRE) || selectedOption.startsWith(LECTURE)

  return (
    <div className="flex h-full flex-col">
      <header className="mb-6 flex w-full flex-shrink-0 flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="w-full flex-col items-start justify-center gap-2">
          <h1 className="text-heading5 text-gray-900">북마크한 공고</h1>
          <span className="text-sm text-gray-600">
            저장한 스터디 공고 및 강의
          </span>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="w-full lg:max-w-80">
            <Dropdown
              value={selectedOption}
              onSelect={handleDropdownSelect}
              options={bookmarkedDropdownOption}
            />
          </div>

          <div className="w-full lg:max-w-80">
            <Input
              icon={SearchIcon}
              iconPosition="start"
              placeholder="공고 및 강의 검색..."
              className="w-full"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
            />
          </div>
        </div>
      </header>
      <main
        className="flex-1 overflow-y-auto"
        ref={parentRef}
        style={{
          width: `${(windowWidth * 7) / 10}px`,
        }}
      >
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
                const isLoaderRow = virtualRow.index > contents.length - 1
                const content = contents[virtualRow.index]

                if (
                  isLoaderRow &&
                  (isFetchingNextLectures || isFetchingNextRecruitments)
                ) {
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

                if (!content) return null

                //content type === lecture -> lecture card
                if ('instructor' in content && isLectureSelected) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className="mb-2"
                    >
                      <BookmarkedLectureCard lecture={content} />
                    </div>
                  )
                }

                //content type === recruitment -> recruitment card
                if ('tags' in content && isRecruitmentSelected) {
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className="mb-2"
                    >
                      <BookmarkedRecruitmentCard recruitment={content} />
                    </div>
                  )
                }
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
