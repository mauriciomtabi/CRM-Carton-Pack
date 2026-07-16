import type { Metadata } from 'next'
import { TrendingUp, Package, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard — Carton Pack CRM' }

const stats = [
  { label: 'Negócios Ativos',   value: '38',          icon: Package,     color: 'var(--lime)', bg: 'rgba(180,217,50,0.1)'  },
  { label: 'Fechamentos (mês)', value: 'R$ 87.500',   icon: CheckCircle, color: 'var(--green)', bg: 'rgba(72,199,103,0.1)'   },
  { label: 'Em Negociação',     value: '12',          icon: TrendingUp,  color: 'var(--yellow)', bg: 'rgba(240,196,25,0.1)'  },
  { label: 'Perdidos (mês)',    value: 'R$ 23.000',   icon: XCircle,     color: 'var(--red)', bg: 'rgba(226,72,61,0.1)'   },
]

const pipelineSummary = [
  { stage: 'Leads / Banco',       count: 12, value: null,     color: '#555555' },
  { stage: 'Prospect',            count: 8,  value: null,     color: '#3b82f6' },
  { stage: 'Dinâmica',            count: 6,  value: null,     color: '#8b5cf6' },
  { stage: 'Potencial',           count: 5,  value: null,     color: 'var(--yellow)' },
  { stage: 'Visita',              count: 3,  value: null,     color: '#06b6d4' },
  { stage: 'Briefing/Orçamento',  count: 4,  value: 65000,    color: '#f97316' },
  { stage: 'Aprovação',           count: 2,  value: 38000,    color: '#a855f7' },
  { stage: 'Fechamento',          count: 3,  value: 87500,    color: 'var(--lime)' },
]

const alerts = [
  { deal: 'Embalagem Natura',   contact: 'Ana Lima',    days: 7,  stage: 'Potencial' },
  { deal: 'Kit Presente XP',    contact: 'Carlos M.',   days: 5,  stage: 'Briefing'  },
  { deal: 'Display Farmácia',   contact: 'Juliana P.',  days: 10, stage: 'Prospect'  },
]

export default function DashboardPage() {
  const maxCount = Math.max(...pipelineSummary.map(s => s.count))

  return (
    <div className="page-content animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[var(--white)] tracking-tight">
          Dashboard
        </h1>
        <p className="font-mono text-xs text-[var(--gray)] mt-1 uppercase tracking-wider">
          Visão geral do pipeline comercial — Carton Pack
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card" key={label} style={{ '--stat-color': color } as React.CSSProperties}>
            <div className="flex items-start justify-between">
              <div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-base mb-6 text-[var(--white)] flex items-center gap-2">
            <span>📊</span> Funil de Vendas
          </h2>
          <div className="flex flex-col gap-3">
            {pipelineSummary.map(({ stage, count, value, color }) => (
              <div key={stage} className="flex items-center gap-4">
                <div className="w-36 text-xs text-[var(--gray)] font-medium truncate">
                  {stage}
                </div>
                <div className="flex-1 h-7 bg-[var(--charcoal)] border border-[var(--line)] rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md flex items-center pl-3 transition-all duration-500 ease-out"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: `linear-gradient(90deg, ${color}cc, ${color})`,
                      boxShadow: color === 'var(--lime)' ? '0 0 12px rgba(180,217,50,0.2)' : 'none',
                      minWidth: '28px',
                    }}
                  >
                    <span className="font-mono text-xs font-bold text-black">
                      {count}
                    </span>
                  </div>
                </div>
                <div className="w-24 text-right font-mono text-xs font-bold" style={{ color: value ? 'var(--lime)' : 'var(--gray2)' }}>
                  {value ? formatCurrency(value) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts / Stale Deals */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base mb-4 text-[var(--white)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--yellow)]" />
              Negócios Parados
            </h2>
            <div className="flex flex-col gap-3">
              {alerts.map(({ deal, contact, days, stage }) => (
                <div
                  key={deal}
                  className="bg-[var(--charcoal)] border rounded-lg p-3 transition-all duration-200 hover:border-[var(--line)]"
                  style={{
                    borderColor: days >= 7 ? 'rgba(226,72,61,0.25)' : 'var(--line)',
                  }}
                >
                  <div className="text-xs font-bold text-[var(--white)] mb-1">
                    {deal}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[var(--gray)]">{contact} · {stage}</span>
                    <span
                      className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: days >= 7 ? 'var(--red)' : 'var(--yellow)',
                        background: days >= 7 ? 'rgba(226,72,61,0.1)' : 'rgba(240,196,25,0.1)',
                        border: `1px solid ${days >= 7 ? 'rgba(226,72,61,0.2)' : 'rgba(240,196,25,0.2)'}`,
                      }}
                    >
                      {days}d parado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/pipeline" className="btn btn-secondary w-full mt-6 py-2.5 flex items-center justify-center gap-2">
            <span>Ver Pipeline Completo</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
