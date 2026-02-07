import React, { useEffect, useState, useMemo } from 'react';
import {
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Settings,
    Search,
    Filter
} from 'lucide-react';
import Card from '../../../common/Card';
import Button from '../../../common/Button';
import Loader from '../../../common/Loader';
import analyticsService from '../../../../services/analyticsService';
import toast from 'react-hot-toast';

const InstructorReports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, YET_TO_START, IN_PROGRESS, COMPLETED
    const [searchTerm, setSearchTerm] = useState('');
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

    // Column Visibility State
    const [columns, setColumns] = useState({
        srNo: true,
        courseName: true,
        bgCourse: true, // Background Course (if applicable, mapping to 'courseName' for now)
        participantName: true,
        enrolledDate: true,
        startDate: true,
        timeSpent: true,
        completionPercentage: true,
        completedDate: true,
        status: true
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const result = await analyticsService.getInstructorStudentProgress();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            toast.error("Failed to load student progress reports");
        } finally {
            setLoading(false);
        }
    };

    // Calculate Overview Stats
    const stats = useMemo(() => {
        const total = data.length;
        const yetToStart = data.filter(d => d.status === 'YET_TO_START').length;
        const inProgress = data.filter(d => d.status === 'IN_PROGRESS').length;
        const completed = data.filter(d => d.status === 'COMPLETED').length;
        return { total, yetToStart, inProgress, completed };
    }, [data]);

    // Filter Data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
            const matchesSearch =
                item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [data, filterStatus, searchTerm]);

    const handleDownloadCSV = () => {
        // Simple CSV export logic
        const headers = Object.keys(columns).filter(k => columns[k]).join(',');
        const rows = filteredData.map(item => {
            return Object.keys(columns).filter(k => columns[k]).map(k => {
                switch (k) {
                    case 'srNo': return '';
                    case 'courseName': return `"${item.courseName}"`;
                    case 'participantName': return `"${item.studentName}"`;
                    case 'enrolledDate': return item.enrolledDate;
                    case 'startDate': return item.startDate;
                    case 'timeSpent': return item.timeSpentMinutes;
                    case 'completionPercentage': return item.completionPercentage;
                    case 'completedDate': return item.completedDate || '-';
                    case 'status': return item.status;
                    default: return '';
                }
            }).join(',');
        }).join('\n');

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_progress_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const toggleColumn = (key) => {
        setColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Learner Progress Reports</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowColumnCustomizer(!showColumnCustomizer)} icon={Settings}>
                        Customize Columns
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleDownloadCSV} icon={Download}>
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <OverviewCard
                    label="Total Participants"
                    value={stats.total}
                    icon={Users}
                    color="bg-blue-500"
                    active={filterStatus === 'ALL'}
                    onClick={() => setFilterStatus('ALL')}
                />
                <OverviewCard
                    label="Yet to Start"
                    value={stats.yetToStart}
                    icon={Clock}
                    color="bg-gray-500"
                    active={filterStatus === 'YET_TO_START'}
                    onClick={() => setFilterStatus('YET_TO_START')}
                />
                <OverviewCard
                    label="In Progress"
                    value={stats.inProgress}
                    icon={AlertCircle}
                    color="bg-yellow-500"
                    active={filterStatus === 'IN_PROGRESS'}
                    onClick={() => setFilterStatus('IN_PROGRESS')}
                />
                <OverviewCard
                    label="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="bg-green-500"
                    active={filterStatus === 'COMPLETED'}
                    onClick={() => setFilterStatus('COMPLETED')}
                />
            </div>

            {/* Filters & Customizer */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by student or course..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {showColumnCustomizer && (
                    <div className="absolute z-10 top-48 right-6 bg-white shadow-xl border rounded-lg p-4 w-64 animate-fade-in-down">
                        <h4 className="font-semibold mb-2 text-gray-700 border-b pb-2">Visible Columns</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(columns).map(([key, isVisible]) => (
                                <label key={key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={() => toggleColumn(key)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.srNo && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>}
                            {columns.courseName && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>}
                            {columns.participantName && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>}
                            {columns.enrolledDate && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>}
                            {columns.startDate && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>}
                            {columns.timeSpent && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>}
                            {columns.completionPercentage && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>}
                            {columns.completedDate && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed On</th>}
                            {columns.status && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                                    No records found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item.enrollmentId} className="hover:bg-gray-50 transition-colors">
                                    {columns.srNo && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>}
                                    {columns.courseName && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.courseName}</td>}
                                    {columns.participantName && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.studentName}</div>
                                            <div className="text-xs text-gray-500">{item.studentEmail}</div>
                                        </td>
                                    )}
                                    {columns.enrolledDate && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.enrolledDate)}</td>}
                                    {columns.startDate && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.startDate)}</td>}
                                    {columns.timeSpent && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.timeSpentMinutes} min</td>}
                                    {columns.completionPercentage && (
                                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[80px]">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.completionPercentage}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 block">{item.completionPercentage}%</span>
                                        </td>
                                    )}
                                    {columns.completedDate && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.completedDate ? formatDate(item.completedDate) : '-'}</td>}
                                    {columns.status && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-right text-xs text-gray-400">
                Showing {filteredData.length} records
            </div>
        </div>
    );
};

// Sub-components
const OverviewCard = ({ label, value, icon: Icon, color, active, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-lg p-6 shadow-sm border transition-all cursor-pointer ${active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
            }`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`${color} p-3 rounded-full text-white bg-opacity-90`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        'YET_TO_START': 'bg-gray-100 text-gray-800',
        'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
        'COMPLETED': 'bg-green-100 text-green-800'
    };
    const labels = {
        'YET_TO_START': 'Yet to Start',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed'
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles['YET_TO_START']}`}>
            {labels[status] || status}
        </span>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
};

export default InstructorReports;
