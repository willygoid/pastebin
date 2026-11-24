'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import toast from 'react-hot-toast'
import Avatar from './Avatar'
import { logoFont } from '@/lib/fonts'
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  LogOut,
  Moon,
  Sun,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/pastes', label: 'Paste Management', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminLayoutProps {
  children: (ctx: { admin: User | null; isDark: boolean }) => ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [admin, setAdmin] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    if (!authService.isAdmin()) {
      router.push('/dashboard')
      return
    }

    authService
      .getProfile()
      .then(setAdmin)
      .catch(() => {
        toast.error('Failed to load admin data')
        authService.logout()
      })
      .finally(() => setChecked(true))
  }, [router])

  const handleLogout = () => {
    toast.success('Logged out successfully!')
    authService.logout()
  }

  if (!checked) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#22212c]' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#22212c] text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Bar */}
      <div className={`flex-shrink-0 flex items-center justify-between px-4 py-1.5 h-[53px] border-b ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-100 border-gray-300'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo-mark.png" alt="Pastefel" className="h-5 w-5" />
            <span className={`text-lg ${logoFont.className}`}>Paste<span className="pastefel-gradient">fel</span></span>
          </button>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
            <Shield size={12} />
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {admin && (
            <Avatar name={admin.full_name || admin.username} size="sm" />
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-red-400 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50 text-red-600'}`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className={`w-56 flex-shrink-0 border-r py-4 px-2 ${isDark ? 'bg-[#282633] border-[#3e3b50]' : 'bg-gray-50 border-gray-200'}`}>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'text-gray-300 hover:bg-[#3e3b50]'
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {children({ admin, isDark })}
          </div>
        </div>
      </div>
    </div>
  )
}
