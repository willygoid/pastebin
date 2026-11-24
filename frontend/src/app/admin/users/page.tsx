'use client';

import { useEffect, useState } from 'react';
import { adminService, User } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Users, Search, Trash2, Key, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Avatar from '@/components/Avatar';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [pagination.page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(
                pagination.page,
                pagination.limit
            );
            setUsers(response.users);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination.total,
                total_pages: response.pagination.total_pages,
            }));
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number) => {
        try {
            await adminService.toggleUserStatus(userId);
            toast.success('User status updated!');
            loadUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted!');
            loadUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;

        setSavingEdit(true);
        try {
            if (editRole !== selectedUser.role) {
                await adminService.updateUserRole(selectedUser.id, editRole);
                toast.success('User updated!');
                loadUsers();
            }
            setShowEditModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update user');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }

        try {
            await adminService.resetPassword(selectedUser.id, newPassword);
            toast.success('Password reset successfully!');
            setShowResetModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            {({ isDark }) => (
                <>
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`}>
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                User Management
                            </h2>
                        </div>

                        <div className="p-4">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search by username, email, or name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-all outline-none ${isDark
                                                ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500 placeholder:text-gray-600'
                                                : 'bg-white border-gray-300 focus:border-blue-500 placeholder:text-gray-400'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={`border-b ${isDark ? 'border-[#3e3b50] text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                                            <th className="text-left py-2 px-3 font-medium">User</th>
                                            <th className="text-left py-2 px-3 font-medium">Email</th>
                                            <th className="text-left py-2 px-3 font-medium">Role</th>
                                            <th className="text-left py-2 px-3 font-medium">Status</th>
                                            <th className="text-right py-2 px-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!loading && filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    No users found
                                                </td>
                                            </tr>
                                        )}
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className={`border-b transition-colors ${isDark ? 'border-[#3e3b50] hover:bg-[#282633]' : 'border-gray-100 hover:bg-gray-100'}`}
                                            >
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={user.full_name || user.username} size="sm" />
                                                        <div>
                                                            <p className="font-medium">{user.username}</p>
                                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.full_name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`py-3 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.email}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                            ? isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                                            : isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active
                                                                ? isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'
                                                                : isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className={`p-1.5 rounded-lg transition-colors text-gray-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200 text-gray-600'}`}
                                                            title="Edit User"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowResetModal(true);
                                                            }}
                                                            className={`p-1.5 rounded-lg transition-colors text-blue-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200 text-blue-600'}`}
                                                            title="Reset Password"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className={`p-1.5 rounded-lg transition-colors text-red-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200 text-red-600'}`}
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`}>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    Showing {filteredUsers.length} of {pagination.total} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                page: Math.max(1, prev.page - 1),
                                            }))
                                        }
                                        disabled={pagination.page === 1}
                                        className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'border-[#3e3b50] hover:bg-[#3e3b50]' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className={`text-xs px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {pagination.page} / {pagination.total_pages || 1}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                page: Math.min(prev.total_pages, prev.page + 1),
                                            }))
                                        }
                                        disabled={pagination.page === pagination.total_pages}
                                        className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'border-[#3e3b50] hover:bg-[#3e3b50]' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit User Modal */}
                    {showEditModal && selectedUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className={`rounded-xl p-5 max-w-sm w-full border ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-white border-gray-200'}`}>
                                <h3 className="text-base font-bold mb-1">Edit User</h3>
                                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {selectedUser.username} &middot; {selectedUser.email}
                                </p>

                                <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Role
                                </label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none mb-5 ${isDark
                                            ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 focus:border-blue-500'
                                        }`}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={savingEdit}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {savingEdit ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-[#3e3b50] hover:bg-[#3e3b50]' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reset Password Modal */}
                    {showResetModal && selectedUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className={`rounded-xl p-5 max-w-sm w-full border ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-white border-gray-200'}`}>
                                <h3 className="text-base font-bold mb-1">Reset Password</h3>
                                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Reset password for <strong>{selectedUser.username}</strong>
                                </p>
                                <input
                                    type="password"
                                    placeholder="New password (min. 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none mb-4 ${isDark
                                            ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 focus:border-blue-500'
                                        }`}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleResetPassword}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowResetModal(false);
                                            setSelectedUser(null);
                                            setNewPassword('');
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-[#3e3b50] hover:bg-[#3e3b50]' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
