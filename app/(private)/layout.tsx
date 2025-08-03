// app/(private)/layout.tsx
import Navbar from '@/components/Navbar'
import { ReactNode } from 'react'

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}