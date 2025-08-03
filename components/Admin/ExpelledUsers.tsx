'use client'

import { useEffect, useState } from 'react'
import { UserX, Mail, CalendarDays } from 'lucide-react'

interface ExpelledUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function ExpelledUsers() {
  const [users, setUsers] = useState<ExpelledUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users/expelled')
      const data = await res.json()
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UserX size={22} className="text-red-500" />
        Utilizadores Expulsos
      </h2>

      {loading ? (
        <p className="text-gray-300">A carregar...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400">Nenhum utilizador expulso.</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-gray-300 border-b border-gray-600">
            <tr>
              <th className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <UserX size={16} /> Nome
                </div>
              </th>
              <th className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <Mail size={16} /> Email
                </div>
              </th>
              <th className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <CalendarDays size={16} /> Registado em
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-700">
                <td className="py-2 px-3">{u.name}</td>
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}