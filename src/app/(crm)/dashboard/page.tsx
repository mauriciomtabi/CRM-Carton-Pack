import type { Metadata } from 'next'
import { TrendingUp, Users, DollarSign, AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard — Carton Pack CRM' }

// Mock stats — serão substituídos por dados reais do Supabase
const stats = [
  { label: 'Negócios Ativos',   value: '38',          icon: Package,     color: '#9DC814', bg: 'rgba(157,200,20,0.1)'  },
  { label: 'Fechamentos (mês)', value: 'R$ 87.500',   icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  { label: 'Em Negociação',     value: '12',          icon: TrendingUp,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  { label: 'Perdidos (mês)',    value: 'R$ 23.000',   icon: XCircle,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
]

const pipelineSummary = [
  { stage: 'Leads / Banco',       count: 12, value: null,     color: '#64748b' },
  { stage: 'Prospect',            count: 8,  value: null,     color: '#3b82f6' },
  { stage: 'Dinâmica',            count: 6,  value: null,     color: '#8b5cf6' },
  { stage: 'Potencial',           count: 5,  value: null,     color: '#f59e0b' },
  { stage: 'Visita',              count: 3,  value: null,     color: '#06b6d4' },
  { stage: 'Briefing/Orçamento',  count: 4,  value: 65000,    color: '#f97316' },
  { stage: 'Aprovação',           count: 2,  value: 38000,    color: '#a855f7' },
  { stage: 'Fechamento',          count: 3,  value: 87500,    color: '#22c55e' },
]

const alerts = [
  { deal: 'Embalagem Natura',   contact: 'Ana Lima',    days: 7,  stage: 'Potencial' },
  { deal: 'Kit Presente XP',    contact: 'Carlos M.',   days: 5,  stage: 'Briefing'  },
  { deal: 'Display Farmácia',   contact: 'Juliana P.',  days: 10, stage: 'Prospect'  },
]

export default function DashboardPage() {
  const maxCount = Math.max(...pipelineSummary.map(s => s.count))

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
          Visão geral do pipeline comercial — Carton Pack
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card animate-fade-in" key={label}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
              <div style={{ background: bg, borderRadius: '10px', padding: '10px' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Pipeline Funnel */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
            📊 Funil de Vendas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pipelineSummary.map(({ stage, count, value, color }) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '140px', fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {stage}
                </div>
                <div style={{
                  flex: 1,
                  height: '28px',
                  background: 'var(--bg-hover)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    width: `${(count / maxCount) * 100}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '6px',
                    opacity: 0.85,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                    transition: 'width 0.6s ease',
                    minWidth: '36px',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{count}</span>
                  </div>
                </div>
                <div style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: value ? '#22c55e' : 'var(--text-muted)', fontWeight: 600 }}>
                  {value ? formatCurrency(value) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#f59e0b" />
            Negócios Parados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(({ deal, contact, days, stage }) => (
              <div key={deal} style={{
                background: 'var(--bg-hover)',
                borderRadius: '8px',
                padding: '12px',
                border: days >= 7 ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--bg-border)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {deal}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{contact} · {stage}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: days >= 7 ? '#fca5a5' : '#fcd34d',
                    background: days >= 7 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}>
                    {days}d parado
                  </span>
                </div>
              </div>
            ))}
          </div>
          <a href="/pipeline" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            Ver Pipeline Completo
          </a>
        </div>
      </div>
    </div>
  )
}
