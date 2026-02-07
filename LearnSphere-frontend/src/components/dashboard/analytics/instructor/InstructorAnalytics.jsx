import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
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
import InstructorSummaryStats from './InstructorSummaryStats';
import InstructorReports from './InstructorReports';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

const InstructorAnalytics = () => {
    console.log("Rendering InstructorAnalytics Component"); // DEBUG LOG
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for tab in query params, default to 'overview'
    const activeTab = searchParams.get('tab') || 'overview';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await analyticsService.getInstructorAnalytics();
                setData(result);
            } catch (err) {
                console.error("Failed to fetch instructor analytics", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'overview') {
            fetchData();
        } else {
            setLoading(false); // Reports handles its own loading
        }
    }, [activeTab]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    if (loading && activeTab === 'overview') return (
        <div className="space-y-6">
            <StatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <ChartSkeleton />
        </div>
    );

    if (error && activeTab === 'overview') return <div className="text-red-500 text-center p-12">{error}</div>;

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex space-x-1 bg-blue-100 p-2 rounded-lg w-fit border-2 border-blue-500">
                <button
                    onClick={() => handleTabChange('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => handleTabChange('reports')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'reports'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Detailed Reports
                </button>
            </div>

            {activeTab === 'reports' ? (
                <InstructorReports />
            ) : (
                data && (
                    <>
                        <InstructorSummaryStats data={data} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Total Students Per Course (Wider 2 cols) */}
                            <div className="lg:col-span-2 h-96">
                                <ChartCard
                                    title="Enrollment Overview"
                                    subtitle="Students per course"
                                    info="Total number of active students currently enrolled in your courses"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        {data.totalStudents && data.totalStudents.length > 0 ? (
                                            <BarChart data={data.totalStudents} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                                                    contentStyle={{
                                                        backgroundColor: '#1f2937',
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                                        color: '#f3f4f6'
                                                    }}
                                                    itemStyle={{ color: '#fff' }}
                                                    formatter={(value) => [value, 'Students']}
                                                />
                                                <Bar dataKey="value" fill="url(#colorStudents)" radius={[4, 4, 0, 0]} name="Students" barSize={40}>
                                                    <defs>
                                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#3B82F6" />
                                                            <stop offset="100%" stopColor="#2563EB" />
                                                        </linearGradient>
                                                    </defs>
                                                </Bar>
                                            </BarChart>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">No students enrolled yet</div>
                                        )}
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {/* Course Completion Rate Donut (1 col) */}
                            <div className="lg:col-span-1 h-96">
                                <ChartCard
                                    title="Completion Status"
                                    subtitle="Student progress"
                                    info="Distribution of students who completed or are in progress"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        {data.courseCompletionRate && data.courseCompletionRate.length > 0 ? (
                                            <PieChart margin={{ bottom: 20 }}>
                                                <Pie
                                                    data={data.courseCompletionRate}
                                                    cx="50%"
                                                    cy="45%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    labelLine={false}
                                                >
                                                    {data.courseCompletionRate.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                                    ))}
                                                </Pie>
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
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">No data available</div>
                                        )}
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </div>

                        {/* Quiz Score Distribution - Full Width */}
                        <div className="h-96">
                            <ChartCard
                                title="Assessment Performance"
                                subtitle="Grade distribution"
                                info="Number of students in each score range for recent assessments"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    {data.quizScoreDistribution && data.quizScoreDistribution.length > 0 ? (
                                        <BarChart data={data.quizScoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                                    color: '#f3f4f6'
                                                }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Students" barSize={50} />
                                        </BarChart>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-400">No quiz data available</div>
                                    )}
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default InstructorAnalytics;
