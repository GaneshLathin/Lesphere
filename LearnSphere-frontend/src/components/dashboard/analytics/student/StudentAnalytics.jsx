// src/components/dashboard/analytics/student/StudentAnalytics.jsx
import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import ChartCard from '../common/ChartCard';
import analyticsService from '../../../../services/analyticsService';
import { ChartSkeleton, StatsSkeleton } from '../../../common/SkeletonLoader';
import SummaryStats from './SummaryStats';

const StudentAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await analyticsService.getStudentAnalytics();
                // Simulate network delay for skeleton demo
                // await new Promise(resolve => setTimeout(resolve, 1000));
                setData(result);
            } catch (err) {
                console.error("Failed to fetch student analytics", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="space-y-6">
            <StatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    );
    if (error) return <div className="text-red-500 text-center p-12">{error}</div>;
    if (!data) return null;

    return (
        <div className="space-y-8">
            <SummaryStats data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Completion Progress */}
                <ChartCard
                    title="Course Completion Progress"
                    subtitle="Your learning trajectory"
                    info="Shows percentage of courses completed based on your enrollments"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        {data.courseCompletion && data.courseCompletion.length > 0 ? (
                            <AreaChart data={data.courseCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis
                                    dataKey="courseName"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                        color: '#f3f4f6'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completionPercentage"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                    name="Completion %"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">No enrollment data available</div>
                        )}
                    </ResponsiveContainer>
                </ChartCard>

                {/* Quiz Performance */}
                <ChartCard
                    title="Quiz Performance"
                    subtitle="Score history per course"
                    info="Your scores across different course assessments"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        {data.quizPerformance && data.quizPerformance.length > 0 ? (
                            <LineChart data={data.quizPerformance} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis
                                    dataKey="courseName"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    angle={0}
                                    textAnchor="middle"
                                    tickFormatter={(val) => {
                                        if (!val) return "";
                                        return val.length > 12 ? `${val.substring(0, 10)}...` : val;
                                    }}
                                />
                                <YAxis stroke="#9CA3AF" domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                        color: '#f3f4f6'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value, name) => [`${value}%`, name]}
                                    labelFormatter={(label) => `Course: ${label}`}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} dot={{ r: 4, strokeWidth: 0 }} name="Your Score" />
                                <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Class Average" />
                            </LineChart>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">No quiz attempts yet</div>
                        )}
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 h-auto">
                {/* Skill Growth Radar */}
                <div className="md:col-span-1">
                    <ChartCard
                        title="Skill Proficiency"
                        subtitle="Growth by category"
                        info="Radar chart visualizing your proficiency levels across subjects"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            {data.skillGrowth && data.skillGrowth.length > 0 ? (
                                <RadarChart outerRadius="65%" data={data.skillGrowth}>
                                    <PolarGrid stroke="#E5E7EB" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Proficiency" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                            color: '#f3f4f6'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center z-10 pt-16">
                                    <p className="font-medium">No skill data available</p>
                                    <p className="text-xs mt-1 text-gray-400">Complete quizzes to see your skills</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Weekly Learning Activity */}
                <div className="md:col-span-1">
                    <ChartCard
                        title="Weekly Activity"
                        subtitle="Hours learned"
                        info="Bar chart showing estimated hours spent on the platform each day of the last week"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            {data.weeklyLearningTime && data.weeklyLearningTime.length > 0 ? (
                                <BarChart data={data.weeklyLearningTime}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="day" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="hours" fill="#8884d8" radius={[4, 4, 0, 0]} name="Hours Spent" />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">No activity recorded</div>
                            )}
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default StudentAnalytics;
