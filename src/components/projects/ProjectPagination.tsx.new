import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProjectPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const ProjectPagination: React.FC<ProjectPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if less than 7
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first and last page
      pageNumbers.push(1);
      
      // Add ellipsis and surrounding pages for current page
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, 4, '...', totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...', totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...'); 
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={typeof page === 'number' ? "cursor-pointer" : ""}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProjectPagination;
