'use client'

import { useState } from 'react'
import Papa from 'papaparse'

type PreviewRow = {
  Name: string
  Game: string
  From: string
  To: string
  'Accepted distance': string
  Damage: string
  Truck: string
  'Maximal reached speed': string
  Date: string
}

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.name.endsWith('.csv')) {
      setMessage('❌ O ficheiro deve ser .csv')
      return
    }

    setFile(selected)
    setMessage('')

    Papa.parse<PreviewRow>(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setPreview(result.data.slice(0, 5)) // Mostra 5 primeiras linhas
      },
      error: () => setMessage('❌ Erro ao pré-visualizar o CSV.'),
    })
  }

  const uploadCSV = async () => {
    if (!file) {
      setMessage('⚠️ Selecione um ficheiro CSV.')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(`❌ Erro: ${data.error || 'Falha na importação.'}`)
        return
      }

      setMessage(`✅ ${data.message}`)
      setFile(null)
      setPreview([])
    } catch (error) {
      console.error('Erro ao importar CSV:', error)
      setMessage('❌ Erro ao importar CSV.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl text-white max-w-xl mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Importar Histórico do TrucksBook</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block mb-4 w-full text-sm text-gray-300 file:bg-gray-800 file:text-white file:rounded file:px-4 file:py-2 file:border-0 file:mr-4"
      />

      {preview.length > 0 && (
        <div className="text-xs bg-gray-800 p-3 mb-4 rounded">
          <p className="font-semibold mb-2">📄 Pré-visualização (primeiras 5 linhas):</p>
          <table className="w-full table-auto border-collapse text-[11px]">
            <thead>
              <tr>
                {Object.keys(preview[0]).map((key) => (
                  <th key={key} className="border border-gray-600 px-2 py-1">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border border-gray-700 px-2 py-1">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={uploadCSV}
        disabled={!file || loading}
        className={`w-full px-4 py-2 rounded font-semibold transition ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'A importar...' : 'Importar CSV'}
      </button>

      {message && (
        <div
          className={`mt-4 p-2 text-center rounded ${
            message.startsWith('✅') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}