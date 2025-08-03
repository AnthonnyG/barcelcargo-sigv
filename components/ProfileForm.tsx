'use client'

import { useEffect, useState } from 'react'

interface SocialLinks {
  youtube: string
  twitch: string
  tiktok: string
  facebook: string
  instagram: string
  twitter: string
}

interface UserProfile {
  name: string
  email: string
  avatar?: string
  socials: SocialLinks
}

export default function ProfileForm() {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: '',
    socials: {
      youtube: '',
      twitch: '',
      tiktok: '',
      facebook: '',
      instagram: '',
      twitter: '',
    },
  })

  const [preview, setPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/user/settings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar || '',
          socials: {
            youtube: data.socials?.youtube || '',
            twitch: data.socials?.twitch || '',
            tiktok: data.socials?.tiktok || '',
            facebook: data.socials?.facebook || '',
            instagram: data.socials?.instagram || '',
            twitter: data.socials?.twitter || '',
          },
        })
        if (data.avatar) setPreview(data.avatar)
      })
      .catch(err => console.error('Erro ao carregar perfil:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name in formData.socials) {
      setFormData(prev => ({
        ...prev,
        socials: { ...prev.socials, [name]: value },
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)

    if (avatarFile) data.append('avatar', avatarFile)

    Object.entries(formData.socials).forEach(([key, value]) => {
      data.append(key, value)
    })

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      if (res.ok) {
        alert('Perfil atualizado!')
      } else {
        alert('Erro ao atualizar perfil.')
      }
    } catch (err) {
      console.error('Erro no update:', err)
    }
  }

  if (loading) return <p className="text-white">A carregar...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      <div>
        <label className="block mb-1">Avatar</label>
        {preview && <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-md mb-2" />}
        <input type="file" accept="image/*" onChange={handleAvatar} />
      </div>

      <div>
        <label className="block mb-1">Nome</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="bg-gray-800 p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="bg-gray-800 p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block mb-1">Redes Sociais</label>
        {Object.entries(formData.socials).map(([key, value]) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key}
            value={value}
            onChange={handleChange}
            className="bg-gray-800 p-2 rounded w-full mb-2"
          />
        ))}
      </div>

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
        Guardar alterações
      </button>
    </form>
  )
}