'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  theme: 'dark' | 'light'
  /** Defaults to showing the filter box only for lists long enough to need one. */
  searchable?: boolean
  searchPlaceholder?: string
  emptyLabel?: string
  ariaLabel?: string
}

export default function SearchableSelect({
  value,
  options,
  onChange,
  theme,
  searchable,
  searchPlaceholder = 'Search...',
  emptyLabel = 'No match',
  ariaLabel,
}: SearchableSelectProps) {
  const isDark = theme === 'dark'
  const showSearch = searchable ?? options.length > 8

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<Array<HTMLLIElement | null>>([])
  const listId = useId()

  const selected = options.find(opt => opt.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    // Match the value too, so typing "cpp" finds "C++" and "js" is one keystroke from
    // "javascript" even though neither label contains the query.
    return options.filter(
      opt => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    )
  }, [options, query])

  // Every open starts from a clean filter, with the current selection highlighted.
  useEffect(() => {
    if (!open) return
    setQuery('')
    const i = options.findIndex(opt => opt.value === value)
    setActiveIndex(i < 0 ? 0 : i)
  }, [open, options, value])

  useEffect(() => {
    if (open && showSearch) inputRef.current?.focus()
  }, [open, showSearch])

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const commit = (opt?: SelectOption) => {
    if (opt) onChange(opt.value)
    close()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    const count = filtered.length
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (count) setActiveIndex(i => (i + 1) % count)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (count) setActiveIndex(i => (i - 1 + count) % count)
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(Math.max(count - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        commit(filtered[activeIndex])
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const control = isDark
    ? 'bg-[#22212c] border-[#3e3b50] hover:border-[#4d4962]'
    : 'bg-white border-gray-300 hover:border-gray-400'
  const panel = isDark ? 'bg-[#282633] border-[#3e3b50]' : 'bg-white border-gray-300'
  const divider = isDark ? 'border-[#3e3b50]' : 'border-gray-200'

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 rounded border text-sm
          text-left transition-colors focus:outline-none focus:border-blue-500 ${control}
        `}
      >
        <span className={selected ? 'truncate' : 'truncate opacity-60'}>
          {selected ? selected.label : 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-1 w-full rounded border shadow-2xl overflow-hidden ${panel}`}
        >
          {showSearch && (
            <div className={`flex items-center gap-2 px-3 border-b ${divider}`}>
              <Search size={14} className="shrink-0 opacity-60" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  filtered.length ? `${listId}-${activeIndex}` : undefined
                }
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                placeholder={searchPlaceholder}
                className={`
                  w-full bg-transparent py-2 text-sm focus:outline-none
                  ${isDark ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'}
                `}
              />
            </div>
          )}

          <ul id={listId} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm opacity-60">{emptyLabel}</li>
            )}
            {filtered.map((opt, i) => {
              const isActive = i === activeIndex
              const isSelected = opt.value === value
              return (
                <li
                  key={opt.value}
                  id={`${listId}-${i}`}
                  ref={el => {
                    optionRefs.current[i] = el
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(opt)}
                  className={`
                    flex items-center justify-between gap-2 px-3 py-1.5 text-sm cursor-pointer
                    ${isActive ? (isDark ? 'bg-[#454158]' : 'bg-gray-100') : ''}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      size={14}
                      className={`shrink-0 ${isDark ? 'text-[#8aff80]' : 'text-blue-600'}`}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
