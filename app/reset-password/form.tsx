'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError('Link de recuperação inválido.')
      return
    }

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      return
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const result = await res.json()

    if (result.success) {
      setMessage('Palavra-passe atualizada com sucesso.')
      setError('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setError(result.error || 'Erro ao atualizar palavra-passe.')
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4"
      >
        <div className="flex flex-col items-center">
          <img src="/logo.jpg" alt="Logo" className="w-24 h-24 mb-3" />
          <h1 className="text-2xl font-bold text-white">Nova Password</h1>
        </div>

        <input
          type="password"
          placeholder="Nova Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Confirmar Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
        >
          Redefinir Password
        </button>
      </form>
    </div>
  )
}