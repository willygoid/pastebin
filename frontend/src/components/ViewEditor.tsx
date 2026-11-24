'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { defineDraculaProTheme, applyDraculaProDecorations } from '@/lib/monacoDraculaPro'

interface ViewEditorProps {
  value: string
  language: string
  theme: 'dracula-pro' | 'light'
}

export default function ViewEditor({ value, language, theme }: ViewEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.updateOptions({
      fontSize: 14,
      // carbon.now.sh renders Dracula Pro in Hack at 14px/18.62px. Monaco only does
      // integer line heights, so 19 is as close as it gets. The old stack named fonts
      // the app never shipped, so it was silently falling through to Courier New.
      lineHeight: 19,
      fontFamily: "'Hack', 'JetBrains Mono', Menlo, monospace",
      fontWeight: '400',
      letterSpacing: 0,
      padding: { top: 16, bottom: 16 },
      lineNumbersMinChars: 3,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      readOnly: true,
      contextmenu: false,
    })

    // Bracket-pair colorization paints brackets gold/orchid/blue over the theme, and
    // in PHP it reaches inside string literals too, where Carbon keeps them string
    // yellow. It is governed by a *model* option - the editor-level
    // `bracketPairColorization` setting reads back as disabled while the decorations
    // keep being produced - so it has to be turned off here.
    editor.getModel()?.updateOptions({ bracketColorizationOptions: { enabled: false } })

    applyDraculaProDecorations(editor, monaco, theme)
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      applyDraculaProDecorations(editorRef.current, monacoRef.current, theme)
    }
  }, [theme, language, value])

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      beforeMount={defineDraculaProTheme}
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
