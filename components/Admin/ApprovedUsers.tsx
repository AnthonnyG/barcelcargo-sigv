'use client'

import { useEffect, useState } from 'react'
import { UserRound, Mail, Shield } from 'lucide-react'
import { Role } from '@prisma/client'

interface User {
  id: string
  name: string
  email: string
  role: Role
  isApproved: boolean
}

// Ícones por role
const roleIcons: Record<Role, string> = {
  DRIVER: '🚚 Driver',
  MANAGER: '🛠️ Manager',
  ADMIN: '👑 Admin',
  EXPULSO: '❌ Expulso',
}

export default function ApprovedUsers() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchApproved()
  }, [])

  const fetchApproved = async () => {
    const res = await fetch('/api/users/approved')
    if (!res.ok) {
      console.error('Erro ao buscar usuários aprovados')
      return
    }
    const data: User[] = await res.json()
    const onlyApproved = data.filter(
      (user) => user.isApproved && user.role !== 'EXPULSO'
    )
    setUsers(onlyApproved)
  }

  const handleRoleChange = async (id: string, newRole: Role) => {
    const token = localStorage.getItem('token')

    const res = await fetch('/api/users/approved', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, role: newRole }),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Erro ao atualizar o cargo')
      return
    }

    fetchApproved()
  }

  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {}

  const isAdmin = currentUser.role === 'ADMIN'

  const canAssign = (targetRole: string) => {
    if (!isAdmin && targetRole === 'ADMIN') return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
        <Shield size={20} className="text-green-400" />
        Utilizadores Aprovados
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 px-4">
                  <div className="flex items-center gap-1">
                    <UserRound size={16} /> Nome
                  </div>
                </th>
                <th className="py-2 px-4">
                  <div className="flex items-center gap-1">
                    <Mail size={16} /> Email
                  </div>
                </th>
                <th className="py-2 px-4">
                  <div className="flex items-center gap-1">
                    <Shield size={16} /> Cargo
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800 hover:bg-[#334155] transition duration-150"
                >
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as Role)
                      }
                      disabled={!canAssign(user.role)}
                      className="bg-[#1e293b] border border-gray-700 rounded px-2 py-1 w-full"
                    >
                      {Object.values(Role).map((r) => (
                        <option key={r} value={r}>
                          {roleIcons[r] || r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6 text-sm italic">
          Nenhum utilizador aprovado disponível.
        </div>
      )}
    </div>
  )
}