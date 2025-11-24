'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

const API_URL = '/api'

export default function RawPage() {
  const params = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await axios.get(`${API_URL}/${params.id}/raw`)
        setContent(response.data)
      } catch (err) {
        setContent('Paste not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPaste()
    }
  }, [params.id])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <pre style={{ 
      margin: 0, 
      padding: '20px', 
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }}>
      {content}
    </pre>
  )
}
