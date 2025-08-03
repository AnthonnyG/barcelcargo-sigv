'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setError('As palavras-passe não coincidem')
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await res.json()

    if (result.success) {
      setSuccess('Conta criada. Aguarde aprovação.')
      setName('')
      setEmail('')
      setPassword('')
      setConfirm('')
    } else {
      setError(result.error || 'Erro ao registar')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4">
      <form className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <img src="/logo.jpg" alt="Logo" className="w-24 h-24 mb-3" />
          <h1 className="text-2xl font-bold text-white">SIGV</h1>
        </div>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Confirmar palavra-passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded">
          Registar
        </button>

        <div className="text-sm text-center pt-2">
          <span className="text-gray-400">Já tem conta? </span>
          <span
            className="text-blue-400 hover:text-blue-500 underline cursor-pointer"
            onClick={() => router.push('/login')}
          >
            Faça login
          </span>
        </div>
      </form>
    </div>
  )
}