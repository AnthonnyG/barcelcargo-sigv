'use client'

import { FaRoad, FaChartLine, FaTrophy } from 'react-icons/fa'
import { Globe, Truck, MapPin, LayoutDashboard, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="BarcelCargo Logo" className="h-16" />
          <h1 className="text-2xl font-bold">BARCELCARGO</h1>
        </div>
        <nav className="space-x-6 text-sm">
          <a href="#como" className="hover:underline">COMO FUNCIONA</a>
          <a href="#vantagens" className="hover:underline">VANTAGENS</a>
          <a href="/register" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">JUNTA-TE À NOSSA VTC</a>
        </nav>
      </header>

      <section className="text-center py-40 px-4 bg-cover bg-center" style={{ backgroundImage: 'url(/background.jpg)' }}>
        <h2 className="text-5xl font-bold mb-4">BarcelCargo</h2>
        <p className="mb-6 text-lg">A transportadora virtual que une excelência, realismo e gestão no mundo do ETS2.</p>
        <button
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:4000/api/auth/me', {
                credentials: 'include'
              })
              const data = await res.json()
              if (res.ok && data.user) {
                window.location.href = '/dashboard'
              } else {
                window.location.href = '/login'
              }
            } catch {
              window.location.href = '/login'
            }
          }}
          className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-300"
        >
          Entrar no SIGV
        </button>
      </section>

      <section id="como" className="bg-[#1a1a1a] py-16 px-4 text-center">
        <h3 className="text-3xl font-bold mb-4">Como funciona</h3>
        <p className="mb-6">Regista as tuas viagens no nosso Sistema Integrado de Gestão de Viagens (SIGV) e acompanha o teu progresso com facilidade.</p>
        <div className="bg-green-800 text-white p-6 max-w-md mx-auto rounded shadow">
          <h4 className="text-xl font-semibold mb-2">Regista as tuas viagens</h4>
          <p>
            Cada viagem que realizas no ETS2 é transformada em dados validados automaticamente pelo nosso sistema SIGV.
            Garante integridade, registos fiáveis e transparência total na tua jornada como motorista.
          </p>
        </div>
      </section>

      <section id="vantagens" className="bg-[#0f0f0f] py-16 px-4 text-center">
        <h3 className="text-3xl font-bold mb-8 text-white">Porque escolher a BarcelCargo?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-yellow-600 p-6 rounded shadow text-white">
            <FaRoad className="text-4xl mb-4 mx-auto" />
            <h4 className="text-xl font-semibold mb-2">Gestão de Viagens Inteligente</h4>
            <p>O nosso sistema foi concebido para otimizar o registo de viagens com precisão e autenticidade.</p>
          </div>
          <div className="bg-red-600 p-6 rounded shadow text-white">
            <FaChartLine className="text-4xl mb-4 mx-auto" />
            <h4 className="text-xl font-semibold mb-2">Estatísticas em Tempo Real</h4>
            <p>Acompanha cada quilómetro com análises detalhadas do teu desempenho.</p>
          </div>
          <div className="bg-green-600 p-6 rounded shadow text-white">
            <FaTrophy className="text-4xl mb-4 mx-auto" />
            <h4 className="text-xl font-semibold mb-2">Rankings e Reconhecimento</h4>
            <p>Participa em eventos, sobe no ranking nacional e internacional, e conquista troféus.</p>
          </div>
        </div>
      </section>

      <hr className="border-gray-700 mt-12" />

      <footer className="bg-[#0f0f0f] text-sm py-12 px-4 md:px-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div>
            <h5 className="font-semibold mb-2">BarcelCargo</h5>
            <p className="text-gray-400">A excelência em simulação de transportes.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Mapa do Site</h5>
            <ul className="text-gray-300 space-y-1">
              <li><a href="#como">Como Funciona</a></li>
              <li><a href="#vantagens">Vantagens</a></li>
              <li><a href="/login">Entrar no SIGV</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Ecossistema</h5>
            <ul className="text-gray-300 space-y-1">
              <li><a href="https://store.steampowered.com"><Globe className="inline w-4 h-4 mr-2" />Steam</a></li>
              <li><a href="https://scssoft.com"><Truck className="inline w-4 h-4 mr-2" />SCS Software</a></li>
              <li><a href="https://www.worldoftrucks.com"><Globe className="inline w-4 h-4 mr-2" />World of Trucks</a></li>
              <li><a href="https://truckyapp.com"><MapPin className="inline w-4 h-4 mr-2" />Trucky App</a></li>
              <li><a href="https://vtlog.net"><LayoutDashboard className="inline w-4 h-4 mr-2" />VTLog</a></li>
              <li><a href="https://trucksbook.eu"><BarChart3 className="inline w-4 h-4 mr-2" />TrucksBook</a></li>
            </ul>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-8">© 2019 BarcelCargo | Todos os direitos reservados</p>
      </footer>
    </div>
  )
}