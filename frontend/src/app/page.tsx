'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Save, Settings, Trash2, Loader2, Edit, Zap
} from 'lucide-react'
import Layout from '@/components/Layout'
import TabBar from '@/components/TabBar'
import SettingsSidebar from '@/components/SettingsSidebar'
import ActionsSidebar from '@/components/ActionsSidebar'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin" size={32} />
    </div>
  )
})

const API_URL = '/api'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  saved: boolean
  expiresIn: number
  shortId?: string
  isReadOnly?: boolean
}

export default function Home() {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      const initialTab: Tab = {
        id: Date.now().toString(),
        title: '',
        content: '// Start typing your code here...\n\n',
        language: 'javascript',
        saved: true,
        expiresIn: 0,
      }
      setTabs([initialTab])
      setActiveTabId(initialTab.id)
    }
  }, [])

  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('tabs', JSON.stringify(tabs))
      localStorage.setItem('activeTab', activeTabId)
    }
  }, [tabs, activeTabId])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const tab = tabs.find(t => t.id === activeTabId)
        if (tab && !tab.isReadOnly) {
          handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tabs, activeTabId])

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
      title: '',
      content: '',
      language: 'text',
      saved: true,
      expiresIn: 0,
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
    setSidebarOpen(false)
    toast.success('New tab created')
  }

  const handleCloseTab = (id: string) => {
    const tab = tabs.find(t => t.id === id)
    if (!tab?.saved && tab?.content.trim() && !tab?.isReadOnly) {
      if (!confirm('You have unsaved changes. Close anyway?')) {
        return
      }
    }

    const newTabs = tabs.filter(t => t.id !== id)
    if (newTabs.length === 0) {
      handleNewTab()
    } else {
      setTabs(newTabs)
      if (activeTabId === id) {
        setActiveTabId(newTabs[0].id)
      }
    }
    setSidebarOpen(false)
  }

  const handleSave = async () => {
    if (!activeTab || !activeTab.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Creating paste...')

    try {
      const response = await axios.post(`${API_URL}/pastes`, {
        title: activeTab.title || undefined,
        content: activeTab.content,
        language: activeTab.language,
        expires_in: activeTab.expiresIn,
        is_private: false
      })

      const data = response.data.data
      const shortId = data.id
      const finalTitle = data.title || shortId

      setTabs(tabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              saved: true, 
              shortId: shortId,
              title: finalTitle,
              isReadOnly: true 
            }
          : tab
      ))

      toast.success('Paste created successfully!', { id: loadingToast })
      
      setSidebarOpen(true)

      const url = `${window.location.origin}/${shortId}`
      navigator.clipboard.writeText(url)
      
      setTimeout(() => {
        toast.success('URL copied to clipboard!', {
          icon: '📋'
        })
      }, 500)

    } catch (error: any) {
      toast.error('Failed to create paste: ' + (error.response?.data?.message || error.message), {
        id: loadingToast
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (activeTab && activeTab.shortId) {
      const newTab: Tab = {
        id: Date.now().toString(),
        title: `Fork of ${activeTab.title}`,
        content: activeTab.content,
        language: activeTab.language,
        saved: false,
        expiresIn: 0,
      }
      setTabs([...tabs, newTab])
      setActiveTabId(newTab.id)
      setSidebarOpen(false)
      toast.success('Forked to new tab for editing')
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all tabs? This cannot be undone.')) {
      localStorage.removeItem('tabs')
      localStorage.removeItem('activeTab')
      window.location.reload()
    }
  }

  const isDark = theme === 'dark'

  return (
    <Layout 
      theme={theme} 
      onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#2d2d2d' : '#fff',
            color: isDark ? '#fff' : '#000',
            border: `1px solid ${isDark ? '#3e3e3e' : '#e5e5e5'}`,
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

      {/* Main Editor Area - Full Width */}
      <div className="flex-1 flex flex-col h-full">
        {/* Action Bar */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${
          isDark ? 'bg-[#252525] border-[#3e3e3e]' : 'bg-gray-50 border-gray-300'
        }`}>
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
                ${isDark 
                  ? 'hover:bg-red-900/30 text-red-400' 
                  : 'hover:bg-red-50 text-red-600'
                }
              `}
              title="Clear All Tabs"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center gap-2">
            {activeTab && !activeTab.isReadOnly ? (
              <>
                {/* Settings Button (before save) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`
                    p-2 rounded transition-colors
                    ${sidebarOpen 
                      ? 'bg-blue-600 text-white' 
                      : isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'
                    }
                  `}
                  title="Paste Settings"
                >
                  <Settings size={18} />
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={loading || !activeTab?.content}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded font-medium transition-colors text-sm
                    ${loading || !activeTab?.content
                      ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  `}
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {loading ? 'Saving...' : 'Save Paste'}
                </button>
              </>
            ) : activeTab && activeTab.isReadOnly ? (
              <>
                {/* Edit/Fork Button (after save) */}
                <button
                  onClick={handleEdit}
                  className={`
                    p-2 rounded transition-colors
                    ${isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-200'}
                  `}
                  title="Fork & Edit"
                >
                  <Edit size={18} />
                </button>

                {/* Actions Button (replaces Save) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded font-medium transition-colors text-sm
                    ${sidebarOpen 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  `}
                >
                  <Zap size={16} />
                  Actions
                </button>
              </>
            ) : null}
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

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {activeTab && (
            <CodeEditor
              value={activeTab.content}
              onChange={(value) => updateActiveTab({ content: value })}
              language={activeTab.language}
              theme={isDark ? 'vs-dark' : 'light'}
              readOnly={activeTab.isReadOnly}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className={`
          flex items-center justify-between px-4 py-1 text-xs
          ${isDark ? 'bg-[#007acc] text-white' : 'bg-blue-600 text-white'}
        `}>
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {activeTab?.language.toUpperCase() || 'TEXT'}
            </span>
            <span>
              Ln {activeTab?.content.split('\n').length || 0}, 
              Col {activeTab?.content.length || 0}
            </span>
            <span>
              {activeTab?.content.length || 0} chars
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeTab?.isReadOnly ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Read-only
              </span>
            ) : activeTab?.saved ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Saved
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Sidebars */}
      {activeTab && !activeTab.isReadOnly && (
        <SettingsSidebar
          tab={activeTab}
          onUpdate={updateActiveTab}
          theme={theme}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {activeTab && activeTab.isReadOnly && activeTab.shortId && (
        <ActionsSidebar
          shortId={activeTab.shortId}
          content={activeTab.content}
          theme={theme}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onEdit={handleEdit}
        />
      )}
    </Layout>
  )
}
