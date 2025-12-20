'use client'

import { useState } from 'react'
import { 
  Copy, Download, Share2, ExternalLink, 
  Edit, CheckCircle, X, Zap
} from 'lucide-react'

interface ActionsSidebarProps {
  shortId: string
  content: string
  theme: 'dark' | 'light'
  isOpen: boolean
  onToggle: () => void
  onEdit: () => void
}

export default function ActionsSidebar({ 
  shortId, 
  content,
  theme,
  isOpen,
  onToggle,
  onEdit
}: ActionsSidebarProps) {
  const isDark = theme === 'dark'
  const url = typeof window !== 'undefined' ? `${window.location.origin}/${shortId}` : ''

  const [copied, setCopied] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyURL = () => {
    navigator.clipboard.writeText(url)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onToggle}
      />

      <div className={`
        fixed right-0 top-0 h-full w-80 z-50 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isDark ? 'bg-[#252525] border-l border-[#3e3e3e]' : 'bg-gray-50 border-l border-gray-300'}
      `}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'border-[#3e3e3e]' : 'border-gray-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <Zap size={18} />
            Quick Actions
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
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className={`p-3 rounded ${
            isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'
          }`}>
            <p className="text-sm font-medium mb-1">✅ Paste Saved!</p>
            <p className="text-xs">Your paste is now available at:</p>
            <p className="text-xs font-mono mt-1 truncate">{url}</p>
          </div>

          <button
            onClick={handleCopy}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Content'}
          </button>

          <button
            onClick={handleCopyURL}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-[#2d2d2d] hover:bg-[#3e3e3e]' 
                : 'bg-white hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            {urlCopied ? <CheckCircle size={18} /> : <Share2 size={18} />}
            {urlCopied ? 'URL Copied!' : 'Share URL'}
          </button>

          <button
            onClick={() => {
              onEdit()
              onToggle()
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-[#2d2d2d] hover:bg-[#3e3e3e]' 
                : 'bg-white hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            <Edit size={18} />
            Fork to New Tab
          </button>

          <a
            href={`/${shortId}/raw`}
            target="_blank"
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-[#2d2d2d] hover:bg-[#3e3e3e]' 
                : 'bg-white hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            <ExternalLink size={18} />
            View Raw
          </a>

          <a
            href={`/${shortId}/raw?download=1`}
            download
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-[#2d2d2d] hover:bg-[#3e3e3e]' 
                : 'bg-white hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            <Download size={18} />
            Download
          </a>

          <a
            href={`/${shortId}`}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
              ${isDark 
                ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-400' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
              }
            `}
          >
            <ExternalLink size={18} />
            View Full Page
          </a>
        </div>

        <div className={`p-4 border-t ${isDark ? 'border-[#3e3e3e]' : 'border-gray-300'}`}>
          <p className="text-xs font-medium mb-2">Share URL</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className={`
                flex-1 px-2 py-1.5 rounded border text-xs font-mono
                ${isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e]' 
                  : 'bg-white border-gray-300'
                }
              `}
            />
            <button
              onClick={handleCopyURL}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
