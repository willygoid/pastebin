'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const API_URL = '/api'

export default function PastePage() {
  const params = useParams()
  const router = useRouter()
  const [paste, setPaste] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        console.log('Fetching paste:', params.id)
        const response = await axios.get(`${API_URL}/${params.id}`)
        console.log('Response:', response.data)
        setPaste(response.data.data)
      } catch (err: any) {
        console.error('Error fetching paste:', err)
        setError('Paste not found or has expired')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPaste()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
          <p className="text-xl text-gray-700 mb-4">{error || 'Paste not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            Create New Paste
          </button>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paste.content)
    alert('Content copied to clipboard!')
  }

  const handleCopyURL = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('URL copied to clipboard!')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {paste.title || 'Untitled Paste'}
              </h1>
              <button
                onClick={() => router.push('/')}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                + New Paste
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span>👁️ {paste.views} views</span>
              <span>•</span>
              <span>📝 {paste.language}</span>
              <span>•</span>
              <span>🕒 {new Date(paste.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Code Content */}
          <div className="p-0">
            <SyntaxHighlighter
              language={paste.language}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{ margin: 0, borderRadius: 0, fontSize: '14px' }}
            >
              {paste.content}
            </SyntaxHighlighter>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-100 flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              📋 Copy Content
            </button>
            
            <button
              onClick={handleCopyURL}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
            >
              🔗 Copy URL
            </button>
            
            <a
              href={`/${params.id}/raw`}
              target="_blank"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
            >
              📄 View Raw
            </a>
          </div>
        </div>

        {/* Share URL */}
        <div className="mt-6 p-4 bg-white shadow rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Share this paste:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={handleCopyURL}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
