// The language ids stored with a paste are the labels shown in the settings dropdown.
// Monaco uses a few different ids internally; passing an unknown one leaves the model
// as plaintext, so Bash pastes silently lose all syntax highlighting.
const LANGUAGE_ALIASES: Record<string, string> = {
  text: 'plaintext',
  bash: 'shell',
}

export function toMonacoLanguageId(language: string): string {
  return LANGUAGE_ALIASES[language] || language
}
