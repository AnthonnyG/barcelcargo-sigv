'use client'

import { ShieldCheck } from 'lucide-react'
import KmChart from '@/components/Admin/KmChart'
import TripList from '@/components/Admin/TripList'
import PendingUsers from '@/components/Admin/PendingUsers'
import ApprovedUsers from '@/components/Admin/ApprovedUsers'
import ExpelledUsers from '@/components/Admin/ExpelledUsers'
import UserStats from '@/components/Admin/UserStats'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 space-y-10">
      {/* Título central com ícone */}
      <div className="flex justify-center items-center gap-3">
        <ShieldCheck size={28} className="text-green-500" />
        <h1 className="text-3xl font-bold text-center">Painel de Administração</h1>
      </div>

      {/* Row: KM chart + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-2xl shadow-lg">
          <KmChart />
        </div>
        <UserStats />
      </div>

      {/* Row: Últimas Viagens */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
        <TripList />
      </div>

      {/* Tabela: Pendentes */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
        <PendingUsers />
      </div>

      {/* Tabela: Aprovados */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
        <ApprovedUsers />
      </div>

      {/* Tabela: Expulsos */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
        <ExpelledUsers />
      </div>
    </div>
  )
}