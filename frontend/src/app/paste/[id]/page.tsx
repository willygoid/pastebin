'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function PastePage() {
  const params = useParams()
  const [paste, setPaste] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await axios.get(`${API_URL}/pastes/${params.id}`)
        setPaste(response.data.data)
      } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error || 'Paste not found'}</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Create New Paste
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h1 className="text-2xl font-bold mb-2">
              {paste.title || 'Untitled Paste'}
            </h1>
            <div className="flex gap-4 text-sm text-gray-300">
              <span>Views: {paste.views}</span>
              <span>Language: {paste.language}</span>
              <span>Created: {new Date(paste.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-0">
            <SyntaxHighlighter
              language={paste.language}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{ margin: 0, borderRadius: 0 }}
            >
              {paste.content}
            </SyntaxHighlighter>
          </div>

          <div className="p-4 bg-gray-100 flex gap-4">
            <a
              href={`${API_URL}/pastes/${paste.id}/raw`}
              target="_blank"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              View Raw
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(paste.content)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Copy Content
            </button>
            <a
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              New Paste
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
