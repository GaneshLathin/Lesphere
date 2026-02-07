import React from 'react';
import { Award, BookOpen, Clock, Target } from 'lucide-react';

const SummaryStats = ({ data }) => {
    // Calculate derived stats from the data prop if possible, or use fallbacks
    const totalCourses = data?.courseCompletion?.length || 0;
    const avgScore = data?.quizPerformance?.length > 0
        ? Math.round(data.quizPerformance.reduce((acc, curr) => acc + curr.score, 0) / data.quizPerformance.length)
        : 0;
    const totalMinutes = data?.totalLearningMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeDisplay = `${hours}h ${mins}m`;

    // Mock "Current Streak" or similar engagement metric
    const streak = 3;

    const stats = [
        {
            label: "Active Courses",
            value: totalCourses,
            icon: BookOpen,
            color: "from-blue-500 to-blue-600",
            shadow: "shadow-blue-500/30",
        },
        {
            label: "Avg. Quiz Score",
            value: `${avgScore}%`,
            icon: Target,
            color: "from-purple-500 to-purple-600",
            shadow: "shadow-purple-500/30",
        },
        {
            label: "Study Hours",
            value: timeDisplay,
            icon: Clock,
            color: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/30",
        },
        {
            label: "Certificates",
            value: "2", // Hardcoded mock for now as it wasn't in the DTO yet
            icon: Award,
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

export default SummaryStats;
