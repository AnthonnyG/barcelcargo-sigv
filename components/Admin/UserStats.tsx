'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, UserCheck, Users, User } from 'lucide-react'

export default function UserStats() {
  const [stats, setStats] = useState({ admins: 0, managers: 0, drivers: 0, total: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/users/stats')
      const data = await res.json()
      setStats(data)
    }

    fetchStats()
  }, [])

  const cards = [
    { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'bg-red-600' },
    { label: 'Managers', value: stats.managers, icon: UserCheck, color: 'bg-green-600' },
    { label: 'Drivers', value: stats.drivers, icon: User, color: 'bg-yellow-500' },
    { label: 'Total', value: stats.total, icon: Users, color: 'bg-gradient-to-br from-sky-600 to-indigo-700' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-[#1e293b] rounded-2xl p-5 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition"
        >
          <div className={`${color} p-3 rounded-xl shadow-md`}>
            <Icon size={26} className="text-white drop-shadow" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white group-hover:text-green-400 transition">{value}</p>
            <p className="text-gray-400 text-sm tracking-wide">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}