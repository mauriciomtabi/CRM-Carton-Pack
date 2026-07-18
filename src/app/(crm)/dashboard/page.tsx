'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Filter,
  Calendar,
  Phone,
  Mic,
  MicOff,
  Camera,
  MapPin,
  Sparkles,
  Clock,
  ArrowUpRight,
  Navigation,
  LogOut,
  Upload,
  Check
} from 'lucide-react'
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
  { id: '1', title: 'Caixa Premium Natura', representative: 'Ana Lima', stage: 'leads', value: 15000, curve: 'A', daysInactive: 15, contactName: 'Ana Lima', phone: '11988888888' },
  { id: '2', title: 'Display Gota Limpa', representative: 'Ermínio Sales', stage: 'leads', value: 25000, curve: 'A', daysInactive: 95, contactName: 'Alvaro Ferreira', phone: '51999999999' },
  { id: '3', title: 'Embalagem XP Presentes', representative: 'Carlos Mendes', stage: 'prospect', value: 12000, curve: 'B', daysInactive: 30, contactName: 'Carlos Mendes', phone: '21977777777' },
  { id: '4', title: 'Caixa Vinho Gourmet', representative: 'Marina Costa', stage: 'briefing', value: 32000, curve: 'C', daysInactive: 10, contactName: 'Marina Costa', phone: '54922222222' },
  { id: '5', title: 'Embalagem Cosméticos M.', representative: 'Fernanda R.', stage: 'briefing', value: 18000, curve: 'C', daysInactive: 120, contactName: 'Fernanda Ramos', phone: '31966666666' },
  { id: '6', title: 'Kit Natal Lojas Renner', representative: 'Renner Compras', stage: 'fechamento', value: 87500, curve: 'A', daysInactive: 5, contactName: 'Renner Compras', phone: '51944444444' },
  { id: '7', title: 'Caixa Presente Boticário', representative: 'Gustavo N.', stage: 'aprovacao', value: 48000, curve: 'A', daysInactive: 45, contactName: 'Gustavo Nogueira', phone: '41955555555' },
  { id: '8', title: 'Bandeja Padaria Central', representative: 'Ermínio Sales', stage: 'perdido', value: 23000, curve: 'D', daysInactive: 110, contactName: 'Paulo Lima', phone: '51933333333' },
]

export default function DashboardPage() {
  // Roles and Current User Session
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null)
  const [contacts, setContacts] = useState<any[]>([])

  // Dashboard Filters
  const [selectedRep, setSelectedRep] = useState<string>('all')
  const [selectedCurve, setSelectedCurve] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30')

  // Representative Portal States
  const [visitsGoal, setVisitsGoal] = useState(15)
  const [completedVisits, setCompletedVisits] = useState(8)
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioTranscription, setAudioTranscription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [checkinSuccessToast, setCheckinSuccessToast] = useState(false)

  // Load Session and Database
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('crm_current_user')
      if (session) {
        try {
          setCurrentUser(JSON.parse(session))
        } catch (e) {
          console.error(e)
        }
      } else {
        // Fallback default admin for test
        setCurrentUser({ id: '4', name: 'Julio Cesar', email: 'julio.admin@cartonpack.com', role: 'admin' })
      }

      const savedContacts = localStorage.getItem('crm_contacts')
      if (savedContacts) {
        try {
          setContacts(JSON.parse(savedContacts))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  // Timer for Audio Record simulation
  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const saveContacts = (updated: any[]) => {
    setContacts(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_contacts', JSON.stringify(updated))
    }
  }

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

  // Inactive / Stale deals alerts
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

  // Audio Recording handlers
  const handleStartRecording = () => {
    setIsRecording(true)
    setAudioTranscription('')
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsTranscribing(true)
    
    // Simulate transcription wait
    setTimeout(() => {
      setIsTranscribing(false)
      setAudioTranscription(
        "Reunião presencial produtiva. O cliente analisou os novos mostruários de papel cartão triplex com verniz localizado. Gostou do acabamento Carton Pack e solicitou orçamento detalhado para lote inicial de 5.000 caixas personalizadas."
      )
    }, 2500)
  }

  // Handle Photo selection simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  // Submit Visit Check-in
  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContactId) return

    const selectedContact = contacts.find(c => c.id === selectedContactId)
    if (!selectedContact) return

    // Inject check-in note to timeline
    const checkinActivity = {
      date: new Date().toLocaleDateString('pt-BR'),
      title: 'Check-in de Visita Comercial (Voz & Foto)',
      description: audioTranscription || 'Visita presencial efetuada pelo representante.',
      type: 'visita',
      hasAudio: !!audioTranscription,
      photoUrl: photoUrl || null,
      gps: 'Sapucaia do Sul - RS (GPS Simulado: -29.834, -51.143)'
    }

    const updatedContacts = contacts.map(c => {
      if (c.id === selectedContactId) {
        // Reset inactivity, set status as active (ativo)
        return {
          ...c,
          status: 'ativo',
          lastPurchaseDays: 1, // Visited now
          activities: [checkinActivity, ...(c.activities || [])]
        }
      }
      return c
    })

    saveContacts(updatedContacts)
    setCompletedVisits(v => v + 1)
    
    // Reset states
    setShowCheckinModal(false)
    setSelectedContactId('')
    setAudioTranscription('')
    setPhotoUrl('')
    
    // Show toast
    setCheckinSuccessToast(true)
    setTimeout(() => setCheckinSuccessToast(false), 4000)
  }

  // Mobile layout filter: representative contacts needing attention (visited >30 days or inactive)
  const repContactsNeedingAttention = contacts.filter(c => {
    // If current logged-in user is representative, only show their clients
    const isOwner = !currentUser || c.representative === currentUser.name
    const isInactive = c.status === 'inativo' || (c.lastPurchaseDays && c.lastPurchaseDays > 30)
    return isOwner && isInactive
  })

  // Format recording timer helper
  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  // LOGOUT simulation
  const handleLogout = () => {
    localStorage.removeItem('crm_current_user')
    window.location.href = '/login'
  }

  // ==================== ROLE: REPRESENTANTE (MOBILE PORTAL) ====================
  if (currentUser?.role === 'representante') {
    return (
      <div className="page-content animate-fade-in w-full h-full flex flex-col gap-5 max-w-md mx-auto px-1 py-3 pb-24">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mt-2">
          <div>
            <span className="text-[10px] font-mono text-[var(--lime)] font-bold tracking-wider uppercase">Portal do Representante</span>
            <h1 className="font-display text-xl text-[var(--white)] font-bold tracking-tight mt-0.5">
              Olá, {currentUser.name}!
            </h1>
            <p className="text-[11px] text-[var(--gray)] font-mono">Pronto para visitar seus clientes hoje?</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Sair do CRM"
            className="p-2 border border-[var(--line)] rounded-xl text-[var(--gray2)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-all bg-transparent"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Visit Meta Target Card */}
        <div className="card p-5 relative overflow-hidden bg-gradient-to-br from-[var(--charcoal)] to-[#151617] border border-[rgba(180,217,50,0.15)] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] font-mono text-[var(--gray)] font-bold uppercase tracking-wide">Meta de Visitas Mensal</div>
              <div className="text-2xl font-display font-black text-[var(--lime)] mt-1">{completedVisits} <span className="text-xs text-[var(--gray2)] font-mono font-medium">/ {visitsGoal} realizadas</span></div>
            </div>
            {/* Visual Circular Ring Progress simulated */}
            <div className="w-14 h-14 rounded-full border-4 border-[rgba(180,217,50,0.1)] flex items-center justify-center relative" style={{ borderColor: 'rgba(180,217,50,0.1)' }}>
              <div className="absolute inset-0 rounded-full border-4 border-[var(--lime)]" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${Math.min(100, Math.floor((completedVisits/visitsGoal)*100))}%, 0 ${Math.min(100, Math.floor((completedVisits/visitsGoal)*100))}%)` }}></div>
              <span className="text-xs font-mono font-black text-[var(--white)]">{Math.floor((completedVisits / visitsGoal) * 100)}%</span>
            </div>
          </div>

          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-[var(--line)]">
            <div className="bg-[var(--lime)] h-full transition-all duration-500 ease-out" style={{ width: `${(completedVisits / visitsGoal) * 100}%` }}></div>
          </div>
          
          <button 
            onClick={() => {
              setSelectedContactId('')
              setAudioTranscription('')
              setPhotoUrl('')
              setShowCheckinModal(true)
            }}
            className="btn btn-primary py-3 text-xs font-black uppercase tracking-wider text-black flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[rgba(180,217,50,0.2)] mt-1"
          >
            <MapPin size={14} />
            <span>Registrar Visita (Check-in)</span>
          </button>
        </div>

        {/* Check-in Success Toast Notification */}
        {checkinSuccessToast && (
          <div className="bg-[rgba(34,197,94,0.95)] border border-[rgba(34,197,94,0.3)] rounded-xl p-3 text-black text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in z-50">
            <CheckCircle size={15} />
            <span>Visita e relato por voz salvos no cliente com sucesso! Meta atualizada.</span>
          </div>
        )}

        {/* Dynamic Route/Inactivity Alerts section */}
        <div>
          <h3 className="text-xs font-mono font-bold text-[var(--gray2)] uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Clientes Pendentes ({repContactsNeedingAttention.length})</span>
            <span className="text-[10px] text-[var(--yellow)]">Foco Inatividade</span>
          </h3>

          <div className="flex flex-col gap-3">
            {repContactsNeedingAttention.map(contact => (
              <div key={contact.id} className="card p-4 hover:border-[var(--lime)] transition-colors flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--white)]">{contact.name}</h4>
                    <p className="text-[11px] text-[var(--gray)] font-mono mt-0.5">{contact.city} · {contact.uf}</p>
                  </div>
                  <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    contact.status === 'inativo' ? 'bg-[rgba(239,68,68,0.15)] text-[var(--red)] border border-[rgba(239,68,68,0.25)]' : 'bg-[rgba(240,196,25,0.15)] text-[var(--yellow)] border border-[rgba(240,196,25,0.25)]'
                  }`}>
                    {contact.lastPurchaseDays ? `${contact.lastPurchaseDays}d sem compra` : 'Inativo'}
                  </span>
                </div>

                <div className="border-t border-[var(--line)] pt-3 flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.name} ${contact.city} ${contact.uf}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 btn btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 rounded-lg border-[var(--line)]"
                  >
                    <Navigation size={12} className="text-[var(--lime)]" />
                    <span>Traçar Rota</span>
                  </a>
                  
                  <button 
                    onClick={() => {
                      setSelectedContactId(contact.id)
                      setAudioTranscription('')
                      setPhotoUrl('')
                      setShowCheckinModal(true)
                    }}
                    className="flex-1 btn btn-secondary text-[11px] py-2 flex items-center justify-center gap-1.5 rounded-lg hover:border-[var(--lime)] hover:text-[var(--lime)]"
                  >
                    <MapPin size={12} />
                    <span>Check-in</span>
                  </button>
                </div>
              </div>
            ))}

            {repContactsNeedingAttention.length === 0 && (
              <div className="card p-8 text-center text-xs text-[var(--gray2)] font-mono border-dashed">
                🎉 Parabéns! Todos os seus clientes estão visitados e ativos.
              </div>
            )}
          </div>
        </div>

        {/* Check-in Modal Overlay */}
        {showCheckinModal && (
          <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col justify-end">
            <div className="bg-[var(--charcoal)] border-t border-[var(--line)] rounded-t-3xl p-5 flex flex-col gap-4 animate-fade-up max-w-md mx-auto w-full h-[95vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
                <div>
                  <h3 className="font-display text-sm text-[var(--white)] font-bold">Registrar Visita Presencial</h3>
                  <p className="text-[10px] text-[var(--gray)] font-mono mt-0.5">GPS: Sapucaia do Sul - RS (Simulado)</p>
                </div>
                <button 
                  onClick={() => setShowCheckinModal(false)}
                  className="p-1 rounded-lg bg-black/20 text-[var(--gray)] hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleCheckinSubmit} className="flex flex-col gap-4 flex-1">
                
                {/* Select Contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">Cliente Visitado *</label>
                  <select
                    className="input w-full"
                    required
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                  >
                    <option value="">Selecione o Cliente...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city}-{c.uf})</option>
                    ))}
                  </select>
                </div>

                {/* Simulated GPS Indicator */}
                <div className="flex items-center gap-2 p-2.5 bg-black/40 border border-[var(--line)] rounded-xl text-[10px] font-mono text-[var(--gray)]">
                  <MapPin size={12} className="text-[var(--lime)] shrink-0" />
                  <span>Check-in GPS validado no local do cliente.</span>
                </div>

                {/* AUDIO RECORDING SECTION */}
                <div className="flex flex-col gap-1.5 border border-[var(--line)] rounded-xl p-4 bg-black/20">
                  <label className="text-[9px] font-bold text-[var(--lime)] uppercase font-mono tracking-wider flex items-center justify-between">
                    <span>Relato Comercial por Voz</span>
                    {isRecording && <span className="text-[var(--red)] animate-pulse">Gravando... {formatTimer(recordingTime)}</span>}
                  </label>
                  
                  <div className="flex flex-col items-center justify-center py-4 gap-3">
                    {/* Visualizer Waveform during recording */}
                    {isRecording ? (
                      <div className="flex items-center gap-1 justify-center h-10 w-full">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-1.5 bg-[var(--lime)] rounded-full animate-pulse"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              height: `${Math.floor(10 + Math.random() * 26)}px`
                            }}
                          />
                        ))}
                      </div>
                    ) : isTranscribing ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-6 h-6 border-2 border-[var(--lime)] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] text-[var(--gray)] font-mono animate-pulse">Gerando inteligência por áudio...</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[var(--gray2)] font-mono text-center max-w-[200px]">
                        Toque no microfone abaixo e fale seu relato para transcrever.
                      </div>
                    )}

                    {/* Microphone Toggle Button */}
                    <button
                      type="button"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isRecording 
                          ? 'bg-[var(--red)] text-white hover:bg-[#ef4444] animate-ping-slow' 
                          : 'bg-[var(--lime)] text-black hover:scale-105'
                      }`}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  </div>

                  {/* Audio Transcription text result editable */}
                  <textarea
                    className="input w-full min-h-[90px] text-xs font-mono"
                    placeholder="Transcrição do áudio aparecerá aqui..."
                    value={audioTranscription}
                    onChange={(e) => setAudioTranscription(e.target.value)}
                  />
                </div>

                {/* PHOTO UPLOADER */}
                <div className="flex flex-col gap-1.5 border border-[var(--line)] rounded-xl p-4 bg-black/20">
                  <label className="text-[9px] font-bold text-[var(--lime)] uppercase font-mono tracking-wider flex items-center justify-between">
                    <span>Foto da Fachada / Visita</span>
                    {photoUrl && <span className="text-[var(--lime)] font-mono text-[8px] uppercase">Carregada</span>}
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border border-dashed border-[var(--line)] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-black/10 hover:bg-black/30 transition-colors">
                      <Camera size={18} className="text-[var(--lime)]" />
                      <span className="text-[10px] font-mono text-[var(--gray)]">Tirar Foto / Carregar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {photoUrl && (
                      <div className="w-16 h-16 rounded-xl border border-[var(--line)] overflow-hidden shrink-0 relative bg-black/50">
                        <img src={photoUrl} alt="Fachada" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setPhotoUrl('')}
                          className="absolute top-0 right-0 w-4 h-4 bg-black/80 rounded-bl text-[8px] font-bold text-red-500"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Buttons */}
                <div className="flex gap-3 border-t border-[var(--line)] pt-3 mt-auto">
                  <button 
                    type="button" 
                    onClick={() => setShowCheckinModal(false)}
                    className="btn btn-secondary py-3 flex-1 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!selectedContactId}
                    className="btn btn-primary py-3 flex-1 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50"
                  >
                    Salvar Check-in
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==================== ROLE: ADMIN / OUTROS (TRADITIONAL DASHBOARD) ====================
  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[var(--white)] font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[var(--gray)] mt-1 font-mono">
            Painel Geral de Vendas e Negócios Carton Pack.
          </p>
        </div>
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
        <div className="stat-card" style={{ '--stat-color': 'var(--lime)', '--stat-glow-bg': 'rgba(180,217,50,0.12)', '--stat-glow-border': 'rgba(180,217,50,0.25)', '--stat-glow-color': 'rgba(180,217,50,0.35)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--lime)]">{activeDealsCount}</div>
            <div className="stat-label">Negócios Ativos</div>
          </div>
          <div className="stat-icon">
            <Package size={32} className="text-[var(--lime)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--green)', '--stat-glow-bg': 'rgba(72,199,103,0.12)', '--stat-glow-border': 'rgba(72,199,103,0.25)', '--stat-glow-color': 'rgba(72,199,103,0.35)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--green)]">{formatCurrency(fechamentoValue)}</div>
            <div className="stat-label">Fechamentos (mês)</div>
          </div>
          <div className="stat-icon">
            <CheckCircle size={32} className="text-[var(--green)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--yellow)', '--stat-glow-bg': 'rgba(240,196,25,0.12)', '--stat-glow-border': 'rgba(240,196,25,0.25)', '--stat-glow-color': 'rgba(240,196,25,0.35)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--yellow)]">{inNegotiationCount}</div>
            <div className="stat-label">Em Negociação</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={32} className="text-[var(--yellow)]" />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--red)', '--stat-glow-bg': 'rgba(226,72,61,0.12)', '--stat-glow-border': 'rgba(226,72,61,0.25)', '--stat-glow-color': 'rgba(226,72,61,0.35)' } as React.CSSProperties}>
          <div>
            <div className="stat-value text-[var(--red)]">{formatCurrency(perdidoValue)}</div>
            <div className="stat-label">Perdidos (mês)</div>
          </div>
          <div className="stat-icon">
            <XCircle size={32} className="text-[var(--red)]" />
          </div>
        </div>
      </div>

      {/* Middle Grid Row: Funnel & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funil de Vendas */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-sm mb-6 text-[var(--white)] flex items-center gap-3">
            <div className="section-header-icon">
              <TrendingUp size={20} />
            </div>
            Funil de Vendas
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
            <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-3">
              <div className="section-header-icon">
                <AlertTriangle size={20} />
              </div>
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
        {/* Alerta de Inatividade Clientes */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-3">
            <div className="section-header-icon">
              <AlertTriangle size={20} />
            </div>
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
            <h2 className="font-display text-sm mb-4 text-[var(--white)] flex items-center gap-3">
              <div className="section-header-icon">
                <Package size={20} />
              </div>
              Distribuição Curva ABC
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
