import { PHP_ATOMS, PHP_BUILTINS, PHP_KEYWORDS } from './phpBuiltins'

// Dracula Pro theme for Monaco Editor.
//
// Every hex below was read back out of carbon.now.sh running its own "Dracula Pro"
// theme (getComputedStyle on the rendered CodeMirror spans), then normalised to the
// Dracula Pro (Original) Sublime palette. These are sampled values, not eyeballed
// ones. The CodeMirror token -> color map it produced, which the rules mirror:
//
//   comment                                  #7470a9
//   keyword / operator / tag                 #ff80bf
//   def, variable, attribute                 #8aff80   (declarations + globals)
//   variable-2                               #ffffff   (a *local* name being read)
//   property (after a dot, CSS props)        #80ffea
//   string, string-2 (template, regex)       #ffff80
//   number                                   #9580ff
//   atom, builtin, qualifier, meta, brackets #f8f8f2
//
// The palette is the Dracula Pro (Original) one from the Sublime color scheme:
// background #22212c, selection #454158, comment #7470a9 (the background at
// s25/l55), accent purple #9580ff. Carbon's sampled comment was #7970a9, one
// shade brighter; that is normalised to the scheme value here.
const colors = {
  background: '#22212c',
  selection: '#454158',
  // Dracula Pro derives line-highlight from the background at s25/l25.
  lineHighlight: '#323050',
  foreground: '#f8f8f2',
  comment: '#7470a9',
  cyan: '#80ffea',
  blue: '#80bfff',
  green: '#8aff80',
  orange: '#ffca80',
  pink: '#ff80bf',
  purple: '#9580ff',
  red: '#ff9580',
  yellow: '#ffff80',
  // A local variable being *read* is pure white in Carbon, a shade brighter than the
  // editor's default foreground. See applyDraculaProDecorations.
  reference: '#ffffff',
}

let defined = false

// Monaco can register a language's tokenizer a tick after the editor mounts. Retry
// for up to a second so the first paint never keeps decorations that were computed
// without string/comment ranges.
const TOKENIZER_RETRY_MS = 50
const MAX_TOKENIZER_RETRIES = 20

const DOT_ACCESS_LANGUAGES = new Set([
  'javascript', 'typescript', 'java', 'csharp', 'c', 'cpp', 'go', 'rust', 'python', 'ruby',
])

export function defineDraculaProTheme(monaco: any) {
  if (defined) return
  defined = true

  monaco.editor.defineTheme('dracula-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Carbon renders every token upright at weight 400 - comments included - and
      // `fontStyle: 'normal'` is how a Monaco rule clears a style rather than leaving
      // it to be inherited from the vs-dark base.
      { token: 'comment', foreground: colors.comment.slice(1), fontStyle: 'normal' },
      { token: 'keyword', foreground: colors.pink.slice(1) },
      { token: 'keyword.other', foreground: colors.pink.slice(1) },
      { token: 'operator', foreground: colors.pink.slice(1) },
      // Carbon colors any identifier green unless it resolves to a local binding, so
      // green is the base and the white "local reference" case is painted on top.
      { token: 'identifier', foreground: colors.green.slice(1) },
      { token: 'type.identifier', foreground: colors.green.slice(1) },
      { token: 'type', foreground: colors.green.slice(1) },
      { token: 'string', foreground: colors.yellow.slice(1) },
      { token: 'string.escape', foreground: colors.yellow.slice(1) },
      { token: 'regexp', foreground: colors.yellow.slice(1) },
      { token: 'number', foreground: colors.purple.slice(1) },
      { token: 'number.float', foreground: colors.purple.slice(1) },
      { token: 'number.hex', foreground: colors.purple.slice(1) },
      { token: 'number.octal', foreground: colors.purple.slice(1) },
      { token: 'number.binary', foreground: colors.purple.slice(1) },
      { token: 'delimiter', foreground: colors.foreground.slice(1) },
      { token: 'delimiter.bracket', foreground: colors.foreground.slice(1) },
      { token: 'delimiter.parenthesis', foreground: colors.foreground.slice(1) },
      { token: 'delimiter.square', foreground: colors.foreground.slice(1) },
      { token: 'tag', foreground: colors.pink.slice(1) },
      { token: 'metatag', foreground: colors.pink.slice(1), fontStyle: 'normal' },
      // vs-dark ships `metatag.php` in bold, and being the longer token path it beats
      // the plain `metatag` rule above - so `<?php` and `?>` need their own entry.
      { token: 'metatag.php', foreground: colors.pink.slice(1), fontStyle: 'normal' },
      { token: 'attribute.name', foreground: colors.green.slice(1) },
      { token: 'attribute.value', foreground: colors.yellow.slice(1) },
      { token: 'variable', foreground: colors.green.slice(1) },
      // PHP's $vars come through as variable.php; CodeMirror classes every one of them
      // as variable-2, which Dracula Pro paints white rather than green.
      { token: 'variable.php', foreground: colors.reference.slice(1) },
      { token: 'predefined', foreground: colors.foreground.slice(1) },
      { token: 'constant', foreground: colors.foreground.slice(1) },
      { token: 'invalid', foreground: colors.red.slice(1) },
    ],
    colors: {
      'editor.background': colors.background,
      'editor.foreground': colors.foreground,
      'editorLineNumber.foreground': colors.comment,
      'editorLineNumber.activeForeground': colors.foreground,
      'editor.lineHighlightBackground': colors.lineHighlight,
      'editor.selectionBackground': colors.selection,
      // The Sublime scheme paints inactive selections with the same solid color.
      'editor.inactiveSelectionBackground': colors.selection,
      'editorCursor.foreground': colors.foreground,
      'editorWhitespace.foreground': colors.comment + '80',
      'editorIndentGuide.background': colors.lineHighlight,
      'editorIndentGuide.activeBackground': colors.comment,
      // `find_highlight` is yellow in Dracula Pro, not purple.
      'editor.findMatchBackground': colors.yellow,
      'editor.findMatchHighlightBackground': colors.yellow + '66',
      'editorBracketMatch.background': colors.selection,
      'editorBracketMatch.border': colors.purple,
      'editorGutter.background': colors.background,
      'editorWidget.background': colors.selection,
      'editorWidget.border': colors.comment,
      'editorSuggestWidget.background': colors.selection,
      'editorSuggestWidget.selectedBackground': colors.comment,
      'minimap.background': colors.background,
      'scrollbarSlider.background': colors.selection + '80',
      'scrollbarSlider.hoverBackground': colors.selection,
    },
  })
}

// Monaco's JS/TS tokenizer flattens distinctions the Dracula Pro palette depends on:
// operators (=, =>, ?, :) and plain delimiters (, . ;) are both "delimiter"; ".foo"
// and "foo" are both "identifier"; and nothing tells a local variable being read apart
// from a free/global name. We recover those cases by scanning the raw line text with
// regexes, using Monaco's own tokenizer only to find the string/comment/regexp ranges
// we must stay out of.
const OPERATOR_RE = /(=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\+\+|--|\*\*|[=+\-*/%<>!&|^~?:])/g
// PHP is the same minus the colon: CodeMirror treats `:` and `::` as punctuation, so
// return types, named arguments, enum backing types, `Foo::BAR` and the second half of
// a ternary all stay foreground while `?` itself is still pink.
const PHP_OPERATOR_RE = /(=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\+\+|--|\*\*|[=+\-*/%<>!&|^~?])/g
// Negative lookbehind keeps this from matching inside "..." (rest/spread), which is
// three dots in a row followed by an identifier, not a property/method access.
const METHOD_RE = /(?<!\.)\.\s*([A-Za-z_$][\w$]*)/g
// Any identifier that isn't glued to a preceding dot or word character.
const IDENT_RE = /(?<![\w$.])([A-Za-z_$][\w$]*)/g
const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if',
  'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this',
  'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'async', 'await',
  'static', 'get', 'set', 'of', 'as', 'from', 'true', 'false', 'null', 'undefined',
])
// Names a language paints in plain foreground instead of the pink it gives keywords or
// the green it gives user-defined identifiers: JS literals, and PHP's magic constants
// plus its 720 builtin functions. Monaco has no token of its own for either group.
const JS_ATOMS = new Set(['true', 'false', 'null', 'undefined'])
const PHP_NEUTRAL = new Set([...PHP_ATOMS, ...PHP_BUILTINS])

function neutralNamesFor(languageId: string): Set<string> | null {
  if (languageId === 'javascript' || languageId === 'typescript') return JS_ATOMS
  if (languageId === 'php') return PHP_NEUTRAL
  return null
}

// Monaco's PHP keyword list is smaller than CodeMirror's - `self`, `parent`, `match`
// and friends come through as plain identifiers - so the gap is painted pink here.
// Anything reached through `->` or `::` is a member name, not a keyword, whatever it
// happens to be spelled.
const PHP_MEMBER_ACCESS_RE = /(?:->|::)\s*$/
// Monaco hands back a double-quoted PHP string as one undifferentiated `string` token,
// but CodeMirror picks the interpolations out of it. The braces read as foreground in
// every form; what differs is the name - a variable in `$name` and `{$name}` (white),
// but a bare name in `${name}` (green).
const PHP_INTERP_RE = /\{(\$[A-Za-z_]\w*)\}|(\$)\{([A-Za-z_]\w*)\}|(\$[A-Za-z_]\w*)/g
// `<?php` arrives as one metatag token, but Carbon colours the `<?` and the `php` apart.
const PHP_OPEN_RE = /<\?(php)\b/gi
// const/let/var NAME = ...
const VAR_DECL_RE = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g
// function NAME( ... / class NAME ...
const FUNC_NAME_RE = /\b(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/g
// bare single-param arrow: `x =>` (not preceded by a word char or dot, so it isn't a
// property access or part of a longer identifier)
const ARROW_PARAM_RE = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>/g
// a parenthesized parameter list immediately followed by `=>`, or by `{` for a
// `function(...)` body - either way we only care about the raw text between `(` `)`
const PARAM_LIST_RE = /\(([^()]*)\)\s*(?:=>|\{)/g

// Finds each plain parameter name in a raw "(...)" params string, along with its
// offset within that string, so the caller can map it back to a position in the line.
// Bails out entirely (returns []) if the list contains destructuring ({ } or [ ]) -
// too easy to misattribute a destructured property as a top-level param with a regex.
function findParamNamePositions(paramsText: string): Array<{ name: string; offset: number }> {
  if (paramsText.includes('{') || paramsText.includes('[')) return []

  const results: Array<{ name: string; offset: number }> = []
  const re = /(?:^|,)\s*\.{0,3}\s*([A-Za-z_$][\w$]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(paramsText))) {
    const name = m[1]
    if (JS_KEYWORDS.has(name)) continue
    const offset = m.index + m[0].lastIndexOf(name)
    results.push({ name, offset })
  }
  return results
}

// Offsets within `lineContent` where a name is being *introduced* rather than read.
// Those stay green; only the reads get repainted white.
function collectDeclarations(lineContent: string): Map<number, string> {
  const decls = new Map<number, string>()
  let m: RegExpExecArray | null

  for (const re of [VAR_DECL_RE, FUNC_NAME_RE]) {
    re.lastIndex = 0
    while ((m = re.exec(lineContent))) {
      decls.set(m.index + m[0].lastIndexOf(m[1]), m[1])
    }
  }

  ARROW_PARAM_RE.lastIndex = 0
  while ((m = ARROW_PARAM_RE.exec(lineContent))) {
    if (JS_KEYWORDS.has(m[1])) continue
    decls.set(m.index, m[1])
  }

  PARAM_LIST_RE.lastIndex = 0
  while ((m = PARAM_LIST_RE.exec(lineContent))) {
    const paramsStart = m.index + 1 // just past the "("
    for (const { name, offset } of findParamNamePositions(m[1])) {
      decls.set(paramsStart + offset, name)
    }
  }

  return decls
}

// Monaco tokenizes a quoted HTML/XML attribute value as `attribute.value.html`,
// not as `string.html`. The old `string|comment|regexp` filter therefore let the
// raw-regex passes paint `:`, `/`, `!` and `.com` inside e.g.
// `<meta description="Contoh : google.com/inistring!asd/test">`. Exclude every
// token type that stands for literal text: strings, comments, regexps, attribute
// values/names, tags, metatags and markup text. Embedded JS/CSS keeps its own
// token types, so those ranges are still decorated normally.
const LITERAL_TOKEN_RE = /^(string|comment|regexp|attribute\.(value|name)|tag|metatag|text)/

function getExcludedRanges(lineContent: string, lineTokens: any[]): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (let i = 0; i < lineTokens.length; i++) {
    const token = lineTokens[i]
    if (LITERAL_TOKEN_RE.test(token.type)) {
      const end = i + 1 < lineTokens.length ? lineTokens[i + 1].offset : lineContent.length
      ranges.push([token.offset, end])
    }
  }
  return ranges
}

function isExcluded(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end)
}

export function applyDraculaProDecorations(editor: any, monaco: any, theme: string) {
  const model = editor.getModel()
  if (!model) return

  const languageId = model.getLanguageId ? model.getLanguageId() : model.getModeId()
  const prevIds = editor.__pastefelDraculaDecorations || []

  clearTimeout(editor.__pastefelDraculaTokenizerRetry)

  // Prose languages have no operators or property access to recolor, and marking up
  // their punctuation would be actively wrong.
  if (theme !== 'dracula-pro' || languageId === 'plaintext' || languageId === 'markdown') {
    editor.__pastefelDraculaDecorations = editor.deltaDecorations(prevIds, [])
    editor.__pastefelDraculaTokenizerAttempts = 0
    return
  }

  // Monaco loads tokenizers for some languages lazily. An early tokenize() call can
  // return tokens with empty types, which makes the exclusion filter below a no-op
  // and lets the raw-regex passes paint inside strings and comments (for example
  // turning `<!-- Main Heading -->` pink). Clear the decorations and retry briefly
  // instead of leaving that wrong first paint on screen.
  const allTokens = monaco.editor.tokenize(model.getValue(), languageId)
  const hasTokenTypes = allTokens.some((line: any[]) => line.some((token: any) => token.type))
  if (!hasTokenTypes) {
    editor.__pastefelDraculaDecorations = editor.deltaDecorations(prevIds, [])
    const attempts = editor.__pastefelDraculaTokenizerAttempts || 0
    if (attempts < MAX_TOKENIZER_RETRIES) {
      editor.__pastefelDraculaTokenizerAttempts = attempts + 1
      editor.__pastefelDraculaTokenizerRetry = setTimeout(
        () => applyDraculaProDecorations(editor, monaco, theme),
        TOKENIZER_RETRY_MS
      )
    }
    return
  }
  editor.__pastefelDraculaTokenizerAttempts = 0

  // Scope tracking (declaration green vs. reference white) is parsed with JS syntax,
  // so it only runs there.
  const isJs = languageId === 'javascript' || languageId === 'typescript'
  // The cyan "after a dot" pass only makes sense where `.` is member access. PHP uses
  // it for concatenation, and in YAML/CSS/SQL/markup it separates keys, selectors or
  // punctuation - there it would paint the wrong identifier cyan (e.g. `foo.bar` in
  // YAML, where the whole key should keep one color).
  const hasDotAccess = DOT_ACCESS_LANGUAGES.has(languageId)
  const neutral = neutralNamesFor(languageId)

  const decorations: any[] = []
  const lineCount = model.getLineCount()

  // `allTokens` is tokenized above in one go. Monaco's tokenizers are stateful across
  // lines, and several languages depend on it - feeding PHP a single line in isolation
  // leaves it in HTML state and yields no tokens at all, so the string and comment
  // ranges the passes below must avoid would come back empty.

  // First pass: every name the file binds somewhere. A read of one of these is a local
  // reference (white); anything else - an import, a global like `console`, an unresolved
  // name - stays green, which is how CodeMirror's scope tracking makes Carbon look.
  const locals = new Set<string>()
  const perLineDecls: Array<Map<number, string>> = []
  if (isJs) {
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const decls = collectDeclarations(model.getLineContent(lineNumber))
      perLineDecls.push(decls)
      for (const name of decls.values()) locals.add(name)
    }
  }

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber)
    if (!lineContent) continue

    const excluded = getExcludedRanges(lineContent, allTokens[lineNumber - 1] || [])
    const decls = perLineDecls[lineNumber - 1] || new Map<number, string>()

    const pushDecoration = (offset: number, length: number, className: string) => {
      decorations.push({
        range: new monaco.Range(lineNumber, offset + 1, lineNumber, offset + 1 + length),
        options: { inlineClassName: className },
      })
    }

    const addDecoration = (offset: number, length: number, className: string) => {
      if (isExcluded(offset, excluded)) return
      pushDecoration(offset, length, className)
    }

    // The interpolation pass deliberately works *inside* string ranges, which is why
    // it writes through pushDecoration rather than addDecoration.
    if (languageId === 'php') {
      const lineTokens = allTokens[lineNumber - 1] || []
      for (let i = 0; i < lineTokens.length; ) {
        if (!/^string/.test(lineTokens[i].type)) {
          i++
          continue
        }
        // An escape splits one literal into string / string.escape / string, so walk
        // the whole run - otherwise only the part before the first \" would be seen,
        // and the quote check below would reject the rest.
        const start = lineTokens[i].offset
        let j = i
        while (j + 1 < lineTokens.length && /^string/.test(lineTokens[j + 1].type)) j++
        const end = j + 1 < lineTokens.length ? lineTokens[j + 1].offset : lineContent.length
        i = j + 1

        if (lineContent[start] !== '"') continue // single-quoted strings don't interpolate
        const body = lineContent.slice(start, end)

        PHP_INTERP_RE.lastIndex = 0
        let im: RegExpExecArray | null
        while ((im = PHP_INTERP_RE.exec(body))) {
          const at = start + im.index
          if (body[im.index - 1] === '\\') continue // \$name is an escape, not a variable
          if (im[1]) {
            pushDecoration(at, 1, 'dracula-neutral-color')
            pushDecoration(at + 1, im[1].length, 'dracula-reference-color')
            pushDecoration(at + 1 + im[1].length, 1, 'dracula-neutral-color')
          } else if (im[3]) {
            pushDecoration(at, 1, 'dracula-reference-color')
            pushDecoration(at + 1, 1, 'dracula-neutral-color')
            pushDecoration(at + 2, im[3].length, 'dracula-green-color')
            pushDecoration(at + 2 + im[3].length, 1, 'dracula-neutral-color')
          } else if (im[4]) {
            pushDecoration(at, im[4].length, 'dracula-reference-color')
          }
        }
      }
    }

    let m: RegExpExecArray | null

    if (hasDotAccess) {
      METHOD_RE.lastIndex = 0
      while ((m = METHOD_RE.exec(lineContent))) {
        addDecoration(m.index + m[0].indexOf(m[1]), m[1].length, 'dracula-method-color')
      }
    }

    if (languageId === 'php') {
      PHP_OPEN_RE.lastIndex = 0
      while ((m = PHP_OPEN_RE.exec(lineContent))) {
        addDecoration(m.index + m[0].indexOf(m[1]), m[1].length, 'dracula-green-color')
      }
    }

    const operatorRe = languageId === 'php' ? PHP_OPERATOR_RE : OPERATOR_RE
    operatorRe.lastIndex = 0
    while ((m = operatorRe.exec(lineContent))) {
      addDecoration(m.index, m[0].length, 'dracula-operator-color')
    }

    IDENT_RE.lastIndex = 0
    while ((isJs || neutral) && (m = IDENT_RE.exec(lineContent))) {
      const name = m[1]
      if (languageId === 'php') {
        if (PHP_MEMBER_ACCESS_RE.test(lineContent.slice(0, m.index))) continue
        if (PHP_KEYWORDS.has(name)) {
          addDecoration(m.index, name.length, 'dracula-keyword-color')
          continue
        }
      }
      if (neutral && neutral.has(name)) {
        addDecoration(m.index, name.length, 'dracula-neutral-color')
        continue
      }
      if (!isJs) continue
      if (JS_KEYWORDS.has(name)) continue
      if (decls.has(m.index)) continue // the declaration itself stays green
      if (!locals.has(name)) continue // free/global name - also green
      addDecoration(m.index, name.length, 'dracula-reference-color')
    }
  }

  editor.__pastefelDraculaDecorations = editor.deltaDecorations(prevIds, decorations)
}
