'use client'

import React, { useState } from 'react'
import { X, Printer, Plus, Trash2, Edit3, FileText, CheckCircle, RefreshCw } from 'lucide-react'
import type { PropostaComercial, ItemProposta, ItemPropostaLote } from '@/types/crm'

// Sample initial data matching the exact document from sample (Prop 27.105 - Churrasquito)
const SAMPLE_PROPOSAL: PropostaComercial = {
  id: 'prop-27105',
  numero_proposta: 'Prop. 27.105',
  data_emissao: '13 de Julho de 2026',
  cidade_emissao: 'Sapiranga',
  contato_atencao: 'Maria Eduarda',
  empresa_nome: 'CHURRASQUITO',
  cidade_estado: 'NOVO HAMBURGO / RS',
  representante_nome: 'Josimar Soares',
  representante_cargo: 'Consultor de vendas CARTON PACK',
  representante_fone: '51 9 9883 6667',
  representante_email: 'josimar.soares@cartonpack.com.br',
  itens: [
    {
      id: 'item-1',
      titulo: 'Display Barrinha Proteica menor 12 unid.',
      tamanho: 'Tamanho 130x130x110mm',
      especificacao_tecnica: 'Fechamento com fundo automático, impressão offset em 4 cores seleção, revestido com verniz brilho, em material KRAFT acoplado com micro ondulado pardo, gramatura aprox. 416g/m², selados em pacotes plásticos e acondicionados em paletes com filme stretch.',
      lotes: [
        { no_orcamento: '256043', quantidade: 1000, unidade: 'unidades', valor_unitario: 3.73 },
        { no_orcamento: '256044', quantidade: 2000, unidade: 'unidades', valor_unitario: 2.51 },
        { no_orcamento: '256045', quantidade: 3000, unidade: 'unidades', valor_unitario: 2.05 }
      ]
    },
    {
      id: 'item-2',
      titulo: 'Display Barrinha Proteica maior 24 unid.',
      tamanho: 'Tamanho 170x130x155mm',
      especificacao_tecnica: 'Fechamento com fundo automático, impressão offset em 4 cores seleção, revestido com verniz brilho, em material KRAFT acoplado com micro ondulado pardo, gramatura aprox. 416g/m², selados em pacotes plásticos e acondicionados em paletes com filme stretch.',
      lotes: [
        { no_orcamento: '256048', quantidade: 1000, unidade: 'unidades', valor_unitario: 3.94 },
        { no_orcamento: '256049', quantidade: 2000, unidade: 'unidades', valor_unitario: 2.71 },
        { no_orcamento: '256050', quantidade: 3000, unidade: 'unidades', valor_unitario: 2.26 }
      ]
    }
  ],
  condicoes: {
    prazo_pagamento: '28 dias (mediante aprovação de crédito financeiro Carton Pack)',
    local_faturamento: 'Novo Hamburgo / RS – Faturamento único.',
    local_entrega: 'Frete CIF - Novo Hamburgo / RS – Retirada única.',
    aliquota_icms: '17,00%, diferido para 12,00% (incluso no preço – cliente lança NF de embalagem para INDUSTRIALIZAÇÃO)',
    aliquota_ipi: '09,75% (NÃO incluso no preço – isenção com apresentação de carta)',
    validade_dias: '07 dias.'
  }
}

interface PropostaComercialModalProps {
  isOpen: boolean
  onClose: () => void
  initialProposal?: Partial<PropostaComercial>
}

export function PropostaComercialModal({ isOpen, onClose, initialProposal }: PropostaComercialModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview')

  const createProposalFromInput = (input?: Partial<PropostaComercial>): PropostaComercial => {
    const isCustom = Boolean(input && input.empresa_nome)
    const empName = input?.empresa_nome || 'EMPRESA CLIENTE LTDA'
    const cidEst = input?.cidade_estado || 'SÃO PAULO / SP'
    
    return {
      id: input?.id || `prop-${Date.now()}`,
      numero_proposta: input?.numero_proposta || `Prop. ${Math.floor(20000 + Math.random() * 9000)}`,
      data_emissao: input?.data_emissao || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      cidade_emissao: input?.cidade_emissao || 'Sapiranga',
      contato_atencao: input?.contato_atencao || 'Departamento Comercial',
      empresa_nome: empName,
      cidade_estado: cidEst,
      representante_nome: input?.representante_nome || 'Josimar Soares',
      representante_cargo: input?.representante_cargo || 'Consultor de vendas CARTON PACK',
      representante_fone: input?.representante_fone || '51 9 9883 6667',
      representante_email: input?.representante_email || 'josimar.soares@cartonpack.com.br',
      itens: input?.itens && input.itens.length > 0 ? input.itens : [
        {
          id: 'item-1',
          titulo: 'Embalagem Personalizada Carton Pack',
          tamanho: 'Tamanho 200x150x100mm',
          especificacao_tecnica: 'Fechamento com fundo automático, impressão offset em 4 cores seleção, revestido com verniz brilho, em material MICROONDULADO E acoplado com micro ondulado pardo, gramatura aprox. 320g/m², selados em pacotes plásticos e acondicionados em paletes com filme stretch.',
          lotes: [
            { no_orcamento: '256001', quantidade: 1000, unidade: 'unidades', valor_unitario: 3.50 },
            { no_orcamento: '256002', quantidade: 2000, unidade: 'unidades', valor_unitario: 2.30 },
            { no_orcamento: '256003', quantidade: 3000, unidade: 'unidades', valor_unitario: 1.85 }
          ]
        }
      ],
      condicoes: input?.condicoes || {
        prazo_pagamento: '28 dias (mediante aprovação de crédito financeiro Carton Pack)',
        local_faturamento: `${cidEst} – Faturamento único.`,
        local_entrega: `Frete CIF - ${cidEst} – Retirada única.`,
        aliquota_icms: '17,00%, diferido para 12,00% (incluso no preço – cliente lança NF de embalagem para INDUSTRIALIZAÇÃO)',
        aliquota_ipi: '09,75% (NÃO incluso no preço – isenção com apresentação de carta)',
        validade_dias: '07 dias.'
      }
    }
  }

  // Proposal State synced with initialProposal
  const [proposal, setProposal] = useState<PropostaComercial>(() => createProposalFromInput(initialProposal))

  // Sync state whenever modal opens or initialProposal object updates
  React.useEffect(() => {
    if (isOpen && initialProposal) {
      setProposal(createProposalFromInput(initialProposal))
    }
  }, [isOpen, initialProposal])

  if (!isOpen) return null

  // Print Handler
  const handlePrint = () => {
    window.print()
  }

  // Add Item to Proposal
  const handleAddItem = () => {
    const newItem: ItemProposta = {
      id: `item-${Date.now()}`,
      titulo: 'Caixa de Embalagem Personalizada Carton Pack',
      tamanho: 'Tamanho 200x150x100mm',
      especificacao_tecnica: 'Fechamento com fundo automático, impressão offset em 4 cores seleção, revestido com verniz brilho, em material KRAFT acoplado com micro ondulado pardo, gramatura aprox. 410g/m².',
      lotes: [
        { no_orcamento: `${Math.floor(200000 + Math.random() * 90000)}`, quantidade: 1000, unidade: 'unidades', valor_unitario: 4.50 },
        { no_orcamento: `${Math.floor(200000 + Math.random() * 90000)}`, quantidade: 2000, unidade: 'unidades', valor_unitario: 3.20 }
      ]
    }
    setProposal(prev => ({ ...prev, itens: [...prev.itens, newItem] }))
  }

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setProposal(prev => ({ ...prev, itens: prev.itens.filter(i => i.id !== itemId) }))
  }

  // Add Lote to Item
  const handleAddLote = (itemId: string) => {
    setProposal(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.id !== itemId) return item
        const nextQty = (item.lotes.length + 1) * 1000
        const newLote: ItemPropostaLote = {
          no_orcamento: `${Math.floor(250000 + Math.random() * 90000)}`,
          quantidade: nextQty,
          unidade: 'unidades',
          valor_unitario: 2.50
        }
        return { ...item, lotes: [...item.lotes, newLote] }
      })
    }))
  }

  // Remove Lote
  const handleRemoveLote = (itemId: string, loteIdx: number) => {
    setProposal(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.id !== itemId) return item
        return { ...item, lotes: item.lotes.filter((_, idx) => idx !== loteIdx) }
      })
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      
      {/* ── TOP CONTROL BAR (HIDDEN ON PRINT) ── */}
      <div className="w-full max-w-4xl bg-[var(--charcoal)] border border-[var(--line)] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0 shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--lime)]/10 border border-[var(--lime)]/20 flex items-center justify-center text-[var(--lime)]">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base text-[var(--white)] font-bold tracking-tight">
              Proposta Comercial — Carton Pack
            </h3>
            <div className="text-[10px] font-mono text-[var(--gray)]">
              {proposal.numero_proposta} · {proposal.empresa_nome} ({proposal.contato_atencao})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Toggle */}
          <div className="flex items-center bg-[var(--black)] p-1 rounded-xl border border-[var(--line)]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'preview' ? 'bg-[var(--lime)] text-black shadow-md' : 'text-[var(--gray)] hover:text-white'}`}
            >
              <FileText size={13} />
              <span>Documento PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'edit' ? 'bg-[var(--lime)] text-black shadow-md' : 'text-[var(--gray)] hover:text-white'}`}
            >
              <Edit3 size={13} />
              <span>Editar Campos</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="btn btn-primary py-2 px-4 text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 rounded-xl shadow-lg shadow-[rgba(180,217,50,0.2)] cursor-pointer"
          >
            <Printer size={14} />
            <span>Imprimir / PDF A4</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[var(--line)] bg-[var(--black)] text-[var(--gray)] hover:text-white hover:border-red-500/50 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT: FORM EDIT MODE ── */}
      {activeTab === 'edit' && (
        <div className="w-full max-w-4xl bg-[var(--charcoal)] border border-[var(--line)] rounded-2xl p-6 space-y-6 text-white text-xs print:hidden animate-fade-in">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-display text-sm font-bold text-[var(--lime)] uppercase tracking-wider font-mono">1. Dados da Proposta & Destinatário</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">Nº da Proposta</label>
              <input
                type="text"
                value={proposal.numero_proposta}
                onChange={e => setProposal(p => ({ ...p, numero_proposta: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">A/C (Contato)</label>
              <input
                type="text"
                value={proposal.contato_atencao}
                onChange={e => setProposal(p => ({ ...p, contato_atencao: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">Empresa / Razão Social</label>
              <input
                type="text"
                value={proposal.empresa_nome}
                onChange={e => setProposal(p => ({ ...p, empresa_nome: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">Cidade / Estado</label>
              <input
                type="text"
                value={proposal.cidade_estado}
                onChange={e => setProposal(p => ({ ...p, cidade_estado: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">Data de Emissão</label>
              <input
                type="text"
                value={proposal.data_emissao}
                onChange={e => setProposal(p => ({ ...p, data_emissao: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[var(--gray2)] mb-1 block">Cidade Emissão</label>
              <input
                type="text"
                value={proposal.cidade_emissao}
                onChange={e => setProposal(p => ({ ...p, cidade_emissao: e.target.value }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
          </div>

          <div className="border-b border-[var(--line)] pb-3 pt-2 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-[var(--lime)] uppercase tracking-wider font-mono">2. Itens da Proposta & Tabelas de Lotes</h4>
            <button onClick={handleAddItem} className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer">
              <Plus size={13} />
              <span>Adicionar Produto</span>
            </button>
          </div>

          <div className="space-y-6">
            {proposal.itens.map((item, itemIdx) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--black)] space-y-4 relative">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2">
                  <span className="font-mono text-xs text-[var(--lime)] font-bold uppercase">Item #{itemIdx + 1}</span>
                  {proposal.itens.length > 1 && (
                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-mono cursor-pointer">
                      <Trash2 size={13} /> Remover Item
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Título do Produto</label>
                    <input
                      type="text"
                      value={item.titulo}
                      onChange={e => {
                        const val = e.target.value
                        setProposal(p => ({
                          ...p,
                          itens: p.itens.map(i => i.id === item.id ? { ...i, titulo: val } : i)
                        }))
                      }}
                      className="w-full bg-[var(--charcoal)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[var(--lime)]/50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Tamanho / Dimensão</label>
                    <input
                      type="text"
                      value={item.tamanho}
                      onChange={e => {
                        const val = e.target.value
                        setProposal(p => ({
                          ...p,
                          itens: p.itens.map(i => i.id === item.id ? { ...i, tamanho: val } : i)
                        }))
                      }}
                      className="w-full bg-[var(--charcoal)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Especificação Técnica Completa</label>
                  <textarea
                    rows={3}
                    value={item.especificacao_tecnica}
                    onChange={e => {
                      const val = e.target.value
                      setProposal(p => ({
                        ...p,
                        itens: p.itens.map(i => i.id === item.id ? { ...i, especificacao_tecnica: val } : i)
                      }))
                    }}
                    className="w-full bg-[var(--charcoal)] border border-[var(--line)] rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--lime)]/50 leading-relaxed font-sans"
                  />
                </div>

                {/* Pricing Lotes Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono uppercase text-[var(--gray2)] font-bold">Tabela de Lotes / Preço Unitário</label>
                    <button onClick={() => handleAddLote(item.id)} className="text-[10px] font-mono text-[var(--lime)] hover:underline flex items-center gap-1 cursor-pointer">
                      <Plus size={11} /> Adicionar Lote
                    </button>
                  </div>

                  <div className="space-y-2">
                    {item.lotes.map((lote, loteIdx) => (
                      <div key={loteIdx} className="grid grid-cols-12 gap-2 items-center bg-[var(--charcoal)] p-2 rounded-xl border border-[var(--line)]/60">
                        <div className="col-span-3">
                          <span className="text-[8px] font-mono text-[var(--gray2)] uppercase block">Nº Orçamento</span>
                          <input
                            type="text"
                            value={lote.no_orcamento}
                            onChange={e => {
                              const val = e.target.value
                              setProposal(p => ({
                                ...p,
                                itens: p.itens.map(i => i.id === item.id ? {
                                  ...i,
                                  lotes: i.lotes.map((l, idx) => idx === loteIdx ? { ...l, no_orcamento: val } : l)
                                } : i)
                              }))
                            }}
                            className="w-full bg-[var(--black)] border border-[var(--line)] rounded-lg px-2 py-1 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="col-span-4">
                          <span className="text-[8px] font-mono text-[var(--gray2)] uppercase block">Quantidade (unidades)</span>
                          <input
                            type="number"
                            value={lote.quantidade}
                            onChange={e => {
                              const val = Number(e.target.value)
                              setProposal(p => ({
                                ...p,
                                itens: p.itens.map(i => i.id === item.id ? {
                                  ...i,
                                  lotes: i.lotes.map((l, idx) => idx === loteIdx ? { ...l, quantidade: val } : l)
                                } : i)
                              }))
                            }}
                            className="w-full bg-[var(--black)] border border-[var(--line)] rounded-lg px-2 py-1 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="col-span-4">
                          <span className="text-[8px] font-mono text-[var(--gray2)] uppercase block">R$ Unitário</span>
                          <input
                            type="number"
                            step="0.01"
                            value={lote.valor_unitario}
                            onChange={e => {
                              const val = Number(e.target.value)
                              setProposal(p => ({
                                ...p,
                                itens: p.itens.map(i => i.id === item.id ? {
                                  ...i,
                                  lotes: i.lotes.map((l, idx) => idx === loteIdx ? { ...l, valor_unitario: val } : l)
                                } : i)
                              }))
                            }}
                            className="w-full bg-[var(--black)] border border-[var(--line)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--lime)] font-bold"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          {item.lotes.length > 1 && (
                            <button onClick={() => handleRemoveLote(item.id, loteIdx)} className="text-red-400 hover:text-red-300 cursor-pointer">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-[var(--line)] pb-3 pt-2">
            <h4 className="font-display text-sm font-bold text-[var(--lime)] uppercase tracking-wider font-mono">3. Condições Comerciais do Orçamento</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Prazo de Pagamento</label>
              <input
                type="text"
                value={proposal.condicoes.prazo_pagamento}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, prazo_pagamento: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Local de Faturamento</label>
              <input
                type="text"
                value={proposal.condicoes.local_faturamento}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, local_faturamento: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Local de Entrega</label>
              <input
                type="text"
                value={proposal.condicoes.local_entrega}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, local_entrega: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Validade da Proposta</label>
              <input
                type="text"
                value={proposal.condicoes.validade_dias}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, validade_dias: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Alíquota ICMS</label>
              <input
                type="text"
                value={proposal.condicoes.aliquota_icms}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, aliquota_icms: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-mono uppercase text-[var(--gray2)] mb-1 block">Alíquota IPI</label>
              <input
                type="text"
                value={proposal.condicoes.aliquota_ipi}
                onChange={e => setProposal(p => ({ ...p, condicoes: { ...p.condicoes, aliquota_ipi: e.target.value } }))}
                className="w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setActiveTab('preview')}
              className="btn btn-primary py-2.5 px-6 text-xs font-black uppercase tracking-wider text-black flex items-center gap-2 rounded-xl cursor-pointer"
            >
              <CheckCircle size={15} />
              <span>Concluir Edição e Ver PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PREVIEW MODE (FIDEDIGNO A4 SHEET) ── */}
      {activeTab === 'preview' && (
        <div id="proposta-print-area" className="w-full max-w-[794px] bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden font-sans print:shadow-none print:w-full print:max-w-none print:m-0 animate-fade-in relative text-slate-800 leading-normal mb-8">
          
          {/* 1. TOP HEADER BANNER (BLACK WITH LOGO & DOMAIN) */}
          <div className="bg-[#070707] text-white px-8 py-5 flex items-center justify-between border-b-2 border-lime-500">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">
                CARTONPACK<span className="text-lime-400 font-sans text-xs align-super ml-0.5">®</span>
              </span>
            </div>
            <div className="font-mono text-xs text-slate-300 tracking-wider">
              cartonpack.com.br
            </div>
          </div>

          {/* 2. DOCUMENT BODY */}
          <div className="p-8 sm:p-10 space-y-7 relative">

            {/* Title Row */}
            <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
              <h1 className="font-display text-2xl font-extrabold text-[#78a417] tracking-wider uppercase">
                PROPOSTA COMERCIAL
              </h1>
              <span className="font-mono text-sm font-semibold text-slate-700">
                {proposal.numero_proposta}
              </span>
            </div>

            {/* Client Info */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-700">
                A/c: <span className="font-semibold text-slate-900">{proposal.contato_atencao}</span>
              </div>
              <div className="font-display text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                {proposal.empresa_nome} – {proposal.cidade_estado}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-7">
              {proposal.itens.map((item) => (
                <div key={item.id} className="space-y-3">
                  
                  {/* Item Title & Dimensions */}
                  <div className="border-b border-slate-900 pb-1">
                    <h2 className="font-display text-base font-bold text-slate-900">
                      {item.titulo} <span className="font-normal text-slate-800">– {item.tamanho}</span>
                    </h2>
                  </div>

                  {/* Technical Spec Paragraph */}
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {item.especificacao_tecnica}
                  </p>

                  {/* Pricing Lotes Table */}
                  <div className="border border-slate-900 rounded-none overflow-hidden">
                    <table className="w-full text-xs font-sans text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 font-bold font-mono text-[11px] text-slate-900 bg-slate-50">
                          <th className="py-1.5 px-4 w-[28%] border-r border-slate-300">Nº ORÇ.</th>
                          <th className="py-1.5 px-4 w-[42%] border-r border-slate-300">QUANT. / LOTE</th>
                          <th className="py-1.5 px-4 text-left">R$ UNIT.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {item.lotes.map((lote, lIdx) => (
                          <tr key={lIdx} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-4 font-mono border-r border-slate-200 text-slate-900">{lote.no_orcamento}</td>
                            <td className="py-1.5 px-4 border-r border-slate-200 text-slate-900">
                              {lote.quantidade.toLocaleString('pt-BR')} {lote.unidade}
                            </td>
                            <td className="py-1.5 px-4 font-mono font-semibold text-slate-900">
                              {lote.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Commercial Conditions Block with Tree Watermark */}
            <div className="pt-2 relative overflow-hidden">
              
              {/* SVG Tree Watermark Background */}
              <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none transform translate-x-6 translate-y-6">
                <svg width="260" height="260" viewBox="0 0 100 100" fill="#22c55e">
                  <path d="M50 5 C30 25 15 55 50 95 C85 55 70 25 50 5 Z M50 95 L50 35 M50 50 L30 35 M50 65 L70 50 M50 80 L32 68" stroke="#16a34a" strokeWidth="3" fill="none" />
                </svg>
              </div>

              <div className="space-y-2 relative z-10">
                <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wide">
                  CONDIÇÕES DESSE ORÇAMENTO:
                </h3>
                
                <div className="text-xs text-slate-800 space-y-1 font-sans leading-relaxed">
                  <div>
                    <span className="font-semibold text-slate-900">Prazo de Pagamento:</span> {proposal.condicoes.prazo_pagamento}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Local de Faturamento:</span> {proposal.condicoes.local_faturamento}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Local de Entrega:</span> {proposal.condicoes.local_entrega}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Alíquota ICMS:</span> {proposal.condicoes.aliquota_icms}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Alíquota IPI:</span> {proposal.condicoes.aliquota_ipi}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Validade da Proposta:</span> {proposal.condicoes.validade_dias}
                  </div>
                </div>
              </div>

              {/* City and Date Line */}
              <div className="text-center text-xs font-medium text-slate-900 pt-6">
                {proposal.cidade_emissao}, {proposal.data_emissao}
              </div>

              {/* Representative Credentials Line */}
              <div className="text-left pt-6 space-y-0.5">
                <div className="font-bold text-xs text-slate-900">
                  {proposal.representante_nome} - <span className="font-normal text-slate-800">{proposal.representante_cargo}</span>
                </div>
                <div className="text-xs text-slate-800">
                  Fone / Whatsapp - <span className="font-semibold">{proposal.representante_fone}</span>
                </div>
                <div className="text-xs text-slate-800 text-slate-800 underline">
                  {proposal.representante_email}
                </div>
              </div>
            </div>

            {/* 3. CERTIFICATIONS FOOTER STRIP */}
            <div className="pt-6 border-t border-slate-900 space-y-3">
              <div className="text-[11px] font-bold text-slate-900 uppercase font-mono tracking-wider text-center">
                CARTON PACK – Licenças e Certificações
              </div>

              {/* Badges Flex Grid */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[9px] font-bold text-slate-700">
                
                {/* FSC Badge */}
                <div className="flex items-center gap-1.5 border border-slate-300 rounded px-2 py-1 bg-slate-50">
                  <div className="w-5 h-5 rounded bg-emerald-800 text-white flex items-center justify-center font-serif text-[10px]">
                    FSC
                  </div>
                  <div>
                    <div className="font-black text-slate-900 leading-tight">FSC®</div>
                    <div className="text-[7px] text-slate-500 font-mono">C009707</div>
                  </div>
                </div>

                {/* Eureciclo Badge */}
                <div className="flex items-center gap-1.5 border border-slate-300 rounded px-2 py-1 bg-slate-50">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    ♻️
                  </div>
                  <div className="font-extrabold text-emerald-700 tracking-tight">
                    eureciclo
                  </div>
                </div>

                {/* Empresa Neutra de Carbono */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px]">
                    🍃
                  </div>
                  <div>
                    <div className="font-black text-slate-900">NEUTRA DE</div>
                    <div className="text-emerald-700 font-black">CARBONO</div>
                  </div>
                </div>

                {/* Perfil Energia Limpa */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="font-black text-slate-900">PERFIL</div>
                  <span className="bg-emerald-600 text-white px-1 py-0.5 rounded font-black text-[7px]">+ limpa</span>
                </div>

                {/* Parceira da Natureza */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="font-black text-slate-900">PARCEIRA</div>
                  <div className="text-emerald-700 font-black">DA NATUREZA</div>
                </div>

                {/* Control Union ISO 9001 */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="font-black text-slate-900">ISO 9001</div>
                  <div className="text-blue-700 font-black">CERTIFIED</div>
                </div>

                {/* Produto Eco Sustentavel IBDN */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="font-black text-emerald-800">ECO SUSTENTÁVEL</div>
                  <div className="text-slate-500 text-[7px]">IBDN</div>
                </div>

                {/* Disney FAMA Certified */}
                <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-slate-50 text-[8px] uppercase">
                  <div className="font-serif italic font-bold text-slate-900">Walt Disney</div>
                  <div className="text-slate-700 font-black">F.A.M.A.</div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #proposta-print-area, #proposta-print-area * {
            visibility: visible !important;
          }
          #proposta-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
