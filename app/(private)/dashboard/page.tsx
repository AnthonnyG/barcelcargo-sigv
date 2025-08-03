'use client'

import { useEffect, useState } from 'react'
import {
  MapPin,
  Truck,
  PackageCheck,
  Clock3,
  DownloadCloud,
} from 'lucide-react'

type User = { name: string }

type ResumoPessoal = {
  kmMes: number
  cargas: number
  limiteKm: number
}

type ResumoEmpresa = {
  total: { km: number, cargas: number }
  ETS2: { km: number, cargas: number }
  ATS: { km: number, cargas: number }
}

type Viagem = {
  motorista: string
  camiao: string
  origem: string
  destino: string
  distancia: number
  dano: number
  velocidadeMax: number
  hora: string
}

type DashboardData = {
  user: User
  resumoPessoal: ResumoPessoal
  resumoEmpresa: ResumoEmpresa
  viagensHoje: Viagem[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState<'total' | 'ETS2' | 'ATS'>('total')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Sem token. Faça login novamente.')
      setLoading(false)
      return
    }

    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setData)
      .catch(() => setError('Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white p-4">A carregar...</div>
  if (error || !data) return <div className="text-red-500 p-4">⚠️ {error}</div>

  const { user, resumoPessoal, resumoEmpresa, viagensHoje } = data
  const resumoAtual = resumoEmpresa[selectedTab]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#10172A] to-[#0e1a2b] text-white p-6 grid grid-cols-1 md:grid-cols-6 gap-6">

      {/* Título */}
      <div className="md:col-span-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Bem-vindo, {user.name} <span className="animate-waving-hand">👋</span>
        </h1>
      </div>

      {/* Resumo Pessoal */}
      <div className="md:col-span-2 bg-[#1e293b] rounded-2xl shadow-lg p-6 space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <PackageCheck size={20} /> Resumo Pessoal
        </h2>
        <p>Distância este mês: <span className="font-bold">{resumoPessoal.kmMes} km</span></p>
        <p>Cargas este mês: <span className="font-bold">{resumoPessoal.cargas}</span></p>
        <p>Limite mensal: <span className="font-bold">{resumoPessoal.kmMes} / {resumoPessoal.limiteKm} km</span></p>
      </div>

      {/* Resumo Empresa com Tabs */}
      <div className="md:col-span-2 bg-[#1e293b] rounded-2xl shadow-lg p-6 space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Truck size={20} /> Resumo da Empresa
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          {(['total', 'ETS2', 'ATS'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedTab === key ? 'bg-white text-black' : 'bg-gray-700 text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <p>Distância: <span className="font-bold">{resumoAtual.km.toLocaleString('pt-PT')} km</span></p>
        <p>Cargas: <span className="font-bold">{resumoAtual.cargas.toLocaleString('pt-PT')}</span></p>
      </div>

      {/* App Download + Live Map */}
      <div className="md:col-span-2 bg-[#1e293b] rounded-2xl shadow-lg p-6 flex flex-col justify-between gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DownloadCloud size={20} /> Aplicação SIGV
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <a href="#" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded text-center">
            Download App
          </a>
          <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-center">
            Ver Mapa
          </a>
        </div>
      </div>

      {/* Viagens Hoje */}
      <div className="md:col-span-6 bg-[#1e293b] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock3 size={20} /> Viagens Hoje (Empresa)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-300 border-b border-gray-600">
              <tr>
                <th>Motorista</th>
                <th>Camião</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Distância</th>
                <th>Dano</th>
                <th>Velocidade</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody className="text-gray-100">
              {viagensHoje.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">Nenhuma viagem hoje</td>
                </tr>
              ) : (
                viagensHoje.map((v: Viagem, i: number) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td>{v.motorista}</td>
                    <td>{v.camiao}</td>
                    <td>{v.origem}</td>
                    <td>{v.destino}</td>
                    <td>{v.distancia} km</td>
                    <td>{v.dano}%</td>
                    <td>{v.velocidadeMax} km/h</td>
                    <td>{v.hora}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}