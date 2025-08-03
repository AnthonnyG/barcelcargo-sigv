'use client'

import { useEffect, useState } from 'react'
import { MapPin, Route, User2, Gauge, Clock4 } from 'lucide-react'

interface Trip {
  id: string
  motorista: string
  data: string
  origem: string
  destino: string
  km: number
}

interface TripView extends Omit<Trip, 'motorista'> {
  condutor: string
}

export default function TripList() {
  const [trips, setTrips] = useState<TripView[]>([])

  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch('/api/trips/latest')
      const data: Trip[] = await res.json()
      const formatted: TripView[] = data.map((t) => ({
        ...t,
        condutor: t.motorista,
      }))
      setTrips(formatted)
    }

    fetchTrips()
  }, [])

  return (
    <div className="overflow-x-auto">
      <h3 className="text-white text-md font-semibold flex items-center gap-2 mb-2">
        <Clock4 size={16} /> Últimas 20 Viagens
      </h3>
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-2 px-4"><div className="flex items-center gap-2"><User2 size={14} /> Condutor</div></th>
            <th className="py-2 px-4">Data</th>
            <th className="py-2 px-4"><div className="flex items-center gap-2"><MapPin size={14} /> Origem</div></th>
            <th className="py-2 px-4"><div className="flex items-center gap-2"><Route size={14} /> Destino</div></th>
            <th className="py-2 px-4"><div className="flex items-center gap-2"><Gauge size={14} /> Km</div></th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b border-gray-800 hover:bg-[#334155] transition">
              <td className="py-2 px-4">{trip.condutor}</td>
              <td className="py-2 px-4">{new Date(trip.data).toLocaleDateString()}</td>
              <td className="py-2 px-4">{trip.origem}</td>
              <td className="py-2 px-4">{trip.destino}</td>
              <td className="py-2 px-4">{trip.km} km</td>
            </tr>
          ))}
          {trips.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">
                Nenhuma viagem recente encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}