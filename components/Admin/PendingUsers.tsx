'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Trash2, User2 } from 'lucide-react'

interface PendingUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'DRIVER'
}

export default function PendingUsers() {
  const [users, setUsers] = useState<PendingUser[]>([])

  const fetchPending = async () => {
    const res = await fetch('/api/users/pending')
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (id: string) => {
    if (confirm('Aprovar este utilizador?')) {
      await fetch('/api/users/pending', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchPending()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Eliminar este utilizador?')) {
      await fetch('/api/users/pending', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchPending()
    }
  }

  return (
    <div className="space-y-4">
      {/* Título fixo com ícone */}
      <div className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
        <User2 size={20} className="text-blue-400" />
        Utilizadores Pendentes
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          className="flex justify-between items-center bg-[#0f172a] border border-gray-700 p-4 rounded-xl shadow transition hover:shadow-lg"
        >
          <div>
            <p className="font-semibold flex items-center gap-2">
              <User2 size={16} className="text-blue-400" />
              {user.name}
              <span className="text-xs text-gray-400">({user.role})</span>
            </p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(user.id)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
            >
              <CheckCircle size={16} />
              Aprovar
            </button>
            <button
              onClick={() => handleDelete(user.id)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="text-center text-gray-500 py-6 text-sm italic">
          Nenhum utilizador pendente de aprovação.
        </div>
      )}
    </div>
  )
}