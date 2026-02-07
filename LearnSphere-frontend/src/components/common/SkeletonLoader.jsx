import React from 'react';

const SkeletonLoader = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`}></div>
    );
};

export const ChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700 h-[400px] w-full">
        <div className="space-y-3 mb-6">
            <SkeletonLoader className="h-6 w-1/3" />
            <SkeletonLoader className="h-4 w-1/4" />
        </div>
        <SkeletonLoader className="h-64 w-full rounded-lg" />
    </div>
);

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl shadow bg-white border">
                <div className="flex justify-between items-center">
                    <div className="space-y-2 w-full">
                        <SkeletonLoader className="h-4 w-20" />
                        <SkeletonLoader className="h-8 w-12" />
                    </div>
                    <SkeletonLoader className="h-12 w-12 rounded-xl" />
                </div>
            </div>
        ))}
    </div>
);

export default SkeletonLoader;
