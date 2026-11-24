'use client';

import { useEffect, useState } from 'react';
import { myPasteService, AdminPaste } from '@/lib/auth';
import toast from 'react-hot-toast';
import { FileText, Search, Trash2, ExternalLink, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import UserLayout from '@/components/UserLayout';
import EditProfileModal from '@/components/EditProfileModal';

export default function DashboardPage() {
    const [pastes, setPastes] = useState<AdminPaste[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showEditProfile, setShowEditProfile] = useState(false);

    useEffect(() => {
        loadPastes();
    }, [pagination.page, searchQuery]);

    const loadPastes = async () => {
        setLoading(true);
        try {
            const response = await myPasteService.getMyPastes(
                pagination.page,
                pagination.limit,
                searchQuery
            );
            setPastes(response.pastes);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination.total,
                total_pages: response.pagination.total_pages,
            }));
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to load your pastes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePaste = async (shortId: string) => {
        if (!confirm('Are you sure you want to delete this paste?')) return;

        try {
            await myPasteService.deleteMyPaste(shortId);
            toast.success('Paste deleted!');
            loadPastes();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete paste');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <UserLayout onEditProfile={() => setShowEditProfile(true)}>
            {({ user, isDark, refreshUser }) => (
                <>
                    <div className="mb-5">
                        <h1 className="text-lg font-bold">My Pastes</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage the pastes you&apos;ve created
                        </p>
                    </div>

                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="p-4">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search your pastes by title or ID..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setPagination((prev) => ({ ...prev, page: 1 }));
                                        }}
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
                                            <th className="text-left py-2 px-3 font-medium">Title / ID</th>
                                            <th className="text-left py-2 px-3 font-medium">Language</th>
                                            <th className="text-left py-2 px-3 font-medium">Views</th>
                                            <th className="text-left py-2 px-3 font-medium">Visibility</th>
                                            <th className="text-left py-2 px-3 font-medium">Created</th>
                                            <th className="text-right py-2 px-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!loading && pastes.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className={`text-center py-10 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    You haven&apos;t created any pastes yet
                                                </td>
                                            </tr>
                                        )}
                                        {pastes.map((paste) => (
                                            <tr
                                                key={paste.id}
                                                className={`border-b transition-colors ${isDark ? 'border-[#3e3b50] hover:bg-[#282633]' : 'border-gray-100 hover:bg-gray-100'}`}
                                            >
                                                <td className="py-3 px-3">
                                                    <p className="font-medium truncate max-w-[220px]">{paste.title}</p>
                                                    <p className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{paste.id}</p>
                                                </td>
                                                <td className={`py-3 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{paste.language}</td>
                                                <td className={`py-3 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{paste.views}</td>
                                                <td className="py-3 px-3">
                                                    {paste.is_private ? (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            <Lock className="w-3 h-3" />
                                                            Private
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                            Public
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`py-3 px-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {formatDate(paste.created_at)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <a
                                                            href={`/${paste.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`p-1.5 rounded-lg transition-colors text-blue-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200 text-blue-600'}`}
                                                            title="Open Paste"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeletePaste(paste.id)}
                                                            className={`p-1.5 rounded-lg transition-colors text-red-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200 text-red-600'}`}
                                                            title="Delete Paste"
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
                                    Showing {pastes.length} of {pagination.total} pastes
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

                    {showEditProfile && user && (
                        <EditProfileModal
                            user={user}
                            isDark={isDark}
                            onClose={() => setShowEditProfile(false)}
                            onSaved={refreshUser}
                        />
                    )}
                </>
            )}
        </UserLayout>
    );
}
