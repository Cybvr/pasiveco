"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DashboardPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
}

export default function DashboardPagination({
  currentPage,
  totalPages,
  onPageChange,
}: DashboardPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const pages = getVisiblePages(currentPage, safeTotalPages)

  return (
    <Pagination className="justify-between px-6 py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault()
              if (currentPage > 1) {
                onPageChange(currentPage - 1)
              }
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>

      <PaginationContent>
        {pages.map((page, index) => {
          const previousPage = pages[index - 1]
          const shouldRenderEllipsis = previousPage && page - previousPage > 1

          return (
            <div key={page} className="flex items-center">
              {shouldRenderEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </div>
          )
        })}
      </PaginationContent>

      <PaginationContent>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault()
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1)
              }
            }}
            className={currentPage === safeTotalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
