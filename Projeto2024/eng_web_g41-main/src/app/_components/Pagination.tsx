"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;

    if (totalPages > maxPageNumbersToShow) {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 ${currentPage === i ? "bg-[hsl(206,87%,15%)] text-white rounded-full" : ""}`}
          >
            {i}
          </button>
        );
      }

      if (startPage > 1) {
        pageNumbers.unshift(<span key="start-ellipsis" className="px-4 py-2">...</span>);
        pageNumbers.unshift(
          <button
            key={1}
            onClick={() => onPageChange(1)}
            className="px-4 py-2"
          >
            1
          </button>
        );
      }

      if (endPage < totalPages) {
        pageNumbers.push(<span key="end-ellipsis" className="px-4 py-2">...</span>);
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2"
          >
            {totalPages}
          </button>
        );
      }
    } else if (totalPages != 1){
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 ${currentPage === i ? "bg-[hsl(206,87%,15%)] text-white rounded-full" : ""}`}
          >
            {i}
          </button>
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-center items-center mt-[25px]">
      {currentPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2"
          >
            {"<<"}
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="px-4 py-2"
          >
            {"<"}
          </button>
        </>
      )}
      {renderPageNumbers()}
      {currentPage < totalPages && (
        <>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="px-4 py-2"
          >
            {">"}
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2"
          >
            {">>"}
          </button>
        </>
      )}
    </div>
  );
};

export default Pagination;
