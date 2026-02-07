import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Calculate start and end index for showing "Showing X-Y of Z"
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{startItem}</span> to <span className="font-medium text-gray-900">{endItem}</span> of <span className="font-medium text-gray-900">{totalItems}</span> results
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>

                {/* Simple page indicator for now. Can be expanded to [1, 2, ... 10] */}
                <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        // Show all if pages < 7. If more, show current window (Simplified for now)
                        if (totalPages > 7) {
                            if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                            }
                            return null;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
