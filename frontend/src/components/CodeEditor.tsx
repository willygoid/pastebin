'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { defineDraculaProTheme, applyDraculaProDecorations } from '@/lib/monacoDraculaPro'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  theme: 'dracula-pro' | 'light'
  readOnly?: boolean
}

export default function CodeEditor({
  value,
  onChange,
  language,
  theme,
  readOnly = false
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  // onMount fires once, so anything it registers closes over that first render's props
  // forever. The content listener below needs the *current* theme - without this ref it
  // kept re-applying the Dracula decorations after a switch to light, painting
  // .dracula-reference-color (#ffffff) onto a white background.
  const themeRef = useRef(theme)
  themeRef.current = theme
  const decorationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
      readOnly: readOnly,
    })

    // Bracket-pair colorization paints brackets gold/orchid/blue over the theme, and
    // in PHP it reaches inside string literals too, where Carbon keeps them string
    // yellow. It is governed by a *model* option - the editor-level
    // `bracketPairColorization` setting reads back as disabled while the decorations
    // keep being produced - so it has to be turned off here.
    editor.getModel()?.updateOptions({ bracketColorizationOptions: { enabled: false } })

    applyDraculaProDecorations(editor, monaco, themeRef.current)
    editor.onDidChangeModelContent(() => {
      clearTimeout(decorationTimeoutRef.current)
      decorationTimeoutRef.current = setTimeout(
        () => applyDraculaProDecorations(editor, monaco, themeRef.current),
        150
      )
    })

    if (!readOnly) {
      editor.focus()
    }
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      applyDraculaProDecorations(editorRef.current, monacoRef.current, theme)
    }
  }, [theme, language])

  // A debounced re-decorate still queued when the editor goes away would run against a
  // disposed instance.
  useEffect(() => () => clearTimeout(decorationTimeoutRef.current), [])

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(value) => !readOnly && onChange(value || '')}
      theme={theme}
      beforeMount={defineDraculaProTheme}
      onMount={handleEditorDidMount}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: readOnly,
        cursorStyle: 'line',
        automaticLayout: true,
      }}
    />
  )
}
