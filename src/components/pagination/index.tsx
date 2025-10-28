import React from "react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  siblingCount?: number; // how many pages to show on each side of current
  boundaryCount?: number; // how many pages to show at the start and end
};

const DOTS = "...";

type PaginationParams = Omit<Props, "onPageChange">;
function usePagination({ page, totalPages, siblingCount = 1, boundaryCount = 1 }: PaginationParams) {
  const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2; // pages + dots
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }).map((_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1);
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1);

  const firstPages = Array.from({ length: boundaryCount }).map((_, i) => i + 1);
  const lastPages = Array.from({ length: boundaryCount }).map((_, i) => totalPages - boundaryCount + 1 + i);

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = siblingCount * 2 + boundaryCount + 2;
    const leftRange = Array.from({ length: leftItemCount }).map((_, i) => i + 1);
    return [...leftRange, DOTS, ...lastPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = siblingCount * 2 + boundaryCount + 2;
    const rightRange = Array.from({ length: rightItemCount }).map((_, i) => totalPages - rightItemCount + 1 + i);
    return [...firstPages, DOTS, ...rightRange];
  }

  // both dots
  const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }).map((_, i) => leftSiblingIndex + i);
  return [...firstPages, DOTS, ...middleRange, DOTS, ...lastPages];
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange, siblingCount = 1, boundaryCount = 1 }) => {
  const paginationRange = usePagination({ page, totalPages, siblingCount, boundaryCount });

  if (totalPages === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300"
        disabled={page === 1}
        title="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {paginationRange.map((p, idx) => {
        if (p === DOTS) {
          return (
            <span key={`dots-${idx}`} className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">{DOTS}</span>
          );
        }
        const pageNumber = Number(p);
        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`px-2 py-1 ${page === pageNumber ? "rounded bg-brand-500 dark:bg-brand-400 text-white" : "rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-navy-700 bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300"}`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300"
        disabled={page === totalPages}
        title="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
