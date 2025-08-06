'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { FaTrophy, FaRoad, FaUser } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'

type RankingUser = {
  id: string
  name: string
  totalKm: number
  kmYear: number
  kmMonth: number
  avatar?: string
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

 const renderPosition = (i: number) => i + 1

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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy size={28} /> Ranking de Motoristas
        </h1>

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

        {/* Taças do Ranking Anual */}
        {tab === 'yearly' && data.length >= 3 && (
          <div className="flex justify-center gap-10 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center">
                <Image
                  src={
                    i === 0
                      ? '/taca-ouro.png'
                      : i === 1
                      ? '/taca-prata.png'
                      : '/taca-bronze.png'
                  }
                  alt={`Taça ${i + 1}`}
                  width={64}
                  height={64}
                  className="mx-auto drop-shadow-md"
                />
                <p className="mt-2 text-lg font-semibold text-white">{data[i]?.name ?? '---'}</p>
                <p className="text-sm text-gray-400">{getKm(data[i]).toLocaleString()} km</p>
              </div>
            ))}
          </div>
        )}

        {/* Medalhas do Ranking Mensal */}
{tab === 'monthly' && data.length >= 3 && (
  <div className="flex justify-center gap-10 mb-6">
    {[0, 1, 2].map((i) => (
      <div key={i} className="text-center">
        <Image
          src={
            i === 0
              ? '/medal-ouro.png'
              : i === 1
              ? '/medal-prata.png'
              : '/medal-bronze.png'
          }
          alt={`Medalha ${i + 1}`}
          width={64}
          height={64}
          className="mx-auto drop-shadow-md"
        />
        <p className="mt-2 text-lg font-semibold text-white">{data[i]?.name ?? '---'}</p>
        <p className="text-sm text-gray-400">{getKm(data[i]).toLocaleString()} km</p>
      </div>
    ))}
  </div>
)}
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
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src={u.avatar && u.avatar.trim() !== '' ? u.avatar : '/logo.jpg'}
                            alt={u.name}
                            width={48}
                            height={48}
                            className="rounded border border-gray-600 object-cover"
                          />
                          <Link
                            href={`/perfil/${u.id}`}
                            className="text-white hover:text-blue-400 font-medium"
                          >
                            {u.name}
                          </Link>
                        </div>
                      </td>
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