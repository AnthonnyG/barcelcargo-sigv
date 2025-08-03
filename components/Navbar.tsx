'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  Trophy,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setRole(parsed.role)
    }
  }, [])

  const toggleMenu = () => setOpen(!open)

  const handleNav = async (path: string) => {
    if (path === '/logout') {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
      return
    }

    router.push(path)
    setOpen(false)
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ...(role === 'ADMIN' || role === 'MANAGER'
      ? [{ label: 'Admin', icon: ShieldCheck, path: '/admin' }]
      : []),
    { label: 'Ranking', icon: Trophy, path: '/ranking' },
    { label: 'Perfil', icon: User, path: '/perfil' },
    { label: 'Definições', icon: Settings, path: '/settings' },
    { label: 'Logout', icon: LogOut, path: '/logout', className: 'text-red-400' },
  ]

  if (role === null) {
    return (
      <nav className="bg-[#0f172a] text-white px-6 py-4">
        <span className="text-sm">A carregar...</span>
      </nav>
    )
  }

  const getButtonClass = (path: string, custom = '') => {
    const isActive = pathname.startsWith(path)
    return `flex items-center gap-2 text-sm transition ${
      isActive
        ? 'bg-green-600 text-white px-3 py-1 rounded font-medium'
        : 'text-gray-300 hover:text-green-400'
    } ${custom}`
  }

  return (
    <nav className="bg-[#0f172a] text-white shadow-md px-6 py-4 relative z-50">
      <div className="flex justify-between items-center">
        {/* ESQUERDA: Logo + SIGV + Beta tag */}
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="h-6 w-auto" />
          <span className="text-sm font-semibold tracking-wide">SIGV</span>
          <span className="text-[10px] font-semibold bg-blue-500 text-white px-2 py-[2px] rounded">
            beta v1
          </span>
        </div>

        {/* DIREITA: Menu Desktop ou botão Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {navItems.map(({ label, icon: Icon, path, className = '' }) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className={getButtonClass(path, className)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="mt-4 flex flex-col md:hidden gap-3">
          {navItems.map(({ label, icon: Icon, path, className = '' }) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className={getButtonClass(path, className)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}