'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()

      if (result.success) {
        setMessage('Foi enviado um email com instruções para recuperar a palavra-passe.')
        setEmail('')
      } else {
        setError(result.error || 'Erro ao processar o pedido.')
      }
    } catch (err) {
      setError('Erro na ligação com o servidor.')
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-white">Recuperar Acesso</h1>
        </div>

        <input
          type="email"
          placeholder="Email da conta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-[#0f172a] text-white placeholder-gray-400 focus:outline-none"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded ${
            loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'A enviar...' : 'Enviar recuperação'}
        </button>
      </form>
    </div>
  )
}