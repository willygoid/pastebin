'use client'

import { Settings, X, Clock } from 'lucide-react'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  saved: boolean
  expiresIn: number
}

interface SettingsSidebarProps {
  tab: Tab
  onUpdate: (updates: Partial<Tab>) => void
  theme: 'dark' | 'light'
  isOpen: boolean
  onToggle: () => void
}

const LANGUAGES = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
]

const EXPIRY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: '1 Hour' },
  { value: 24, label: '1 Day' },
  { value: 168, label: '1 Week' },
  { value: 720, label: '1 Month' },
]

export default function SettingsSidebar({ 
  tab, 
  onUpdate, 
  theme,
  isOpen,
  onToggle 
}: SettingsSidebarProps) {
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-80 z-50 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isDark ? 'bg-[#252525] border-l border-[#3e3e3e]' : 'bg-gray-50 border-l border-gray-300'}
      `}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'border-[#3e3e3e]' : 'border-gray-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <Settings size={18} />
            Paste Settings
          </div>
          <button
            onClick={onToggle}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
            }`}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={tab.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter paste title"
              className={`
                w-full px-3 py-2 rounded border text-sm
                ${isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e] focus:border-blue-500' 
                  : 'bg-white border-gray-300 focus:border-blue-500'
                }
                focus:outline-none
              `}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Leave empty to use short ID as title
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Language / Syntax
            </label>
            <select
              value={tab.language}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className={`
                w-full px-3 py-2 rounded border text-sm
                ${isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e]' 
                  : 'bg-white border-gray-300'
                }
              `}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock size={16} />
              Expiration
            </label>
            <select
              value={tab.expiresIn}
              onChange={(e) => onUpdate({ expiresIn: Number(e.target.value) })}
              className={`
                w-full px-3 py-2 rounded border text-sm
                ${isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e]' 
                  : 'bg-white border-gray-300'
                }
              `}
            >
              {EXPIRY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Paste will be automatically deleted after this period
            </p>
          </div>

          <div className={`p-3 rounded border ${
            isDark ? 'bg-[#1e1e1e] border-[#3e3e3e]' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-xs">
              <strong>Tip:</strong> Press <kbd className={`px-1 py-0.5 rounded ${
                isDark ? 'bg-[#2d2d2d]' : 'bg-white'
              }`}>Ctrl+S</kbd> to save quickly
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
