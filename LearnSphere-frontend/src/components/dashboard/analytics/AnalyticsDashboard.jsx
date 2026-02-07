// src/components/dashboard/analytics/AnalyticsDashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import StudentAnalytics from './student/StudentAnalytics';
import InstructorAnalytics from './instructor/InstructorAnalytics';
import AdminAnalytics from './admin/AdminAnalytics';
import LiveClock from './common/LiveClock';

const AnalyticsDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'STUDENT':
                return <StudentAnalytics />;
            case 'INSTRUCTOR':
                return <InstructorAnalytics />;
            case 'ADMIN':
                return <AdminAnalytics />;
            default:
                return <div>Unknown Role</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-6 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {user.role === 'STUDENT' ? 'My Learning Insights' :
                                user.role === 'INSTRUCTOR' ? 'Course Performance' :
                                    'Platform Overview'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {user.role === 'STUDENT' ? 'Track your progress and achievements' :
                                user.role === 'INSTRUCTOR' ? 'Analyze course engagement and outcomes' :
                                    'Monitor system health and user growth'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <LiveClock />
                    </div>
                </header>

                <main>
                    {renderDashboard()}
                </main>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
