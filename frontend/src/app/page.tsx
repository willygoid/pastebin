'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { Toaster, toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
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
  originalContent?: string
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
      
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        handleNewTab()
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
    
    const isUpdating = !!activeTab.shortId
    const loadingToast = toast.loading(isUpdating ? 'Creating new version...' : 'Creating paste...')

    try {
        const shouldSendTitle = activeTab.title && activeTab.title !== activeTab.shortId
        
        console.log('Save logic:', {
        currentTitle: activeTab.title,
        currentShortId: activeTab.shortId,
        shouldSendTitle,
        willSendTitle: shouldSendTitle ? activeTab.title : undefined
        })

        // Always POST to create new paste
        const response = await axios.post(`${API_URL}/pastes`, {
        title: shouldSendTitle ? activeTab.title : undefined,
        content: activeTab.content,
        language: activeTab.language,
        expires_in: activeTab.expiresIn,
        is_private: false
        })

        const data = response.data.data
        const newShortId = data.id
        const newTitle = data.title || newShortId

        console.log('Save response:', {
        oldShortId: activeTab.shortId,
        newShortId: newShortId,
        returnedTitle: data.title,
        finalTitle: newTitle
        })

        // Create completely new tab object to force re-render
        setTabs(prevTabs => prevTabs.map(tab => {
        if (tab.id === activeTabId) {
            // Return completely new object
            return {
            id: tab.id,
            title: newTitle,
            content: tab.content,
            language: tab.language,
            saved: true,
            expiresIn: tab.expiresIn,
            shortId: newShortId,
            isReadOnly: true,
            originalContent: tab.content
            }
        }
        return tab
        }))

        if (isUpdating) {
        toast.success(`New version created: ${newShortId}`, { id: loadingToast })
        } else {
        toast.success(`Paste created: ${newShortId}`, { id: loadingToast })
        }
        
        setSidebarOpen(true)

    } catch (error: any) {
        console.error('Save error:', error)
        toast.error('Failed to save paste: ' + (error.response?.data?.message || error.message), {
        id: loadingToast
        })
    } finally {
        setLoading(false)
    }
}

  const handleEditCurrent = () => {
    if (activeTab && activeTab.isReadOnly) {
        setTabs(tabs.map(tab => 
        tab.id === activeTabId 
            ? { 
                ...tab, 
                isReadOnly: false, 
                saved: false,
                originalContent: tab.content,
                // Clear title if it's same as shortId (so backend will use new shortId as title)
                title: tab.title === tab.shortId ? '' : tab.title
            }
            : tab
        ))
        setSidebarOpen(false)
        toast.success('Edit mode activated')
    }
    }


  const handleForkToNew = () => {
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

  // Determine what to show in navbar
  const showActionsButton = !!(activeTab?.isReadOnly && activeTab?.shortId)
  const showEditButton = !!(activeTab?.isReadOnly && activeTab?.shortId)
  const showSaveSettings = !!(!activeTab?.isReadOnly)

  return (
    <Layout 
      theme={theme} 
      onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      showSaveButton={showSaveSettings}
      showSettingsButton={showSaveSettings}
      showActionsButton={showActionsButton}
      showEditButton={showEditButton}
      onSave={handleSave}
      onSettingsToggle={() => setSidebarOpen(!sidebarOpen)}
      onActionsToggle={() => setSidebarOpen(!sidebarOpen)}
      onEdit={handleEditCurrent}
      saveLoading={loading}
      saveDisabled={!activeTab?.content}
      saveLabel={activeTab?.shortId ? 'Save as New' : 'Save Paste'}
      settingsActive={sidebarOpen}
      actionsActive={sidebarOpen}
    >
      {/* Toast Notification - Kanan Bawah */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#2d2d2d' : '#fff',
            color: isDark ? '#fff' : '#000',
            border: `1px solid ${isDark ? '#3e3e3e' : '#e5e5e5'}`,
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
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="flex-1 flex flex-col h-full">
        {/* Tab Bar */}
        <TabBar
          tabs={tabs}
          activeTab={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={handleCloseTab}
          onNewTab={handleNewTab}
          onClearAll={handleClearAll}
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
            {activeTab?.shortId && (
              <>
                <span>•</span>
                <span className="font-mono">{activeTab.shortId}</span>
              </>
            )}
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
          onEdit={handleForkToNew}
        />
      )}
    </Layout>
  )
}
