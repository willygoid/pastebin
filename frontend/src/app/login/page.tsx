'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { logoFont } from '@/lib/fonts';

export default function LoginPage() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        if (savedTheme) setTheme(savedTheme);
    }, []);

    // Save theme to localStorage and reset captcha when theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        // Reset captcha when theme changes
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
            setCaptchaValue(null);
        }
    }, [theme]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate captcha
        if (!captchaValue) {
            toast.error('Please verify the captcha first');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login(
                formData.emailOrUsername,
                formData.password
            );

            toast.success('Login successful!');

            // Redirect based on role
            if (response.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider: 'google' | 'github') => {
        toast.error(`OAuth ${provider} will be implemented soon`);
        // TODO: Implement OAuth flow
    };

    const isDark = theme === 'dark';

    const labelClass = `text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    const inputClass = `w-full rounded-lg border text-sm outline-none transition-colors ${isDark
            ? 'border-[#3e3b50] bg-[#22212c] text-white placeholder:text-gray-500 focus:border-blue-500'
            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`;
    const fieldIconClass = `pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
    const toggleIconClass = `absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`;
    const googleButtonClass = 'flex items-center justify-center gap-1.5 rounded-lg border border-transparent bg-[#db4437] py-2 text-xs font-medium text-white transition-colors hover:bg-[#c5372b]';
    const githubButtonClass = `flex items-center justify-center gap-1.5 rounded-lg border bg-black py-2 text-xs font-medium text-white transition-colors hover:bg-[#2b2b2b] ${isDark ? 'border-white/15' : 'border-black'}`;
    const dividerClass = `relative flex justify-center text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
    const dividerLabelClass = `px-2 ${isDark ? 'bg-[#2f2c3c]' : 'bg-white'}`;

    return (
        <div className={`h-screen flex flex-col ${isDark ? 'bg-[#22212c] text-white' : 'bg-white text-gray-900'}`}>
            {/* Toast Notifications - ONLY ONE at bottom-right */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: isDark ? '#2f2c3c' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        border: `1px solid ${isDark ? '#3e3b50' : '#e5e5e5'}`,
                        fontSize: '14px',
                        padding: '12px 16px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Top Bar */}
            <div className={`flex h-12 flex-shrink-0 items-center justify-between border-b px-4 ${isDark ? 'border-[#3e3b50] bg-[#2f2c3c]' : 'border-gray-300 bg-gray-100'}`}>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <img src="/logo-mark.png" alt="Pastefel" className="h-4 w-4" />
                    <span className={`text-base ${logoFont.className}`}>Paste<span className="pastefel-gradient">fel</span></span>
                </button>

                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`rounded p-1.5 transition-colors ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}`}
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 justify-center overflow-y-auto p-4">
                <div className={`my-auto w-full max-w-sm rounded-xl shadow-xl ${isDark ? 'bg-[#2f2c3c]' : 'border border-gray-200 bg-white'}`}>
                    {/* Card Header */}
                    <div className="px-5 pb-3 pt-5 text-center">
                        <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                            <Lock className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Welcome Back
                        </h1>
                        <p className={`mt-0.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3 px-5 pb-5">
                        {/* Email/Username */}
                        <div>
                            <label className={labelClass}>
                                Email or Username
                            </label>
                            <div className="relative mt-1">
                                <Mail className={fieldIconClass} />
                                <input
                                    type="text"
                                    required
                                    value={formData.emailOrUsername}
                                    onChange={(e) =>
                                        setFormData({ ...formData, emailOrUsername: e.target.value })
                                    }
                                    className={`${inputClass} py-2 pl-9 pr-3`}
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className={labelClass}>
                                Password
                            </label>
                            <div className="relative mt-1">
                                <Lock className={fieldIconClass} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className={`${inputClass} py-2 pl-9 pr-9`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={toggleIconClass}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* reCAPTCHA - AUTO UPDATE ON THEME CHANGE */}
                        <div className="flex justify-center overflow-hidden">
                            <div className="-my-2 origin-center scale-[0.8] sm:my-0 sm:scale-100">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    key={theme}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                                    onChange={(value) => setCaptchaValue(value)}
                                    theme={isDark ? 'dark' : 'light'}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !captchaValue}
                            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all ${loading || !captchaValue
                                    ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                                    : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* OAuth Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`}></div>
                            </div>
                            <div className={dividerClass}>
                                <span className={dividerLabelClass}>
                                    Or sign in with
                                </span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                className={googleButtonClass}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('github')}
                                className={githubButtonClass}
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`}></div>
                            </div>
                            <div className={dividerClass}>
                                <span className={dividerLabelClass}>
                                    Don&apos;t have an account?
                                </span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <Link
                            href="/register"
                            className={`block w-full rounded-lg border py-2.5 text-center text-sm font-semibold transition-all ${isDark
                                    ? 'border-blue-600 text-blue-400 hover:bg-blue-600/10'
                                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            Sign Up Now
                        </Link>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className={`flex-shrink-0 py-2 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                © 2026 Pastefel. All rights reserved.
            </div>
        </div>
    );
}
