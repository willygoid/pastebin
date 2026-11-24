'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Moon, Sun, User, LogIn, UserPlus, Save, Settings, Loader2, Zap, Edit
} from 'lucide-react'
import { logoFont } from '@/lib/fonts'

interface LayoutProps {
  children: ReactNode
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  showHomeButton?: boolean
  showSaveButton?: boolean
  showSettingsButton?: boolean
  showActionsButton?: boolean
  showEditButton?: boolean
  onSave?: () => void
  onSettingsToggle?: () => void
  onActionsToggle?: () => void
  onEdit?: () => void
  saveLoading?: boolean
  saveDisabled?: boolean
  saveLabel?: string
  settingsActive?: boolean
  actionsActive?: boolean
}

export default function Layout({
  children,
  theme,
  onThemeToggle,
  showHomeButton = false,
  showSaveButton = false,
  showSettingsButton = false,
  showActionsButton = false,
  showEditButton = false,
  onSave,
  onSettingsToggle,
  onActionsToggle,
  onEdit,
  saveLoading = false,
  saveDisabled = false,
  saveLabel = 'Save',
  settingsActive = false,
  actionsActive = false
}: LayoutProps) {
  const router = useRouter()
  const isDark = theme === 'dark'
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-[#22212c] text-white' : 'bg-white text-gray-900'
      }`}>
      {/* Top Menu Bar */}
      <div className={`flex items-center justify-between px-4 py-1.5 border-b ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-gray-100 border-gray-300'
        }`}>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo-mark.png" alt="Pastefel" className="h-5 w-5" />
          <span className={`text-lg ${logoFont.className}`}>Paste<span className="pastefel-gradient">fel</span></span>
        </button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Settings Button - Edit Mode */}
          {showSettingsButton && (
            <button
              onClick={onSettingsToggle}
              className={`
                p-1.5 rounded transition-colors
                ${settingsActive
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'
                }
              `}
              title="Paste Settings"
            >
              <Settings size={18} />
            </button>
          )}

          {/* Save Button - Edit Mode */}
          {showSaveButton && onSave && (
            <button
              onClick={onSave}
              disabled={saveLoading || saveDisabled}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${saveLoading || saveDisabled
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {saveLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saveLabel}
            </button>
          )}

          {/* Edit Button - Read-only Mode (NEW) */}
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className={`
                p-1.5 rounded transition-colors
                ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}
              `}
              title="Edit This Paste"
            >
              <Edit size={18} />
            </button>
          )}

          {/* Actions Button - Read-only Mode */}
          {showActionsButton && onActionsToggle && (
            <button
              onClick={onActionsToggle}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${actionsActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              <Zap size={16} />
              Actions
            </button>
          )}

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`
                p-1.5 rounded-full transition-colors
                ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-200'}
              `}
            >
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center
                ${isDark ? 'bg-[#3e3b50]' : 'bg-gray-300'}
              `}>
                <User size={16} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className={`
                absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50
                ${isDark
                  ? 'bg-[#2f2c3c] border-[#3e3b50]'
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      router.push('/login')
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                      ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-100'}
                    `}
                  >
                    <LogIn size={16} />
                    Login
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      router.push('/register')
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                      ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-100'}
                    `}
                  >
                    <UserPlus size={16} />
                    Register
                  </button>

                  <div className={`my-1 border-t ${isDark ? 'border-[#3e3b50]' : 'border-gray-200'}`} />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onThemeToggle()
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                      ${isDark ? 'hover:bg-[#3e3b50]' : 'hover:bg-gray-100'}
                    `}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
