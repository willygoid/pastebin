'use client';

import { useEffect, useState } from 'react';
import { adminService, AppSettings } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Info, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [googleClientId, setGoogleClientId] = useState('');
    const [googleClientSecret, setGoogleClientSecret] = useState('');
    const [githubClientId, setGithubClientId] = useState('');
    const [githubClientSecret, setGithubClientSecret] = useState('');
    const [showGoogleSecret, setShowGoogleSecret] = useState(false);
    const [showGithubSecret, setShowGithubSecret] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await adminService.getSettings();
            setSettings(data);
            setGoogleClientId(data.google_client_id);
            setGithubClientId(data.github_client_id);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await adminService.updateSettings({
                google_client_id: googleClientId,
                google_client_secret: googleClientSecret || undefined,
                github_client_id: githubClientId,
                github_client_secret: githubClientSecret || undefined,
            });
            setSettings(data);
            setGoogleClientSecret('');
            setGithubClientSecret('');
            toast.success('Settings saved!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            {({ isDark }) => (
                <div className="max-w-2xl">
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`}>
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <SettingsIcon className="w-4 h-4" />
                                OAuth Settings
                            </h2>
                        </div>

                        <div className="p-4 space-y-5">
                            <div className={`flex items-start gap-2 text-xs rounded-lg p-3 ${isDark ? 'bg-blue-600/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                    These credentials are stored for the upcoming Google and GitHub sign-in integration.
                                    The &quot;Sign in with Google/GitHub&quot; buttons are not wired up to them yet.
                                </p>
                            </div>

                            {/* Google */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Google OAuth</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Client ID
                                        </label>
                                        <input
                                            type="text"
                                            value={googleClientId}
                                            onChange={(e) => setGoogleClientId(e.target.value)}
                                            placeholder="xxxxxxxx.apps.googleusercontent.com"
                                            disabled={loading}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none ${isDark
                                                    ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500 placeholder:text-gray-600'
                                                    : 'bg-white border-gray-300 focus:border-blue-500 placeholder:text-gray-400'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Client Secret {settings?.google_client_secret_set && <span className="text-green-500">(set)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showGoogleSecret ? 'text' : 'password'}
                                                value={googleClientSecret}
                                                onChange={(e) => setGoogleClientSecret(e.target.value)}
                                                placeholder={settings?.google_client_secret_set ? '••••••••••••••••' : 'Enter client secret'}
                                                disabled={loading}
                                                className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm transition-all outline-none ${isDark
                                                        ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500 placeholder:text-gray-600'
                                                        : 'bg-white border-gray-300 focus:border-blue-500 placeholder:text-gray-400'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`} />

                            {/* GitHub */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">GitHub OAuth</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Client ID
                                        </label>
                                        <input
                                            type="text"
                                            value={githubClientId}
                                            onChange={(e) => setGithubClientId(e.target.value)}
                                            placeholder="Iv1.xxxxxxxxxxxxxxxx"
                                            disabled={loading}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none ${isDark
                                                    ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500 placeholder:text-gray-600'
                                                    : 'bg-white border-gray-300 focus:border-blue-500 placeholder:text-gray-400'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Client Secret {settings?.github_client_secret_set && <span className="text-green-500">(set)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showGithubSecret ? 'text' : 'password'}
                                                value={githubClientSecret}
                                                onChange={(e) => setGithubClientSecret(e.target.value)}
                                                placeholder={settings?.github_client_secret_set ? '••••••••••••••••' : 'Enter client secret'}
                                                disabled={loading}
                                                className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm transition-all outline-none ${isDark
                                                        ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500 placeholder:text-gray-600'
                                                        : 'bg-white border-gray-300 focus:border-blue-500 placeholder:text-gray-400'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowGithubSecret(!showGithubSecret)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {showGithubSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
