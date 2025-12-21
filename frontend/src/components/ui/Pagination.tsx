import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: { [key: string]: string | string[] | undefined };
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

  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1;
          if (totalPages > 5) {
            if (currentPage > 3) {
              pageNum = currentPage - 2 + i;
            }
            if (pageNum > totalPages) {
              pageNum = totalPages - 4 + i;
            }
          }
          
          if (pageNum > 0 && pageNum <= totalPages) {
            const isActive = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {pageNum}
              </Link>
            );
          }
          return null;
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      )}
    </div>
  );
};

export default Pagination;
