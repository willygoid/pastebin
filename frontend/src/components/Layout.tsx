'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, Moon, Sun, Home, Settings, 
  Github, Twitter, BookOpen 
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  showHomeButton?: boolean
}

export default function Layout({ 
  children, 
  theme, 
  onThemeToggle,
  showHomeButton = false 
}: LayoutProps) {
  const router = useRouter()
  const isDark = theme === 'dark'

  return (
    <div className={`flex flex-col h-screen ${
      isDark ? 'bg-[#1e1e1e] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Top Menu Bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark ? 'bg-[#2d2d2d] border-[#3e3e3e]' : 'bg-gray-100 border-gray-300'
      }`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <FileText size={24} className="text-blue-500" />
            <span className="text-xl font-bold">Pastebin</span>
          </button>

          <nav className="flex items-center gap-1">
            {showHomeButton && (
              <button
                onClick={() => router.push('/')}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
                  ${isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'}
                `}
              >
                <Home size={16} />
                New Paste
              </button>
            )}
            
            <button
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
                ${isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'}
              `}
            >
              <BookOpen size={16} />
              Docs
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded transition-colors ${
              isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded transition-colors ${
              isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
            }`}
            title="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
