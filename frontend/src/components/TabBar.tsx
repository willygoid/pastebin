'use client'

import { X, Plus } from 'lucide-react'

interface Tab {
  id: string
  title: string
  content: string
  language: string
  saved: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
  theme: 'dark' | 'light'
}

export default function TabBar({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onTabClose, 
  onNewTab,
  theme 
}: TabBarProps) {
  const isDark = theme === 'dark'
  
  return (
    <div className={`flex items-center border-b ${
      isDark ? 'bg-[#1e1e1e] border-[#2d2d2d]' : 'bg-gray-100 border-gray-300'
    }`}>
      <div className="flex items-center overflow-x-auto flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2 cursor-pointer border-r min-w-[150px] max-w-[200px]
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
            <span className="flex-1 truncate text-sm">
              {tab.title || 'Untitled'}
              {!tab.saved && <span className="ml-1">●</span>}
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
        ))}
      </div>
      
      <button
        onClick={onNewTab}
        className={`
          p-2 border-l transition-colors
          ${isDark 
            ? 'hover:bg-[#2d2d2d] text-gray-400 border-[#2d2d2d]' 
            : 'hover:bg-gray-200 text-gray-600 border-gray-300'
          }
        `}
        title="New Tab"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}
