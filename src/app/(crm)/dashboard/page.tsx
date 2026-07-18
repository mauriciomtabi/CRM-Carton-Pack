'use client'

import { useState } from 'react'
import { TrendingUp, Package, CheckCircle, XCircle, AlertTriangle, ArrowRight, User, Filter, Calendar, Phone } from 'lucide-react'
import { formatCurrency, whatsappLink } from '@/lib/utils'
import Link from 'next/link'

interface DealMock {
  id: string
  title: string
  representative: string
  stage: 'leads' | 'prospect' | 'dinamica' | 'potencial' | 'visita' | 'briefing' | 'aprovacao' | 'fechamento' | 'perdido'
  value: number
  curve: 'A' | 'B' | 'C' | 'D'
  daysInactive: number
  contactName: string
  phone: string
}

const MOCK_DEALS: DealMock[] = [
  // Leads
  { id: '1', title: 'Caixa Premium Natura', representative: 'Ana Lima', stage: 'leads', value: 15000, curve: 'A', daysInactive: 15, contactName: 'Ana Lima', phone: '11988888888' },
  { id: '2', title: 'Display Gota Limpa', representative: 'Ermínio', stage: 'leads', value: 25000, curve: 'A', daysInactive: 95, contactName: 'Alvaro Ferreira', phone: '51999999999' },
  { id: '3', title: 'Embalagem XP Presentes', representative: 'Carlos Mendes', stage: 'prospect', value: 12000, curve: 'B', daysInactive: 30, contactName: 'Carlos Mendes', phone: '21977777777' },
  // Briefings / Orçamentos
  { id: '4', title: 'Caixa Vinho Gourmet', representative: 'Marina Costa', stage: 'briefing', value: 32000, curve: 'C', daysInactive: 10, contactName: 'Marina Costa', phone: '54922222222' },
  { id: '5', title: 'Embalagem Cosméticos M.', representative: 'Fernanda R.', stage: 'briefing', value: 18000, curve: 'C', daysInactive: 120, contactName: 'Fernanda Ramos', phone: '31966666666' },
  // Fechamentos
  { id: '6', title: 'Kit Natal Lojas Renner', representative: 'Renner Compras', stage: 'fechamento', value: 87500, curve: 'A', daysInactive: 5, contactName: 'Renner Compras', phone: '51944444444' },
  { id: '7', title: 'Caixa Presente Boticário', representative: 'Gustavo N.', stage: 'aprovacao', value: 48000, curve: 'A', daysInactive: 45, contactName: 'Gustavo Nogueira', phone: '41955555555' },
  // Perdidos
  { id: '8', title: 'Bandeja Padaria Central', representative: 'Ermínio', stage: 'perdido', value: 23000, curve: 'D', daysInactive: 110, contactName: 'Paulo Lima', phone: '51933333333' },
]

export default function DashboardPage() {
  const [selectedRep, setSelectedRep] = useState<string>('all')
  const [selectedCurve, setSelectedCurve] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30')

  // Filter deals based on state
  const filteredDeals = MOCK_DEALS.filter(deal => {
    const matchesRep = selectedRep === 'all' || deal.representative === selectedRep
    const matchesCurve = selectedCurve === 'all' || deal.curve === selectedCurve
    return matchesRep && matchesCurve
  })

  // Compute stats
  const activeDealsCount = filteredDeals.filter(d => d.stage !== 'fechamento' && d.stage !== 'perdido').length
  const inNegotiationCount = filteredDeals.filter(d => d.stage === 'potencial' || d.stage === 'briefing').length
  
  const fechamentoValue = filteredDeals
    .filter(d => d.stage === 'fechamento')
    .reduce((acc, d) => acc + d.value, 0)
    
  const perdidoValue = filteredDeals
    .filter(d => d.stage === 'perdido')
    .reduce((acc, d) => acc + d.value, 0)

  // Funnel counts per stage
  const stagesList = [
    { key: 'leads', label: 'Leads / Banco', color: '#555555' },
    { key: 'prospect', label: 'Prospect', color: '#3b82f6' },
    { key: 'dinamica', label: 'Dinâmica', color: '#8b5cf6' },
    { key: 'potencial', label: 'Potencial', color: 'var(--yellow)' },
    { key: 'visita', label: 'Visita', color: '#06b6d4' },
    { key: 'briefing', label: 'Briefing/Orçamento', color: '#f97316' },
    { key: 'aprovacao', label: 'Aprovação', color: '#a855f7' },
    { key: 'fechamento', label: 'Fechamento', color: 'var(--lime)' },
  ] as const

  const funnelSummary = stagesList.map(s => {
    const stageDeals = filteredDeals.filter(d => d.stage === s.key)
    const count = stageDeals.length
    const totalVal = stageDeals.reduce((acc, d) => acc + d.value, 0)
    return {
      stage: s.label,
      count,
      value: totalVal > 0 ? totalVal : null,
      color: s.color,
    }
  })

  const maxCount = Math.max(...funnelSummary.map(s => s.count), 1)

  // Inactive / Stale deals alerts (stale if inactive > 30 days)
  const staleDeals = filteredDeals
    .filter(d => d.daysInactive >= 30 && d.stage !== 'fechamento' && d.stage !== 'perdido')
    .sort((a, b) => b.daysInactive - a.daysInactive)

  // ABC Curve counts
  const curveStats = ['A', 'B', 'C', 'D'].map(c => {
    const count = filteredDeals.filter(d => d.curve === c).length
    const totalVal = filteredDeals.filter(d => d.curve === c).reduce((acc, d) => acc + d.value, 0)
    return { curve: c, count, value: totalVal }
  })

  const representatives = Array.from(new Set(MOCK_DEALS.map(d => d.representative)))

  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-[var(--white)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-[var(--gray)] mt-1 uppercase tracking-wider font-medium">
          Visão geral do pipeline comercial — Carton Pack
        </p>
      </div>

      {/* Filter Row */}
      <div className="card p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Representative Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Representante</label>
          <div className="relative">
            <select
              className="input w-full"
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
            >
              <option value="all">Todos os Representantes</option>
              {representatives.map(rep => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Curve ABC Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Classificação Curva ABC</label>
          <select
            className="input w-full"
            value={selectedCurve}
            onChange={(e) => setSelectedCurve(e.target.value)}
          >
            <option value="all">Todas as Curvas</option>
            <option value="A">Curva A (Alto Faturamento)</option>
            <option value="B">Curva B (Médio Faturamento)</option>
            <option value="C">Curva C (Baixo Faturamento)</option>
            <option value="D">Curva D (Prospecção)</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Período Comercial</label>
          <select
            className="input w-full"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Este Ano</option>
          </select>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card" style={{ '--stat-color': 'var(--lime)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--lime)]">{activeDealsCount}</div>
            <div className="stat-label">Negócios Ativos</div>
          </div>
          <div className="stat-icon bg-[rgba(180,217,50,0.1)]">
            <Package size={20} className="text-[var(--lime)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--green)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--green)]">{formatCurrency(fechamentoValue)}</div>
            <div className="stat-label">Fechamentos (mês)</div>
          </div>
          <div className="stat-icon bg-[rgba(72,199,103,0.1)]">
            <CheckCircle size={20} className="text-[var(--green)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--yellow)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--yellow)]">{inNegotiationCount}</div>
            <div className="stat-label">Em Negociação</div>
          </div>
          <div className="stat-icon bg-[rgba(240,196,25,0.1)]">
            <TrendingUp size={20} className="text-[var(--yellow)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--red)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--red)]">{formatCurrency(perdidoValue)}</div>
            <div className="stat-label">Perdidos (mês)</div>
          </div>
          <div className="stat-icon bg-[rgba(226,72,61,0.1)]">
            <XCircle size={20} className="text-[var(--red)]" />
          </div>
        </div>
      </div>

      {/* Middle Grid Row: Funnel & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funil de Vendas */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-sm mb-6 text-[var(--white)] flex items-center gap-2">
            <span>📊</span> Funil de Vendas
          </h2>
          <div className="flex flex-col gap-4">
            {funnelSummary.map(({ stage, count, value, color }) => (
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
                    <span className="font-mono text-[10px] font-bold text-black">
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

        {/* Negócios Parados / Stale Deals */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--yellow)]" />
              Negócios Parados
            </h2>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
              {staleDeals.map(({ id, title, representative, daysInactive, stage }) => (
                <div
                  key={id}
                  className="bg-[var(--charcoal)] border rounded-lg p-3 transition-all duration-200 hover:border-[var(--line)]"
                  style={{
                    borderColor: daysInactive >= 90 ? 'rgba(226,72,61,0.25)' : 'var(--line)',
                  }}
                >
                  <div className="text-xs font-bold text-[var(--white)] mb-1">
                    {title}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[var(--gray)]">{representative} · {stage}</span>
                    <span
                      className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: daysInactive >= 90 ? 'var(--red)' : 'var(--yellow)',
                        background: daysInactive >= 90 ? 'rgba(226,72,61,0.1)' : 'rgba(240,196,25,0.1)',
                        border: `1px solid ${daysInactive >= 90 ? 'rgba(226,72,61,0.2)' : 'rgba(240,196,25,0.2)'}`,
                      }}
                    >
                      {daysInactive}d parado
                    </span>
                  </div>
                </div>
              ))}

              {staleDeals.length === 0 && (
                <div className="text-xs text-[var(--gray2)] text-center py-8 font-mono">
                  Nenhum negócio pendente
                </div>
              )}
            </div>
          </div>

          <Link href="/pipeline" className="btn btn-secondary w-full mt-6 py-2.5 flex items-center justify-center gap-2">
            <span>Ver Pipeline Completo</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bottom Grid Row: ABC Curve Analysis & Inactivity Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerta de Inatividade Clientes (briefing requirement: curve, inactive warnings) */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--red)]" />
            Alertas de Inatividade (Recorrência Excedida)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--charcoal)] font-mono text-[9px] text-[var(--gray)] uppercase tracking-wider">
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Representante</th>
                  <th className="p-3">Curva</th>
                  <th className="p-3">Sem Comprar</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredDeals
                  .filter(d => d.daysInactive >= 60)
                  .map(deal => (
                    <tr key={deal.id} className="hover:bg-[var(--charcoal)] transition-colors duration-150">
                      <td className="p-3 font-bold text-[var(--white)]">{deal.contactName}</td>
                      <td className="p-3 text-[var(--gray)]">{deal.representative}</td>
                      <td className="p-3">
                        <span 
                          className="font-mono font-black text-[10px] px-2 py-0.5 rounded"
                          style={{
                            color: deal.curve === 'A' ? 'var(--lime)' : 'var(--yellow)',
                            background: deal.curve === 'A' ? 'rgba(180,217,50,0.1)' : 'rgba(240,196,25,0.1)',
                          }}
                        >
                          Curva {deal.curve}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[var(--red)] font-bold">{deal.daysInactive} dias</td>
                      <td className="p-3 text-right">
                        <a 
                          href={whatsappLink(deal.phone, `Olá ${deal.contactName}, faz um tempo que não nos falamos. Gostaria de verificar se precisa de novas embalagens Carton Pack?`)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm py-1 px-2.5 inline-flex items-center gap-1 hover:border-[var(--lime)] hover:text-[var(--lime)]"
                        >
                          <Phone size={10} />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Curva ABC Distribution details */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-2">
              <span>🎯</span> Distribuição Curva ABC
            </h2>
            <div className="flex flex-col gap-4">
              {curveStats.map(({ curve, count, value }) => (
                <div key={curve} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-mono text-xs font-black w-6 h-6 rounded flex items-center justify-center border"
                      style={{
                        borderColor: curve === 'A' ? 'var(--lime)' : curve === 'B' ? 'var(--yellow)' : 'var(--line)',
                        color: curve === 'A' ? 'var(--lime)' : curve === 'B' ? 'var(--yellow)' : 'var(--gray)',
                        background: curve === 'A' ? 'rgba(180,217,50,0.05)' : curve === 'B' ? 'rgba(240,196,25,0.05)' : 'none',
                      }}
                    >
                      {curve}
                    </span>
                    <span className="text-xs text-[var(--gray)]">{count} clientes</span>
                  </div>
                  <span className="font-mono text-xs text-[var(--white)] font-bold">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-4 mt-4 flex justify-between items-center text-xs">
            <span className="text-[var(--gray)] uppercase tracking-wider font-mono">Faturamento Total</span>
            <span className="font-mono text-sm font-black text-[var(--lime)]">
              {formatCurrency(filteredDeals.reduce((acc, d) => acc + d.value, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
