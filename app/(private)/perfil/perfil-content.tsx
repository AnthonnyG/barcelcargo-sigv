'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Trophy, Medal, BarChart2, TrendingUp,
  Instagram, Youtube, Facebook, Twitch, Twitter, Star
} from 'lucide-react'
import Image from 'next/image'

const TikTokIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.3 1C17.2 2.8 18.8 4.1 21 4.4V8.1C18.9 8 17.2 7.3 15.7 6.2V14.9C15.7 20.1 11.3 23 7.6 21.3C5.2 20.2 4.1 17.4 5.1 14.9C6 12.7 8.5 11.7 10.7 12.4V16.2C10.7 17.1 9.9 17.9 8.9 17.9C7.9 17.9 7.1 17.1 7.1 16.2C7.1 14.9 8.2 14.5 9.2 14.9V11C6.1 10.6 3.2 12.9 3 16.2C2.8 19.8 5.5 23 9.1 23C13.3 23 16.3 20 16.3 14.7V1H16.3Z" />
  </svg>
)

type Estatisticas = { cargas: number; km: number }
type Viagem = {
  id: string; camiao: string; origem: string; destino: string;
  distancia: number; dano: number; velocidadeMax: number; data: string
}
type Titulo = { id: string; titulo: string; imagem?: string }
type SocialLinks = {
  youtube?: string; twitch?: string; instagram?: string;
  facebook?: string; twitter?: string; tiktok?: string
}
type PerfilData = {
  name: string; avatar: string; socials: SocialLinks;
  estatisticas: { ets2: Estatisticas; ats: Estatisticas; total: Estatisticas };
  hoje: Estatisticas; ranking: { posicao: number };
  medalhas: Titulo[]; trofeus: Titulo[]; tacas: Titulo[]; ultimas: Viagem[]
}

export default function PerfilContent() {
  const [data, setData] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'ETS2' | 'ATS' | 'GERAL'>('GERAL')
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = searchParams.get('id')

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const url = id ? `/api/motorista/${id}` : '/api/perfil'
        const options: RequestInit = {}

        if (!id && token) {
          options.headers = {
            Authorization: `Bearer ${token}`
          }
        }

        const res = await fetch(url, options)
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status}`)

        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  if (loading) return <div className="text-white text-center p-10">Carregando perfil...</div>
  if (!data) return <div className="text-red-500 text-center p-10">Erro ao carregar perfil</div>

  const estat = {
    ETS2: data.estatisticas.ets2,
    ATS: data.estatisticas.ats,
    GERAL: data.estatisticas.total
  }[tab]

  const redes = [
    { icon: <Youtube size={18} />, url: data.socials.youtube },
    { icon: <Twitch size={18} />, url: data.socials.twitch },
    { icon: <Instagram size={18} />, url: data.socials.instagram },
    { icon: <Facebook size={18} />, url: data.socials.facebook },
    { icon: <Twitter size={18} />, url: data.socials.twitter },
    { icon: <TikTokIcon />, url: data.socials.tiktok }
  ].filter(r => r.url)

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 space-y-10">
      <div className="flex items-center gap-6 flex-wrap">
        <Image
          src={data.avatar?.trim() ? data.avatar : '/default.png'}
          width={100}
          height={100}
          className="rounded-xl shadow border"
          alt="Avatar"
          priority
        />
        <div>
          <h1 className="text-3xl font-bold text-white">Perfil de {data.name}</h1>
          <div className="flex gap-3 mt-2">
            {redes.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                {r.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="mb-4 flex gap-2">
            {['GERAL', 'ETS2', 'ATS'].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value as 'GERAL' | 'ETS2' | 'ATS')}
                className={`px-4 py-1 rounded text-sm font-semibold ${tab === value ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-300'}`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-400">Cargas: {estat.cargas}</div>
          <div className="text-xl font-bold text-white">{estat.km.toLocaleString()} km</div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-1">
            <BarChart2 size={18} />
            <span className="font-semibold text-white">Hoje</span>
          </div>
          <div className="text-sm text-gray-400">{data.hoje.cargas} cargas</div>
          <div className="text-xl font-bold text-white">{data.hoje.km.toLocaleString()} km</div>
        </div>

        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-1">
            <TrendingUp size={18} />
            <span className="font-semibold text-white">Ranking Geral</span>
          </div>
          <div className="text-2xl text-white font-bold mt-1">#{data.ranking.posicao}</div>
        </div>
      </div>

      {/* Medalhas, Troféus, Taças */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-2"><Medal /> Medalhas</div>
          {data.medalhas.length ? (
            <ul className="list-disc ml-5 text-sm text-white">
              {data.medalhas.map((m) => <li key={m.id}>{m.titulo}</li>)}
            </ul>
          ) : <p className="text-gray-500 text-sm">Sem medalhas</p>}
        </div>

        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-2"><Star /> Troféus Especiais</div>
          {data.trofeus.length ? (
            <ul className="list-disc ml-5 text-sm text-white">
              {data.trofeus.map((t) => <li key={t.id}>{t.titulo}</li>)}
            </ul>
          ) : <p className="text-gray-500 text-sm">Sem troféus</p>}
        </div>

        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-4"><Trophy /> Taças</div>
          {data.tacas.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {data.tacas.map((t) => (
                <div key={t.id} className="text-center">
                  <div className="w-20 h-20 mx-auto">
                    <Image
                      src={t.imagem || '/default-taca.png'}
                      alt={t.titulo}
                      width={80}
                      height={80}
                      className="object-contain drop-shadow-md mx-auto"
                    />
                  </div>
                  <p className="text-sm text-white mt-2 font-semibold">{t.titulo}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">Sem taças</p>}
        </div>
      </div>

      {/* Viagens */}
      <div>
        <h2 className="text-white text-xl font-bold mb-3">Últimas 10 Viagens</h2>
        <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-700">
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="bg-slate-800">
                <th className="p-2 text-left">Camião</th>
                <th className="p-2 text-left">Origem</th>
                <th className="p-2 text-left">Destino</th>
                <th className="p-2 text-left">Distância</th>
                <th className="p-2 text-left">Dano</th>
                <th className="p-2 text-left">Velocidade</th>
                <th className="p-2 text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimas.map((v) => (
                <tr key={v.id} className="border-b border-slate-700">
                  <td className="p-2">{v.camiao}</td>
                  <td className="p-2">{v.origem}</td>
                  <td className="p-2">{v.destino}</td>
                  <td className="p-2">{v.distancia.toLocaleString()} km</td>
                  <td className="p-2">{v.dano}%</td>
                  <td className="p-2">{v.velocidadeMax} kph</td>
                  <td className="p-2">{new Date(v.data).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}