'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'

interface KmData {
  mes: string
  km: number
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default function KmChart() {
  const [data, setData] = useState<KmData[]>([])

  useEffect(() => {
    const fetchKms = async () => {
      const res = await fetch('/api/stats/kms')
      const backendData: KmData[] = await res.json()

      const mapped = MESES.map((mes) => {
        const found = backendData.find(item => item.mes.toLowerCase() === mes)
        return { mes, km: found ? found.km : 0 }
      })

      setData(mapped)
    }

    fetchKms()
  }, [])

  const maxKm = Math.max(...data.map(d => d.km))
  const maxEntry = data.find(d => d.km === maxKm)

  const anoAtual = new Date().getFullYear()

  return (
    <div className="space-y-3">
      <h3 className="text-center text-white mb-2 text-sm">
        Evolução de Km por Mês - {anoAtual}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="mes" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => [`${value} km`, 'Distância']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="km"
            stroke="#22c55e"
            strokeWidth={2}
            dot={({ cx, cy, payload }) =>
              payload.km === maxKm ? (
                <circle cx={cx} cy={cy} r={6} fill="#22c55e" stroke="white" strokeWidth={2} />
              ) : (
                <circle cx={cx} cy={cy} r={4} fill="#22c55e" />
              )
            }
          />
        </LineChart>
      </ResponsiveContainer>

      {maxEntry && maxEntry.km > 0 && (
        <p className="text-center text-sm text-lime-400 mt-2">
          📌 Mês com mais quilómetros: <span className="font-semibold">{maxEntry.mes}</span> ({maxEntry.km.toLocaleString()} km)
        </p>
      )}
    </div>
  )
}