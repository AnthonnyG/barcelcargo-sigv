'use client'

import { useEffect, useState } from 'react'
import {
  Trophy, Medal, CupSoda, Truck, BarChart2, TrendingUp,
  Instagram, Youtube, Facebook, Twitch, Twitter, Star
} from 'lucide-react'
import Image from 'next/image'
import { url } from 'inspector'

export default function Perfil() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'ETS2' | 'ATS' | 'GERAL'>('ETS2')

  // DECLARAÇÃO DAS TAÇAS MANUAIS
  const tacasManuais = [
    {
      id: '1',
      nome: 'Taça de Ouro ATS',
      ano: 2021,
      imagem: '/taca-ouro.png',
    },
    {
      id: '2',
      nome: 'Taça De Prata',
      ano: 2024,
      imagem: '/taca-prata.png',
    },
    // Podes adicionar mais taças aqui
  ]

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('/api/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Erro ao buscar dados')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
    { icon: <Twitter size={18} />, url: data.socials.twitter }
  ].filter(r => r.url)

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 space-y-10">

      {/* HEADER */}
      <div className="flex items-center gap-6 flex-wrap">
        <Image
          src={data.avatar || '/default.png'}
          width={100}
          height={100}
          className="rounded-xl shadow border"
          alt="Avatar"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">Perfil de {data.name}</h1>
          <div className="flex gap-3 mt-2">
            {redes.map((r, i) => (
              <a key={i} href={r.url} target="_blank" aria-label={`Link para ${r.url}`} className="text-white hover:text-blue-400">
                {r.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="mb-4 flex gap-2">
            {['ETS2', 'ATS', 'GERAL'].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value as any)}
                className={`px-4 py-1 rounded text-sm font-semibold ${
                  tab === value ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-300'
                }`}
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

      {/* PRÉMIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-2"><Medal /> Medalhas</div>
          {data.medalhas.length ? (
            <ul className="list-disc ml-5 text-sm text-white">
              {data.medalhas.map((m: any) => <li key={m.id}>{m.titulo}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Sem medalhas</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-2"><Star /> Troféus Especiais</div>
          {data.trofeus.length ? (
            <ul className="list-disc ml-5 text-sm text-white">
              {data.trofeus.map((t: any) => <li key={t.id}>{t.titulo}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Sem troféus</p>
          )}
        </div>

        {/* Taças manuais */}
        <div className="bg-slate-800 rounded-xl shadow p-4">
          <div className="flex gap-2 items-center mb-4"><Trophy /> Taças</div>
          {tacasManuais.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tacasManuais.map((t) => (
                <div key={t.id} className="text-center">
                  <div className="w-20 h-20 mx-auto">
                    <img
                      src={t.imagem}
                      alt={t.nome}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <p className="text-sm text-white mt-2 font-semibold">{t.nome}</p>
                  <p className="text-xs text-gray-400">{t.ano}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sem taças</p>
          )}
        </div>
      </div>

      {/* VIAGENS */}
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
              {data.ultimas.map((v: any) => (
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