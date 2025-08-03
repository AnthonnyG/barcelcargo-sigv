'use client'

import { useState } from 'react'

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setMessage('')
    }
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
    } catch (error) {
      console.error('Erro ao importar CSV:', error)
      setMessage('❌ Erro ao importar CSV.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl text-white max-w-md mx-auto mt-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Importar Histórico do TrucksBook</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block mb-4 w-full text-sm text-gray-300 file:bg-gray-800 file:text-white file:rounded file:px-4 file:py-2 file:border-0 file:mr-4"
      />

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
        <p
          className={`mt-4 text-sm text-center ${
            message.startsWith('✅') ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}