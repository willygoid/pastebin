'use client'

const COLORS = [
  'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600',
  'bg-green-600', 'bg-teal-600', 'bg-cyan-600', 'bg-red-600',
]

function colorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

interface AvatarProps {
  name: string
  size?: keyof typeof SIZES
  className?: string
}

export default function Avatar({ name, size = 'sm', className = '' }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} ${colorFor(name || '?')} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
    >
      {initialsFor(name || '?')}
    </div>
  )
}
