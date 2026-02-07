import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Activity, Info, ChevronDown } from 'lucide-react';
import { profileService } from '../../services/profileService';

const ActivityHeatmap = ({ streak = 0, joinedAt }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activityMap, setActivityMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalActiveDays, setTotalActiveDays] = useState(0);

    const years = useMemo(() => {
        const joinYear = joinedAt ? new Date(joinedAt).getFullYear() : currentYear;
        const yearList = [];
        for (let y = currentYear; y >= joinYear; y--) {
            yearList.push(y);
        }
        return yearList;
    }, [joinedAt, currentYear]);

    useEffect(() => {
        fetchActivityData();
    }, [selectedYear]);

    const fetchActivityData = async () => {
        try {
            setLoading(true);
            const res = await profileService.getUserActivity(selectedYear);
            setActivityMap(res.data || {});
            const total = Object.values(res.data || {}).filter(count => count > 0).length;
            setTotalActiveDays(total);
        } catch (error) {
            console.error("Failed to load activity", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generates a 2D array [col][row] for a specific month.
     * Rows = 7 (Sun-Sat)
     * Cols = Weeks (Variable)
     */
    const getMonthMatrix = (year, monthIndex) => {
        const matrix = []; // Array of columns. Each column is array of 7 days/nulls

        const firstDayOfMonth = new Date(year, monthIndex, 1);
        const lastDayOfMonth = new Date(year, monthIndex + 1, 0); // Last day
        const numDays = lastDayOfMonth.getDate();

        let currentDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
        let currentColumn = new Array(7).fill(null); // Init empty column

        // Fill initial padding (empty cells before 1st of month)
        // We don't strictly need to 'fill' them as null, but valid indices matter.

        // Loop through all days 1..31
        for (let day = 1; day <= numDays; day++) {
            const date = new Date(year, monthIndex, day);
            // Fix: Use local date components instead of toISOString() which converts to UTC and can shift the day
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            const dateStr = localDate.toISOString().split('T')[0];
            const count = activityMap[dateStr] || 0;

            // Place in current column at row 'currentDayOfWeek'
            currentColumn[currentDayOfWeek] = {
                date: date,
                dateStr: dateStr,
                count: count
            };

            // If Saturday (6), column is full -> push and start new
            if (currentDayOfWeek === 6) {
                matrix.push(currentColumn);
                currentColumn = new Array(7).fill(null);
                currentDayOfWeek = 0; // Reset to Sunday
            } else {
                currentDayOfWeek++;
            }
        }

        // Push last partial column if not empty
        // Check if column has any non-null data or if we just finished a full week loop
        // If currentDayOfWeek was reset to 0 in loop, we pushed already.
        // If currentDayOfWeek > 0, we have pending data.
        if (currentDayOfWeek > 0) {
            matrix.push(currentColumn);
        } else if (matrix.length === 0 && numDays > 0) {
            // Edge case: Month fits perfectly? Logic above handles it.
            // If loop finishes and dayOfWeek is 0, it means we pushed the last col inside the loop.
        }

        return matrix;
    };

    const getColor = (count) => {
        if (count === 0) return 'bg-gray-100/50'; // Very subtle placeholder
        if (count === 1) return 'bg-emerald-200';
        if (count === 2) return 'bg-emerald-300';
        if (count === 3) return 'bg-emerald-400';
        return 'bg-emerald-600';
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-gray-900">{totalActiveDays}</span>
                    <span className="text-gray-500 font-medium text-sm">active days in {selectedYear}</span>
                    <Info size={14} className="text-gray-300" />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-4 text-xs text-gray-400 font-medium">
                        <div>
                            Total active days: <span className="text-gray-900 font-bold ml-1">{totalActiveDays}</span>
                        </div>
                        <div>
                            Max streak: <span className="text-gray-900 font-bold ml-1">0</span>
                        </div>
                    </div>

                    {/* Year Dropdown Button Style */}
                    <div className="relative group">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold cursor-pointer transition-colors focus:outline-none"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Heatmap Container */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                    {monthNames.map((monthName, mIndex) => {
                        const matrix = getMonthMatrix(selectedYear, mIndex);

                        return (
                            <div key={monthName} className="flex flex-col gap-2">
                                {/* The Grid: Horizontal Columns */}
                                <div className="flex gap-[3px]">
                                    {matrix.map((col, colIndex) => (
                                        <div key={colIndex} className="flex flex-col gap-[3px]">
                                            {col.map((cell, row) => (
                                                <div
                                                    key={row}
                                                    className={`w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-[2px] ${cell ? getColor(cell.count) : 'bg-transparent'} relative group`}
                                                >
                                                    {cell && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 whitespace-nowrap bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none">
                                                            {cell.count} activities on {cell.date.toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 text-center">{monthName}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-end gap-1.5 items-center mt-2 text-[10px] text-gray-400">
                <span>Less</span>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-gray-100/50"></div>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-200"></div>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-300"></div>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400"></div>
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600"></div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
