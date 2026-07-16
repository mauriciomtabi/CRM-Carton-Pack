'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Package,
  Bell,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/pipeline',   label: 'Pipeline',     icon: KanbanSquare },
  { href: '/contacts',   label: 'Contatos',     icon: Users },
  { href: '/briefings',  label: 'Orçamentos',   icon: FileText },
  { href: '/reports',    label: 'Relatórios',   icon: BarChart3 },
  { href: '/settings',   label: 'Configurações',icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    router.push('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid var(--bg-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'var(--brand-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 14px rgba(157,200,20,0.35)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12h6v10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>CARTON</span>
            <span style={{ color: 'var(--brand-500)' }}> PACK</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            CRM Comercial
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item${active ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {href === '/pipeline' && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--brand-600)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '999px',
                }}>
                  LIVE
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--bg-border)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item btn-ghost"
          style={{ width: 'calc(100% - 16px)', textAlign: 'left', background: 'none', cursor: 'pointer', border: 'none' }}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
