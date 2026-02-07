// src/components/dashboard/analytics/common/ChartCard.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const ChartCard = ({ title, subtitle, children, info, action }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {title}
                        {info && (
                            <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 transition-opacity opacity-0 group-hover:opacity-100">
                                    {info}
                                </div>
                            </div>
                        )}
                    </h3>
                    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
