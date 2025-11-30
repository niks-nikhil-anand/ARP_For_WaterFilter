import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationControlsProps) {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i)
                pages.push(-1) // Ellipsis
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push(-1) // Ellipsis
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push(-1)
                pages.push(currentPage)
                pages.push(-1)
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                    pageNum === -1 ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                            className="w-9"
                        >
                            {pageNum}
                        </Button>
                    )
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}
