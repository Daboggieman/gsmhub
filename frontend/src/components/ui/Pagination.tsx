import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Page window with ellipsis: always shows the first and last page, the
 * current page with one neighbour on each side, and a gap marker where
 * pages are skipped.
 */
function buildPageList(currentPage: number, totalPages: number): (number | 'gap-left' | 'gap-right')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'gap-left' | 'gap-right')[] = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);
  if (windowStart > 2) pages.push('gap-left');
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
  if (windowEnd < totalPages - 1) pages.push('gap-right');
  pages.push(totalPages);
  return pages;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl, searchParams }) => {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value as string);
        }
      }
    });
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const clamped = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = buildPageList(clamped, totalPages);

  const navBtn =
    'w-10 h-10 flex items-center justify-center rounded-lg font-label-md transition-colors';

  return (
    <nav className="flex justify-center items-center space-x-2 mt-12" aria-label="Pagination">
      {/* Previous Button */}
      {clamped > 1 ? (
        <Link
          href={createPageUrl(clamped - 1)}
          aria-label="Previous page"
          className={`${navBtn} border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_left</span>
        </Link>
      ) : (
        <span
          className={`${navBtn} border border-outline-variant/50 text-outline cursor-not-allowed`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </span>
      )}

      {/* Page Numbers with ellipsis */}
      <div className="flex space-x-1">
        {pages.map((entry) => {
          if (entry === 'gap-left' || entry === 'gap-right') {
            return (
              <span
                key={entry}
                className="w-10 h-10 flex items-center justify-center text-outline select-none"
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const isActive = entry === clamped;
          return (
            <Link
              key={entry}
              href={createPageUrl(entry)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${entry}`}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md tabular-nums transition-colors ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {entry}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {clamped < totalPages ? (
        <Link
          href={createPageUrl(clamped + 1)}
          aria-label="Next page"
          className={`${navBtn} border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_right</span>
        </Link>
      ) : (
        <span
          className={`${navBtn} border border-outline-variant/50 text-outline cursor-not-allowed`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </span>
      )}
    </nav>
  );
};

export default Pagination;
