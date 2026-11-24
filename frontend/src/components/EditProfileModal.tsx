'use client'

import { useState } from 'react'
import { authService, User } from '@/lib/auth'
import toast from 'react-hot-toast'
import Avatar from './Avatar'

interface EditProfileModalProps {
  user: User
  isDark: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EditProfileModal({ user, isDark, onClose, onSaved }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateProfile({ full_name: fullName, email })
      toast.success('Profile updated!')
      onSaved()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl p-5 max-w-sm w-full border ${isDark ? 'bg-[#2f2c3c] border-[#3e3b50]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-5">
          <Avatar name={fullName || user.username} size="md" />
          <div>
            <h3 className="text-base font-bold">Edit Profile</h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>@{user.username}</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none ${isDark
                  ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
                }`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none ${isDark
                  ? 'bg-[#22212c] border-[#3e3b50] text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:border-blue-500'
                }`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-[#3e3b50] hover:bg-[#3e3b50]' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
