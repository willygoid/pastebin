'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { 
  Copy, Download, Edit, Share2, Eye, 
  Calendar, Code, CheckCircle, ExternalLink
} from 'lucide-react'
import Layout from '@/components/Layout'

const ViewEditor = dynamic(() => import('@/components/ViewEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse">Loading...</div>
    </div>
  )
})

const API_URL = '/api'

export default function PastePage() {
  const params = useParams()
  const router = useRouter()
  const [paste, setPaste] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [copied, setCopied] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await axios.get(`${API_URL}/${params.id}`)
        setPaste(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Paste not found or has expired')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPaste()
    }
  }, [params.id])

  const handleCopy = () => {
    navigator.clipboard.writeText(paste.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyURL = () => {
    navigator.clipboard.writeText(window.location.href)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const handleFork = () => {
    // Save to localStorage and redirect to home
    const tabs = JSON.parse(localStorage.getItem('tabs') || '[]')
    const newTab = {
      id: Date.now().toString(),
      title: `Fork of ${paste.title || 'Untitled'}`,
      content: paste.content,
      language: paste.language,
      saved: false,
      expiresIn: 0,
    }
    tabs.push(newTab)
    localStorage.setItem('tabs', JSON.stringify(tabs))
    localStorage.setItem('activeTab', newTab.id)
    router.push('/')
  }

  const isDark = theme === 'dark'

  if (loading) {
    return (
      <Layout theme={theme} onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading paste...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !paste) {
    return (
      <Layout theme={theme} onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-3xl font-bold mb-4">Paste Not Found</h1>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error || 'This paste does not exist or has expired'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Create New Paste
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout 
      theme={theme} 
      onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      showHomeButton={true}
    >
      <div className="flex h-full">
        {/* Main Editor View */}
        <div className="flex-1 flex flex-col">
          {/* Title Bar */}
          <div className={`px-4 py-3 border-b ${
            isDark ? 'bg-[#252525] border-[#3e3e3e]' : 'bg-gray-50 border-gray-300'
          }`}>
            <h1 className="text-xl font-bold mb-2">
              {paste.title || 'Untitled Paste'}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Code size={14} />
                {paste.language}
              </span>
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Eye size={14} />
                {paste.views} views
              </span>
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar size={14} />
                {new Date(paste.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Editor View (Read-only) */}
          <div className="flex-1 overflow-hidden">
            <ViewEditor
              value={paste.content}
              language={paste.language}
              theme={isDark ? 'vs-dark' : 'light'}
            />
          </div>

          {/* Status Bar */}
          <div className={`
            flex items-center justify-between px-4 py-1 text-xs
            ${isDark ? 'bg-[#007acc] text-white' : 'bg-blue-600 text-white'}
          `}>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{paste.language.toUpperCase()}</span>
              <span>{paste.content.split('\n').length} lines</span>
              <span>{paste.content.length} characters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Read-only
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className={`w-72 border-l flex flex-col ${
          isDark ? 'bg-[#252525] border-[#3e3e3e]' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className={`px-4 py-3 border-b font-semibold ${
            isDark ? 'border-[#3e3e3e]' : 'border-gray-300'
          }`}>
            Actions
          </div>
          
          <div className="flex-1 p-4 space-y-3">
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
              onClick={handleFork}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded transition-colors
                ${isDark 
                  ? 'bg-[#2d2d2d] hover:bg-[#3e3e3e]' 
                  : 'bg-white hover:bg-gray-100 border border-gray-300'
                }
              `}
            >
              <Edit size={18} />
              Fork & Edit
            </button>

            <a
              href={`/${params.id}/raw`}
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
              href={`/${params.id}/raw?download=1`}
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
          </div>

          {/* Share Section */}
          <div className={`p-4 border-t ${
            isDark ? 'border-[#3e3e3e]' : 'border-gray-300'
          }`}>
            <p className="text-sm font-semibold mb-2">Share this paste</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={typeof window !== 'undefined' ? window.location.href : ''}
                readOnly
                onClick={(e) => e.currentTarget.select()}
                className={`
                  flex-1 px-3 py-2 rounded border text-xs font-mono
                  ${isDark 
                    ? 'bg-[#1e1e1e] border-[#3e3e3e]' 
                    : 'bg-white border-gray-300'
                  }
                `}
              />
              <button
                onClick={handleCopyURL}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
