'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import toast from 'react-hot-toast'
import { LogOut, Moon, Sun, UserCog } from 'lucide-react'
import Avatar from './Avatar'
import { logoFont } from '@/lib/fonts'

interface UserLayoutProps {
  children: (ctx: { user: User | null; isDark: boolean; refreshUser: () => void }) => ReactNode
  onEditProfile: () => void
}

export default function UserLayout({ children, onEditProfile }: UserLayoutProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const refreshUser = () => {
    authService
      .getProfile()
      .then(setUser)
      .catch(() => {
        toast.error('Failed to load profile')
        authService.logout()
      })
  }

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    if (authService.isAdmin()) {
      router.push('/admin/dashboard')
      return
    }

    authService
      .getProfile()
      .then(setUser)
      .catch(() => {
        toast.error('Failed to load profile')
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
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo-mark.png" alt="Pastefel" className="h-5 w-5" />
          <span className={`text-lg ${logoFont.className}`}>Paste<span className="pastefel-gradient">fel</span></span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 p-1 pr-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}`}
            >
              <Avatar name={user?.full_name || user?.username || '?'} size="sm" />
              <span className="text-sm font-medium hidden sm:inline">{user?.username}</span>
            </button>

            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-50 overflow-hidden ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-white border-gray-200'}`}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onEditProfile()
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-100'}`}
                  >
                    <UserCog size={16} />
                    Edit Profile
                  </button>
                  <div className={`my-1 border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`} />
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-red-400 ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-100 text-red-600'}`}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children({ user, isDark, refreshUser })}
        </div>
      </div>
    </div>
  )
}
