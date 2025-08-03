'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    })

    const result = await res.json()

   if (result.success) {
  localStorage.setItem('token', result.token)
  localStorage.setItem('user', JSON.stringify(result.user)) // <- ESSENCIAL
  router.push('/dashboard')

    } else {
      setError(result.error || 'Erro ao entrar')
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
          type="password"
          placeholder="Palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded">
          Entrar
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          Ainda não tem conta?{' '}
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => router.push('/register')}
          >
            Registar
          </span>
        </p>

        <p className="text-sm text-gray-400 text-center">
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => router.push('/forgot-password')}
          >
            Recuperar palavra-passe
          </span>
        </p>
      </form>
    </div>
  )
}