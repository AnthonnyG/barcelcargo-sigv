import { Suspense } from 'react'
import PerfilContent from './perfil-content'

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Carregando perfil...</div>}>
      <PerfilContent />
    </Suspense>
  )
}