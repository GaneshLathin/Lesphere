import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../common/Loader';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { User, Shield, Ban, Trash2, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import Pagination from '../common/Pagination';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal States
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form States
    const [blockReason, setBlockReason] = useState('');
    const [blockDuration, setBlockDuration] = useState(7); // default 7 days
    const [deleteReason, setDeleteReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllUsers();
            setUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const openBlockModal = (user) => {
        if (user.role === 'ADMIN') {
            toast.error("Cannot block an admin!");
            return;
        }
        setSelectedUser(user);
        setBlockReason('');
        setBlockDuration(7);
        setShowBlockModal(true);
    };

    const openDeleteModal = (user) => {
        if (user.role === 'ADMIN') {
            toast.error("Cannot delete an admin!");
            return;
        }
        setSelectedUser(user);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    const handleBlockUser = async () => {
        if (!blockReason.trim()) {
            toast.error("Reason is required");
            return;
        }
        try {
            setActionLoading(true);
            await adminService.blockUser(selectedUser.id, { reason: blockReason, days: parseInt(blockDuration) });
            toast.success(`User ${selectedUser.name} blocked successfully`);
            setShowBlockModal(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Block failed", error);
            toast.error("Failed to block user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteReason.trim()) {
            toast.error("Reason is required for deletion");
            return;
        }
        try {
            setActionLoading(true);
            await adminService.deleteUser(selectedUser.id, deleteReason); // uses query param
            toast.success(`User ${selectedUser.name} deleted permanently`);
            setShowDeleteModal(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete user");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter Users
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">Manage students, instructors, and platform access.</p>
                </div>
                {/* Search Bar */}
                <div className="mt-4 md:mt-0 relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full md:w-64"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* BLOCK MODAL */}
            <Modal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                title={`Block User: ${selectedUser?.name}`}
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-orange-600 mt-0.5" size={20} />
                        <p className="text-sm text-orange-800">
                            Blocking will prevent the user from logging in for the specified duration.
                            They will receive an email notification.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                        <select
                            value={blockDuration}
                            onChange={(e) => setBlockDuration(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value={1}>1 Day</option>
                            <option value={3}>3 Days</option>
                            <option value={7}>7 Days</option>
                            <option value={30}>30 Days</option>
                            <option value={365}>Permanent (1 Year)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Mandatory)</label>
                        <textarea
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="e.g. Violation of terms..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleBlockUser} disabled={actionLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {actionLoading ? 'Processing...' : 'Block User'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={`Delete User: ${selectedUser?.name}`}
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                        <p className="text-sm text-red-800 font-medium">
                            Warning: This action is permanent and cannot be undone. All user data, including enrollments and progress, will be lost.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Deletion (Mandatory)</label>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="e.g. User request, fraud account..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleDeleteUser} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            {actionLoading ? 'Deleting...' : 'Permanently Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>


            <Card className="overflow-hidden border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {user.profileImage ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={user.profileImage} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'INSTRUCTOR' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isBlocked ? (
                                                <span className="px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    <Ban size={12} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.role !== 'ADMIN' && (
                                                <div className="flex justify-end gap-2">
                                                    {!user.isBlocked && (
                                                        <button
                                                            onClick={() => openBlockModal(user)}
                                                            className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Block User"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {filteredUsers.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default AdminUsers;
