import React from 'react';
import { Users, BookOpen, Star, TrendingUp } from 'lucide-react';

const InstructorSummaryStats = ({ data }) => {
    const summary = data?.summary || {};

    const stats = [
        {
            label: "Total Students",
            value: summary.totalStudents || 0,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            shadow: "shadow-blue-500/30",
        },
        {
            label: "Active Courses",
            value: summary.activeCourses || 0,
            icon: BookOpen,
            color: "from-purple-500 to-purple-600",
            shadow: "shadow-purple-500/30",
        },
        {
            label: "Avg. Course Rating",
            value: summary.avgRating || 4.8,
            icon: Star,
            color: "from-amber-400 to-yellow-500",
            shadow: "shadow-amber-500/30",
        },
        {
            label: "Completion Rate",
            value: summary.completionRate || "0%",
            icon: TrendingUp,
            color: "from-emerald-500 to-green-600",
            shadow: "shadow-emerald-500/30",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{item.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow}`}>
                            <Icon size={24} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InstructorSummaryStats;
