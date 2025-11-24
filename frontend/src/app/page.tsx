'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { 
  Moon, Sun, Save, FileText, Settings, 
  ChevronDown, Upload, Trash2
} from 'lucide-react'
import TabBar from '@/components/TabBar'

// Dynamic import untuk Monaco Editor (client-side only)
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  )
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  saved: boolean
  expiresIn: number
}

const LANGUAGES = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
]

const EXPIRY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: '1 Hour' },
  { value: 24, label: '1 Day' },
  { value: 168, label: '1 Week' },
  { value: 720, label: '1 Month' },
]

export default function Home() {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)

    const savedTabs = localStorage.getItem('tabs')
    const savedActiveTab = localStorage.getItem('activeTab')

    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs)
      setTabs(parsedTabs)
      setActiveTabId(savedActiveTab || parsedTabs[0]?.id || '')
    } else {
      // Create initial tab
      const initialTab: Tab = {
        id: Date.now().toString(),
        title: 'Untitled',
        content: '',
        language: 'text',
        saved: true,
        expiresIn: 0,
      }
      setTabs([initialTab])
      setActiveTabId(initialTab.id)
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('tabs', JSON.stringify(tabs))
      localStorage.setItem('activeTab', activeTabId)
    }
  }, [tabs, activeTabId])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const activeTab = tabs.find(t => t.id === activeTabId)

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, ...updates, saved: false }
        : tab
    ))
  }

  const handleNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      language: 'text',
      saved: true,
      expiresIn: 0,
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const handleCloseTab = (id: string) => {
    const newTabs = tabs.filter(t => t.id !== id)
    if (newTabs.length === 0) {
      handleNewTab()
    } else {
      setTabs(newTabs)
      if (activeTabId === id) {
        setActiveTabId(newTabs[0].id)
      }
    }
  }

  const handleSave = async () => {
    if (!activeTab || !activeTab.content.trim()) {
      alert('Please enter some content')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/pastes`, {
        title: activeTab.title || 'Untitled',
        content: activeTab.content,
        language: activeTab.language,
        expires_in: activeTab.expiresIn,
        is_private: false
      })

      const shortID = response.data.data.id
      
      // Mark as saved
      updateActiveTab({ saved: true })
      
      // Redirect to paste view
      router.push(`/${shortID}`)
    } catch (error: any) {
      console.error('Error creating paste:', error)
      alert('Failed to create paste: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all tabs? This cannot be undone.')) {
      localStorage.removeItem('tabs')
      localStorage.removeItem('activeTab')
      handleNewTab()
    }
  }

  const isDark = theme === 'dark'

  return (
    <div className={`flex flex-col h-screen ${
      isDark ? 'bg-[#1e1e1e] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Top Bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark ? 'bg-[#2d2d2d] border-[#3e3e3e]' : 'bg-gray-100 border-gray-300'
      }`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText size={24} />
            Pastepen
          </h1>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            by @willygoid
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded transition-colors ${
              isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors ${
              isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
            }`}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !activeTab?.content}
            className={`
              flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors
              ${loading || !activeTab?.content
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save & Share'}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={setActiveTabId}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
        theme={theme}
      />

      {/* Settings Panel */}
      {showSettings && activeTab && (
        <div className={`flex items-center gap-4 px-4 py-2 border-b ${
          isDark ? 'bg-[#252525] border-[#3e3e3e]' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Title:</label>
            <input
              type="text"
              value={activeTab.title}
              onChange={(e) => updateActiveTab({ title: e.target.value })}
              placeholder="Untitled"
              className={`
                px-3 py-1 rounded border text-sm
                ${isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e] focus:border-blue-500' 
                  : 'bg-white border-gray-300 focus:border-blue-500'
                }
                focus:outline-none
              `}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Language:</label>
            <select
              value={activeTab.language}
              onChange={(e) => updateActiveTab({ language: e.target.value })}
              className={`
                px-3 py-1 rounded border text-sm
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

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Expires:</label>
            <select
              value={activeTab.expiresIn}
              onChange={(e) => updateActiveTab({ expiresIn: Number(e.target.value) })}
              className={`
                px-3 py-1 rounded border text-sm
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
          </div>

          <button
            onClick={handleClearAll}
            className={`
              ml-auto flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors
              ${isDark 
                ? 'hover:bg-red-900/30 text-red-400' 
                : 'hover:bg-red-50 text-red-600'
              }
            `}
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {activeTab && (
          <CodeEditor
            value={activeTab.content}
            onChange={(value) => updateActiveTab({ content: value })}
            language={activeTab.language}
            theme={isDark ? 'vs-dark' : 'light'}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className={`
        flex items-center justify-between px-4 py-1 text-xs border-t
        ${isDark 
          ? 'bg-[#007acc] text-white border-[#007acc]' 
          : 'bg-blue-600 text-white border-blue-600'
        }
      `}>
        <div className="flex items-center gap-4">
          <span>
            {activeTab?.language.toUpperCase() || 'TEXT'}
          </span>
          <span>
            {activeTab?.content.split('\n').length || 0} lines
          </span>
          <span>
            {activeTab?.content.length || 0} characters
          </span>
        </div>
        <div>
          {activeTab?.saved ? '✓ Saved' : '● Unsaved changes'}
        </div>
      </div>
    </div>
  )
}
