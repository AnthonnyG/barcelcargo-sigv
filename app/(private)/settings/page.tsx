'use client'

import { useEffect, useState } from 'react'
import { User, Save, Camera } from 'lucide-react'

interface SocialLinks {
  youtube: string
  twitch: string
  tiktok: string
  facebook: string
  instagram: string
  twitter: string
}

interface UserData {
  name: string
  email: string
  avatar?: string
  socials: SocialLinks
}

export default function SettingsPage() {
  const [data, setData] = useState<UserData>({
    name: '',
    email: '',
    avatar: '',
    socials: {
      youtube: '',
      twitch: '',
      tiktok: '',
      facebook: '',
      instagram: '',
      twitter: ''
    }
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/user/settings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (!user) return
        setData(user)

        // ✅ Garante que preview seja absoluto se backend devolve caminho relativo
        const isAbsolute = user.avatar?.startsWith('http')
        setAvatarPreview(
          isAbsolute ? user.avatar : `${window.location.origin}${user.avatar}`
        )
      })
  }, [])

  const handleInput = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setData(prev => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value }
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setSaving(true)
    setStatus(null)

    try {
      const form = new FormData()
      form.append('name', data.name)
      form.append('email', data.email)

      if (avatarFile) form.append('avatar', avatarFile)

      Object.entries(data.socials).forEach(([key, value]) => {
        form.append(key, value)
      })

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result?.error || 'Erro desconhecido')

      setStatus('Alterações guardadas com sucesso!')
    } catch (err) {
      setStatus('Erro ao guardar alterações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#10172A] to-[#0e1a2b] text-white p-6 grid grid-cols-1 md:grid-cols-6 gap-6">
      <div className="md:col-span-6 bg-[#1e293b] rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User size={24} /> Definições do Perfil
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 rounded-md object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-md bg-gray-700 flex items-center justify-center text-sm">
              Sem avatar
            </div>
          )}
          <label className="cursor-pointer flex items-center gap-2">
            <Camera size={18} />
            <span className="underline">Escolher ficheiro</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input
            className="w-full bg-[#161c2a] text-white p-2 rounded-md"
            value={data.name}
            onChange={(e) => handleInput('name', e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full bg-[#161c2a] text-white p-2 rounded-md"
            value={data.email}
            onChange={(e) => handleInput('email', e.target.value)}
          />
        </div>

        {/* Redes Sociais */}
        <div>
          <label className="block text-lg font-semibold mb-2">Redes Sociais</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(data.socials).map(([platform, value]) => (
              <input
                key={platform}
                placeholder={platform}
                className="w-full bg-[#161c2a] text-white p-2 rounded-md"
                value={value}
                onChange={(e) =>
                  handleSocialChange(platform as keyof SocialLinks, e.target.value)
                }
              />
            ))}
          </div>
        </div>

        {/* Guardar */}
        <div className="pt-4 flex items-center gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
          {status && <span className="text-sm">{status}</span>}
        </div>
      </div>
    </div>
  )
}