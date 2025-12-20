'use client'

import { X, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  saved: boolean
  shortId?: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
  onClearAll: () => void
  theme: 'dark' | 'light'
}

export default function TabBar({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onTabClose, 
  onNewTab,
  onClearAll,
  theme 
}: TabBarProps) {
  const isDark = theme === 'dark'
  
  // Debug: log tabs when they change
  useEffect(() => {
    console.log('Tabs updated:', tabs.map(t => ({
      id: t.id,
      title: t.title,
      shortId: t.shortId,
      saved: t.saved
    })))
  }, [tabs])
  
  // Helper to get display name for tab
  const getTabDisplayName = (tab: Tab) => {
    console.log('Display name for tab:', {
      id: tab.id,
      title: tab.title,
      shortId: tab.shortId,
      saved: tab.saved
    })
    
    // If saved and has shortId, use title (which should be shortId if empty)
    if (tab.saved && tab.shortId) {
      // Return title which is shortId when title was empty
      return tab.title || tab.shortId
    }
    
    // If editing, show title or Untitled
    if (tab.title) {
      return tab.title
    }
    
    return 'Untitled'
  }
  
  return (
    <div className={`flex items-center border-b ${
      isDark ? 'bg-[#1e1e1e] border-[#2d2d2d]' : 'bg-gray-100 border-gray-300'
    }`}>
      {/* Tabs Container */}
      <div className="flex items-center overflow-x-auto flex-1 tab-scrollbar">
        {tabs.map((tab) => {
          const displayName = getTabDisplayName(tab)
          
          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex items-center gap-2 px-4 py-2 cursor-pointer border-r min-w-[150px] max-w-[200px]
                ${activeTab === tab.id 
                  ? isDark 
                    ? 'bg-[#1e1e1e] text-white border-[#2d2d2d]' 
                    : 'bg-white text-gray-900 border-gray-300'
                  : isDark
                    ? 'bg-[#2d2d2d] text-gray-400 hover:bg-[#252525] border-[#2d2d2d]'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-50 border-gray-300'
                }
              `}
            >
              {/* Blue line indicator for active tab */}
              {activeTab === tab.id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
              
              <span className="flex-1 truncate text-sm" title={displayName}>
                {displayName}
                {!tab.saved && <span className="ml-1 text-yellow-500">●</span>}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded
                  ${isDark ? 'hover:bg-[#3e3e3e]' : 'hover:bg-gray-300'}
                `}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
        
        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className={`
            flex-shrink-0 p-2 border-r transition-colors
            ${isDark 
              ? 'hover:bg-[#2d2d2d] text-gray-400 border-[#2d2d2d]' 
              : 'hover:bg-gray-200 text-gray-600 border-gray-300'
            }
          `}
          title="New Tab (Ctrl+T)"
        >
          <Plus size={18} />
        </button>
      </div>
      
      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className={`
          flex-shrink-0 p-2 border-l transition-colors
          ${isDark 
            ? 'hover:bg-red-900/30 text-red-400 border-[#2d2d2d]' 
            : 'hover:bg-red-50 text-red-600 border-gray-300'
          }
        `}
        title="Clear All Tabs"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
