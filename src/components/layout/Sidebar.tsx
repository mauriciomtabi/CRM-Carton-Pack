'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  UserCog,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/pipeline',   label: 'Pipeline',     icon: KanbanSquare },
  { href: '/contacts',   label: 'Contatos',     icon: Users },
  { href: '/users',      label: 'Usuários',     icon: UserCog },
  { href: '/briefings',  label: 'Orçamentos',   icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const activeTheme = (document.documentElement.getAttribute('data-theme') || 'dark') as 'dark' | 'light'
    setTheme(activeTheme)
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  async function handleLogout() {
    router.push('/login')
  }

  return (
    <aside className="sidebar hidden lg:flex">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#060606" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="#060606" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22.08V12" stroke="#060606" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">
            <span className="carton">CARTON</span>
            <span className="pack"> PACK</span>
          </div>
          <div className="sidebar-logo-sub">
            CRM Comercial
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="sidebar-section">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${active ? ' active' : ''}`}
              >
                <div className="nav-item-icon">
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          onClick={toggleTheme}
          className="nav-item text-left border-none bg-none cursor-pointer w-full mb-1"
        >
          <div className="nav-item-icon">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <span>Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="nav-item text-left border-none bg-none cursor-pointer w-full"
        >
          <div className="nav-item-icon">
            <LogOut size={18} />
          </div>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
