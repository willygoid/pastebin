'use client'

import { useRef } from 'react'
import Editor from '@monaco-editor/react'

interface ViewEditorProps {
  value: string
  language: string
  theme: 'vs-dark' | 'light'
}

export default function ViewEditor({ value, language, theme }: ViewEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 21,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      readOnly: true,
      contextmenu: false,
    })
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onMount={handleEditorDidMount}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: true,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: { enabled: true },
      }}
    />
  )
}
