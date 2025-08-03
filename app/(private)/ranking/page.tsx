'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { FaTrophy, FaRoad, FaUser } from 'react-icons/fa'
import Image from 'next/image'

type RankingUser = {
  id: string
  name: string
  totalKm: number
  kmYear: number
  kmMonth: number
}

export default function RankingPage() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [tab, setTab] = useState<'monthly' | 'yearly' | 'general'>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [game, setGame] = useState<'ETS2' | 'ATS' | 'TOTAL'>('ETS2')

  const [data, setData] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({ type: tab })
      if (tab === 'monthly') {
        params.append('year', selectedYear.toString())
        params.append('month', selectedMonth.toString())
      } else if (tab === 'yearly') {
        params.append('year', selectedYear.toString())
      }
      if (tab !== 'general') {
        params.append('game', game)
      }

      const res = await fetch(`/api/ranking?${params.toString()}`)
      if (!res.ok) throw new Error('Erro na resposta do servidor')

      const json = await res.json()
      setData(json)
    } catch {
      setError('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'general') setGame('TOTAL')
    fetchData()
  }, [tab, selectedMonth, selectedYear, game])

  const getKm = (u: RankingUser) =>
    tab === 'general' ? u.totalKm : tab === 'yearly' ? u.kmYear : u.kmMonth

  const renderPosition = (i: number) => {
    if (tab === 'monthly') {
      if (i === 0)
        return <Image src="/medal_ouro.png" alt="1º lugar" width={20} height={20} />
      if (i === 1)
        return <Image src="/medal_prata.png" alt="2º lugar" width={20} height={20} />
      if (i === 2)
        return <Image src="/medal_bronze.png" alt="3º lugar" width={20} height={20} />
    }
    return i + 1
  }

  const TABS: Record<'monthly' | 'yearly' | 'general', string> = {
    monthly: 'Mensal',
    yearly: 'Anual',
    general: 'Geral',
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const startYear = 2019
  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#10172A] to-[#0e1a2b] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Título */}
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy size={28} /> Ranking de Motoristas
        </h1>

        {/* Tabs */}
        <div className="flex gap-3">
          {(['monthly', 'yearly', 'general'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 font-semibold rounded-full ${
                tab === key ? 'bg-white text-black' : 'bg-gray-700 text-white'
              }`}
            >
              {TABS[key]}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center flex-wrap">
          {(tab === 'monthly' || tab === 'yearly') && (
            <>
              {tab === 'monthly' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                  {monthNames.map((name, index) => (
                    <option key={index} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-800 text-white px-4 py-2 rounded"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Seletor de jogo apenas se NÃO for geral */}
          {tab !== 'general' && (
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as 'ETS2' | 'ATS')}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              <option value="ETS2">ETS2</option>
              <option value="ATS">ATS</option>
            </select>
          )}
        </div>

        {/* Tabela de Ranking */}
        <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <FaTrophy className="text-yellow-500" /> Ranking {TABS[tab]}
          </h2>

          {loading ? (
            <p className="text-gray-300">A carregar...</p>
          ) : error ? (
            <p className="text-red-500">⚠️ {error}</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-300 border-b border-gray-600">
                <tr>
                  <th><FaTrophy className="inline mr-1" /> Lugar</th>
                  <th><FaUser className="inline mr-1" /> Motorista</th>
                  <th className="text-right"><FaRoad className="inline mr-1" /> Quilómetros</th>
                </tr>
              </thead>
              <tbody className="text-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      Nenhum motorista com km neste período.
                    </td>
                  </tr>
                ) : (
                  data.map((u, i) => (
                    <tr key={u.id} className="border-b border-gray-700">
                      <td className="py-2">{renderPosition(i)}</td>
                      <td className="py-2">{u.name}</td>
                      <td className="py-2 text-right">{getKm(u).toLocaleString()} km</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}