// src/components/dashboard/analytics/admin/AdminAnalytics.jsx
import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Activity, Users, Database, Server } from 'lucide-react';
import ChartCard from '../common/ChartCard';
import analyticsService from '../../../../services/analyticsService';
import { ChartSkeleton, StatsSkeleton } from '../../../common/SkeletonLoader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await analyticsService.getAdminAnalytics();
                setData(result);
            } catch (err) {
                console.error("Failed to fetch admin analytics", err);
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
        <div className="space-y-6">
            {/* System Health Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Server Load</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{data.systemHealth ? data.systemHealth.serverLoad + '%' : 'N/A'}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                        <Server size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">DB Latency</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{data.systemHealth ? data.systemHealth.dbLatency : 'N/A'}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg shadow-green-500/30">
                        <Database size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{data.systemHealth ? data.systemHealth.uptime : 'N/A'}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/30">
                        <Activity size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Rate</p>
                        <h3 className="text-3xl font-bold text-text-gray-900 dark:text-gray-100 mt-1">{data.systemHealth ? data.systemHealth.errors + '%' : 'N/A'}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg shadow-red-500/30">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Role Distribution */}
                <ChartCard
                    title="User Role Distribution"
                    subtitle="Breakdown of platform users"
                    info="Current distribution of users across different roles (Student, Instructor, Admin)"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        {data.userRoleDistribution && data.userRoleDistribution.length > 0 ? (
                            <PieChart>
                                <Pie
                                    data={data.userRoleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.userRoleDistribution.map((entry, index) => (
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
                            <div className="flex h-full items-center justify-center text-gray-400">No user data available</div>
                        )}
                    </ResponsiveContainer>
                </ChartCard>

                {/* Platform Growth */}
                <ChartCard
                    title="Platform Growth"
                    subtitle="New user registrations"
                    info="Total number of users registered on the platform month over month"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        {data.platformGrowth && data.platformGrowth.length > 0 ? (
                            <AreaChart data={data.platformGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" name="Total Users" />
                            </AreaChart>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">No growth data yet</div>
                        )}
                    </ResponsiveContainer>
                </ChartCard>

                {/* Top Performing Courses (New Addition) */}
                <div className="lg:col-span-2 h-96">
                    <ChartCard
                        title="Top Performing Courses"
                        subtitle="Highest enrollment & engagement"
                        info="Courses with the most active students this month"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            {data.topCourses && data.topCourses.length > 0 ? (
                                <BarChart data={data.topCourses}>
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
                                    <Bar dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Active Students" barSize={40} />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">No course data available</div>
                            )}
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
