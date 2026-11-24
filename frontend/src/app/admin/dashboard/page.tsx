'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Users, Shield, UserCheck, FileText } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        adminCount: 0,
        activeUsers: 0,
        totalPastes: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [usersRes, pastesRes] = await Promise.all([
                adminService.getAllUsers(1, 100),
                adminService.getAllPastes(1, 1),
            ]);
            setStats({
                totalUsers: usersRes.pagination.total,
                adminCount: usersRes.users.filter((u: any) => u.role === 'admin').length,
                activeUsers: usersRes.users.filter((u: any) => u.is_active).length,
                totalPastes: pastesRes.pagination.total,
            });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400 bg-blue-600/20' },
        { label: 'Admins', value: stats.adminCount, icon: Shield, color: 'text-purple-400 bg-purple-600/20' },
        { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-green-400 bg-green-600/20' },
        { label: 'Total Pastes', value: stats.totalPastes, icon: FileText, color: 'text-orange-400 bg-orange-600/20' },
    ];

    return (
        <AdminLayout>
            {({ admin, isDark }) => (
                <>
                    {/* Welcome Section */}
                    <div className={`rounded-xl p-5 mb-6 border ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                                <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">
                                    Welcome, {admin?.full_name || admin?.username}
                                </h1>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your system from the admin panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statCards.map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-xl p-4 border ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                                <p className="text-xl font-bold">{loading ? '…' : stat.value}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
