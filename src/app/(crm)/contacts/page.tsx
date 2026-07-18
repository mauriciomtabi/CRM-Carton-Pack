'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Phone, 
  User, 
  Building2, 
  AlertCircle, 
  MapPin, 
  Plus, 
  X, 
  Send, 
  FileText,
  Mail,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Percent,
  FileSpreadsheet
} from 'lucide-react'
import { whatsappLink, formatCurrency } from '@/lib/utils'

interface MockContact {
  id: string
  name: string
  company: string
  cnpj: string
  curve: 'A' | 'B' | 'C' | 'D'
  representative: string
  lastPurchaseDays: number
  phone: string
  city: string
  state: string
  status: 'ativo' | 'inativo'
  email?: string
  // Expanded fields
  tradeName?: string
  registrationStatus?: string
  mainCnae?: string
  address?: string
  taxRegime?: 'MEI' | 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real'
  specialSituation?: string
  specialSituationDate?: string
  stateRegistration?: string // Inscrição Estadual
}

interface Activity {
  id: string
  type: 'nota' | 'whatsapp' | 'ligacao' | 'email' | 'reuniao'
  content: string
  timestamp: string
}

const MOCK_CONTACTS: MockContact[] = [
  { id: '1', name: 'Alvaro Ferreira', company: 'Gota Limpa Indústria', cnpj: '12.345.678/0001-90', curve: 'A', representative: 'Ermínio', lastPurchaseDays: 95, phone: '(51) 99999-9999', city: 'Sapiranga', state: 'RS', status: 'inativo', email: 'alvaro@gotalimpa.com', tradeName: 'Gota Limpa', registrationStatus: 'ATIVA desde 30/03/2006', mainCnae: '2061-6/00 - Fabricação de sabões e detergentes sintéticos', address: 'Av. Industrial, 4500 - Bairro Industrial - CEP: 93800-000 - Sapiranga/RS', taxRegime: 'Simples Nacional', specialSituation: 'Nenhuma', specialSituationDate: '-', stateRegistration: '112/0034455' },
  { id: '2', name: 'Ana Lima', company: 'Natura Cosméticos', cnpj: '98.765.432/0001-10', curve: 'A', representative: 'Ana Lima', lastPurchaseDays: 15, phone: '(11) 98888-8888', city: 'São Paulo', state: 'SP', status: 'ativo', email: 'compras@natura.com.br', tradeName: 'Natura', registrationStatus: 'ATIVA desde 15/10/1990', mainCnae: '2063-3/00 - Fabricação de cosméticos, produtos de perfumaria e de higiene pessoal', address: 'Av. Alexandre Colares, 1188 - Parque Anhanguera - CEP: 05106-000 - São Paulo/SP', taxRegime: 'Lucro Real', specialSituation: 'Nenhuma', specialSituationDate: '-', stateRegistration: '108/9988776' },
  { id: '3', name: 'Carlos Mendes', company: 'XP Presentes', cnpj: '11.222.333/0001-44', curve: 'B', representative: 'Carlos Mendes', lastPurchaseDays: 30, phone: '(21) 97777-7777', city: 'Rio de Janeiro', state: 'RJ', status: 'ativo', email: 'carlos@xppresentes.com', tradeName: 'XP Presentes', registrationStatus: 'ATIVA desde 02/07/2015', mainCnae: '4789-0/01 - Comércio varejista de suvenires, bijuterias e artesanatos', address: 'Av. Rio Branco, 156 - Centro - CEP: 20040-003 - Rio de Janeiro/RJ', taxRegime: 'Simples Nacional', specialSituation: 'Nenhuma', specialSituationDate: '-', stateRegistration: '205/6677889' },
]

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

function formatPhoneBr(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

function formatDateBr(isoDateStr: string | null | undefined) {
  if (!isoDateStr || isoDateStr === '-' || isoDateStr === 'Nenhuma') return '-'
  const clean = isoDateStr.split('T')[0] // remove time if any
  const parts = clean.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return isoDateStr
}

function capitalizeString(str: string) {
  return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}

// Helper to construct full address
function buildAddress(d: any) {
  const parts = []
  if (d.descricao_tipo_de_logradouro || d.logradouro) {
    parts.push(`${d.descricao_tipo_de_logradouro || ''} ${d.logradouro || ''}`.trim())
  }
  if (d.numero) parts.push(d.numero)
  if (d.complemento) parts.push(d.complemento)
  let addr = parts.join(', ')
  if (d.bairro) addr += ` - ${d.bairro}`
  if (d.cep) {
    const formattedCep = d.cep.replace(/^(\d{5})(\d{3})/, '$1-$2')
    addr += ` - CEP: ${formattedCep}`
  }
  return addr
}

// ─── Contact Drawer Component ──────────────────────────────────
function ContactDrawer({ 
  contact, 
  onClose, 
  onUpdateContact 
}: { 
  contact: MockContact | null
  onClose: () => void
  onUpdateContact: (contact: MockContact) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'geral' | 'historico'>('geral')

  // Form states
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [curve, setCurve] = useState<'A' | 'B' | 'C' | 'D'>('C')
  const [representative, setRepresentative] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo')
  
  // Expanded fields
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [mainCnae, setMainCnae] = useState('')
  const [address, setAddress] = useState('')
  const [taxRegime, setTaxRegime] = useState<'MEI' | 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real'>('Simples Nacional')
  const [specialSituation, setSpecialSituation] = useState('')
  const [specialSituationDate, setSpecialSituationDate] = useState('')
  const [stateRegistration, setStateRegistration] = useState('')

  // History states
  const [activities, setActivities] = useState<Activity[]>([])
  const [newNote, setNewNote] = useState('')
  const [activityType, setActivityType] = useState<Activity['type']>('nota')

  useEffect(() => {
    if (contact) {
      setIsOpen(true)
      setName(contact.name)
      setCompany(contact.company)
      setTradeName(contact.tradeName ?? '')
      setCnpj(contact.cnpj)
      setCurve(contact.curve)
      setRepresentative(contact.representative)
      setPhone(contact.phone)
      setEmail(contact.email ?? '')
      setCity(contact.city)
      setState(contact.state)
      setStatus(contact.status)
      setRegistrationStatus(contact.registrationStatus ?? 'ATIVA')
      setMainCnae(contact.mainCnae ?? '')
      setAddress(contact.address ?? '')
      setTaxRegime(contact.taxRegime ?? 'Simples Nacional')
      setSpecialSituation(contact.specialSituation ?? 'Nenhuma')
      setSpecialSituationDate(contact.specialSituationDate ?? '-')
      setStateRegistration(contact.stateRegistration ?? '')

      setActivities([
        { id: '1', type: 'nota', content: 'Ficha cadastral criada no CRM Carton Pack.', timestamp: '10/07/2026 09:00' },
        { id: '2', type: 'whatsapp', content: 'WhatsApp enviado solicitando retorno sobre proposta de caixas acopladas.', timestamp: '14/07/2026 14:15' },
      ])
    } else {
      setIsOpen(false)
    }
  }, [contact])

  if (!contact) return null

  const handleSaveGeneral = () => {
    onUpdateContact({
      ...contact,
      name,
      company,
      tradeName,
      cnpj,
      curve,
      representative,
      phone,
      email,
      city,
      state,
      status,
      registrationStatus,
      mainCnae,
      address,
      taxRegime,
      specialSituation,
      specialSituationDate,
      stateRegistration
    })
  }

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const newAct: Activity = {
      id: String(Date.now()),
      type: activityType,
      content: newNote,
      timestamp: new Date().toLocaleString('pt-BR', { hour12: false }).substring(0, 16)
    }

    setActivities(prev => [newAct, ...prev])
    setNewNote('')
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'nota':     return <FileText size={12} />
      case 'whatsapp': return <MessageSquare size={12} className="text-emerald-400" />
      case 'ligacao':  return <Phone size={12} className="text-sky-400" />
      case 'email':    return <Mail size={12} className="text-amber-400" />
      case 'reuniao':  return <User size={12} className="text-purple-400" />
      default:         return <HelpCircle size={12} />
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
        />
      )}

      {/* Drawer Body */}
      <div className={`drawer-sheet ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-[var(--line)] flex justify-between items-start bg-[var(--card)]">
          <div>
            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
              style={{
                background: curve === 'A' ? 'rgba(180,217,50,0.12)' : curve === 'B' ? 'rgba(240,196,25,0.1)' : 'rgba(255,255,255,0.05)',
                color: curve === 'A' ? 'var(--lime)' : curve === 'B' ? 'var(--yellow)' : 'var(--gray)',
                border: `1px solid ${curve === 'A' ? 'rgba(180,217,50,0.25)' : curve === 'B' ? 'rgba(240,196,25,0.2)' : 'var(--line)'}`
              }}>
              Curva {curve}
            </span>
            <h2 className="font-display text-lg text-[var(--white)] mt-1.5">{company}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[var(--white)] p-1 rounded-md hover:bg-[var(--line)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="drawer-tabs">
          <button 
            className={`drawer-tab-btn ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
          >
            Ficha Geral
          </button>
          <button 
            className={`drawer-tab-btn ${activeTab === 'historico' ? 'active' : ''}`}
            onClick={() => setActiveTab('historico')}
          >
            Histórico
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* TAB 1: GERAL */}
          {activeTab === 'geral' && (
            <div className="flex flex-col gap-5 animate-fade-in pb-12">
              
              {/* Seção: Identificação */}
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] mb-3 border-b border-[var(--line)] pb-1">Identificação</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Razão Social / Empresa</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute text-gray-500" />
                        <input 
                          type="text" 
                          className="input" 
                          value={company} 
                          onChange={(e) => setCompany(e.target.value)}
                          onBlur={handleSaveGeneral}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">Nome Fantasia</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={tradeName} 
                        onChange={(e) => setTradeName(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Nome do Responsável</label>
                      <div className="relative">
                        <User size={14} className="absolute text-gray-500" />
                        <input 
                          type="text" 
                          className="input" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          onBlur={handleSaveGeneral}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">CNPJ</label>
                      <input 
                        type="text" 
                        className="input font-mono" 
                        value={cnpj} 
                        onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Dados Fiscais */}
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] mb-3 border-b border-[var(--line)] pb-1">Informações Fiscais</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Situação Cadastral</label>
                      <div className="relative">
                        <ShieldCheck size={14} className="absolute text-gray-500" />
                        <input 
                          type="text" 
                          className="input font-bold" 
                          style={{ color: registrationStatus.includes('ATIVA') ? 'var(--green)' : 'var(--white)' }}
                          value={registrationStatus} 
                          onChange={(e) => setRegistrationStatus(e.target.value)}
                          onBlur={handleSaveGeneral}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">Regime Tributário</label>
                      <div className="relative">
                        <Percent size={14} className="absolute text-gray-500" />
                        <select 
                          className="input" 
                          value={taxRegime} 
                          onChange={(e) => setTaxRegime(e.target.value as any)}
                          onBlur={handleSaveGeneral}
                        >
                          <option value="MEI">MEI</option>
                          <option value="Simples Nacional">Simples Nacional</option>
                          <option value="Lucro Presumido">Lucro Presumido</option>
                          <option value="Lucro Real">Lucro Real</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Inscrição Estadual</label>
                      <input 
                        type="text" 
                        className="input font-mono" 
                        placeholder="Insira a IE manualmente"
                        value={stateRegistration} 
                        onChange={(e) => setStateRegistration(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">Curva ABC</label>
                      <select 
                        className="input" 
                        value={curve} 
                        onChange={(e) => setCurve(e.target.value as any)}
                        onBlur={handleSaveGeneral}
                      >
                        <option value="A">Curva A</option>
                        <option value="B">Curva B</option>
                        <option value="C">Curva C</option>
                        <option value="D">Curva D</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="label">CNAE Principal</label>
                    <div className="relative">
                      <FileSpreadsheet size={14} className="absolute text-gray-500" />
                      <input 
                        type="text" 
                        className="input" 
                        value={mainCnae} 
                        onChange={(e) => setMainCnae(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Situação Especial</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={specialSituation} 
                        onChange={(e) => setSpecialSituation(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">Data Situação Especial</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={specialSituationDate} 
                        onChange={(e) => setSpecialSituationDate(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Endereço e Contato */}
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] mb-3 border-b border-[var(--line)] pb-1">Endereço e Contato</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Telefone (WhatsApp)</label>
                      <div className="relative">
                        <Phone size={14} className="absolute text-gray-500" />
                        <input 
                          type="text" 
                          className="input" 
                          value={phone} 
                          onChange={(e) => setPhone(formatPhoneBr(e.target.value))}
                          onBlur={handleSaveGeneral}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">E-mail</label>
                      <div className="relative">
                        <Mail size={14} className="absolute text-gray-500" />
                        <input 
                          type="email" 
                          className="input" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleSaveGeneral}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="label">Endereço Completo</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute text-gray-500" />
                      <input 
                        type="text" 
                        className="input text-xs" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="label">Cidade</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">UF</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        className="input uppercase text-center font-bold font-mono" 
                        value={state} 
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        onBlur={handleSaveGeneral}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="label">Representante</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={representative} 
                        onChange={(e) => setRepresentative(e.target.value)}
                        onBlur={handleSaveGeneral}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="label">Status Carteira</label>
                      <select 
                        className="input" 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as any)}
                        onBlur={handleSaveGeneral}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HISTÓRICO */}
          {activeTab === 'historico' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <form onSubmit={handleAddActivity} className="card p-4 border-[var(--line)] bg-[var(--card)] flex flex-col gap-3">
                <textarea
                  className="input min-h-[90px] py-2 resize-none"
                  placeholder="Escreva uma nova anotação ou registro..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-1">
                    {(['nota', 'whatsapp', 'ligacao', 'email', 'reuniao'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActivityType(type)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors uppercase ${
                          activityType === type
                            ? 'bg-neutral-800 text-[var(--lime)] border border-[rgba(180,217,50,0.2)]'
                            : 'text-[var(--gray)] hover:text-[var(--white)] bg-transparent'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1.5">
                    <Send size={11} />
                    <span>Lançar</span>
                  </button>
                </div>
              </form>

              {/* Timeline list */}
              <div className="relative pl-6 flex flex-col gap-6 border-l border-[var(--line)] ml-3 mt-2">
                {activities.map(act => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[var(--charcoal)] border border-[var(--line)] flex items-center justify-center text-[var(--gray)]">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="text-[10px] text-[var(--gray2)] font-mono">{act.timestamp}</div>
                    <div className="card p-3 border-[var(--line)] bg-[var(--card)] text-xs text-[var(--white)] mt-1 ml-1">
                      {act.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

// ─── New Contact Modal Component ───────────────────────────────
function NewContactModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: (data: Partial<MockContact>) => void
  onCancel: () => void 
}) {
  const [rawCnpj, setRawCnpj] = useState('')
  const [loadingCnpj, setLoadingCnpj] = useState(false)
  const [cnpjError, setCnpjError] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [curve, setCurve] = useState<'A' | 'B' | 'C' | 'D'>('C')
  const [representative] = useState('Ana Lima') // Default representative set in background
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  
  // Expanded properties states
  const [registrationStatus, setRegistrationStatus] = useState('ATIVA')
  const [mainCnae, setMainCnae] = useState('')
  const [address, setAddress] = useState('')
  const [taxRegime, setTaxRegime] = useState<'MEI' | 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real'>('Simples Nacional')
  const [specialSituation, setSpecialSituation] = useState('Nenhuma')
  const [specialSituationDate, setSpecialSituationDate] = useState('-')
  const [stateRegistration, setStateRegistration] = useState('')

  const handleFetchCnpj = async () => {
    const clean = rawCnpj.replace(/\D/g, '')
    if (clean.length !== 14) {
      setCnpjError('CNPJ inválido. Digite os 14 dígitos.')
      return
    }

    setLoadingCnpj(true)
    setCnpjError('')

    try {
      const res = await fetch(`https://open.cnpja.com/office/${clean}`)
      if (!res.ok) throw new Error('Não encontrado')
      const data = await res.json()

      // Populating standard and expanded fields from CNPJá API
      const compName = data.company?.name || ''
      setCompany(compName)
      setTradeName(data.alias || compName)
      
      const phoneObj = data.phones?.[0]
      const rawPhone = phoneObj ? `${phoneObj.area}${phoneObj.number}` : ''
      setPhone(formatPhoneBr(rawPhone))
      
      setEmail(data.emails?.[0]?.address || '')
      setCity(data.address?.city || '')
      setState(data.address?.state || '')
      setCnpj(formatCnpj(clean))
      
      // Auto-populate expanded API information
      const statusText = data.status?.text || 'Ativa'
      const statusDateFormatted = data.statusDate ? formatDateBr(data.statusDate) : ''
      setRegistrationStatus(statusDateFormatted ? `${statusText} desde ${statusDateFormatted}` : statusText)
      
      const mainCnaeId = data.mainActivity?.id
      const mainCnaeDesc = data.mainActivity?.text
      setMainCnae(mainCnaeId ? `${mainCnaeId} - ${mainCnaeDesc || ''}` : '')
      
      // Format address from CNPJá structure
      const addrParts = []
      const addr = data.address
      if (addr) {
        if (addr.street) {
          addrParts.push(addr.street)
        }
        if (addr.number) addrParts.push(addr.number)
        if (addr.district) addrParts.push(addr.district)
        if (addr.zip) {
          const formattedCep = addr.zip.replace(/^(\d{5})(\d{3})/, '$1-$2')
          addrParts.push(`CEP: ${formattedCep}`)
        }
        setAddress(addrParts.join(', '))
      } else {
        setAddress('')
      }
      
      // Determine tax regime dynamically from simples/simei optant flags
      if (data.company?.simei?.optant) {
        setTaxRegime('MEI')
      } else if (data.company?.simples?.optant) {
        setTaxRegime('Simples Nacional')
      } else {
        setTaxRegime('Lucro Presumido')
      }

      setSpecialSituation(data.specialSituation || 'Nenhuma')
      setSpecialSituationDate(data.specialSituationDate ? formatDateBr(data.specialSituationDate) : '-')
      
      // Retrieve state registration (IE) from registrations array matching address state or first active
      const ieObj = data.registrations?.find((r: any) => r.state === data.address?.state) || data.registrations?.find((r: any) => r.enabled) || data.registrations?.[0]
      setStateRegistration(ieObj ? ieObj.number : '')
      
      setName('') // Stay blank for manual physical person responsible name entry
    } catch (err) {
      setCnpjError('Erro ao buscar CNPJ. CNPJ inexistente ou API fora do ar.')
    } finally {
      setLoadingCnpj(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !name.trim()) return
    onConfirm({
      name,
      company,
      tradeName,
      cnpj,
      curve,
      representative,
      phone,
      email,
      city,
      state,
      registrationStatus,
      mainCnae,
      address,
      taxRegime,
      specialSituation,
      specialSituationDate,
      stateRegistration
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[var(--charcoal)] border border-[var(--line)] rounded-2xl p-6 w-full max-w-5xl shadow-2xl flex flex-col gap-4 animate-fade-up">
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display text-base text-[var(--white)] font-bold">Cadastrar Novo Cliente</h3>
            <p className="text-xs text-[var(--gray)] mt-0.5">Insira o CNPJ da empresa para realizar o preenchimento automático das fichas fiscais.</p>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-[var(--white)] p-1 rounded-md hover:bg-[var(--line)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* CNPJ Input Header */}
        <div className="flex flex-col gap-1.5 max-w-md">
          <label className="label">Buscar CNPJ</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="input font-mono flex-1" 
              placeholder="Ex: 00.000.000/0001-00"
              value={rawCnpj}
              onChange={(e) => setRawCnpj(formatCnpj(e.target.value))}
            />
            <button 
              type="button"
              disabled={loadingCnpj}
              onClick={handleFetchCnpj}
              className="btn btn-secondary py-2.5 px-4 text-xs font-bold uppercase tracking-wider"
            >
              {loadingCnpj ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {cnpjError && <span className="text-[10px] text-[var(--red)] font-semibold">{cnpjError}</span>}
        </div>

        {/* Vertical stacked layout with a grid for responsive widths */}
        <div className="flex flex-col gap-6 border-t border-[var(--line)] pt-4 max-h-[64vh] overflow-y-auto pr-2">
          
          {/* SEC 1: IDENTIFICAÇÃO */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] border-b border-[var(--line)] pb-1">Dados Cadastrais</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-4 flex flex-col gap-1.5">
                <label className="label">Razão Social / Empresa *</label>
                <input 
                  type="text" 
                  required
                  className="input font-bold" 
                  placeholder="Nome da Empresa"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Nome Fantasia</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Nome Fantasia"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Responsável (Pessoa Física) *</label>
                <input 
                  type="text" 
                  required
                  className="input font-bold border-dashed border-[var(--lime)]" 
                  placeholder="Nome do Contato Principal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">CNPJ</label>
                <input 
                  type="text" 
                  className="input font-mono" 
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Curva ABC</label>
                <select 
                  className="input" 
                  value={curve} 
                  onChange={(e) => setCurve(e.target.value as any)}
                >
                  <option value="A">Curva A</option>
                  <option value="B">Curva B</option>
                  <option value="C">Curva C</option>
                  <option value="D">Curva D</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEC 2: FISCAL */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] border-b border-[var(--line)] pb-1">Informações Fiscais</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Row 1: Situação Cadastral, Regime Tributário, Inscrição Estadual side-by-side */}
              <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Situação Cadastral</label>
                  <input 
                    type="text" 
                    className="input font-bold" 
                    placeholder="Ex: ATIVA"
                    style={{ color: registrationStatus.includes('ATIVA') ? 'var(--green)' : 'var(--white)' }}
                    value={registrationStatus}
                    onChange={(e) => setRegistrationStatus(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="label">Regime Tributário</label>
                  <select 
                    className="input" 
                    value={taxRegime} 
                    onChange={(e) => setTaxRegime(e.target.value as any)}
                  >
                    <option value="MEI">MEI</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="label">Inscrição Estadual</label>
                  <input 
                    type="text" 
                    className="input font-mono" 
                    placeholder="Preencher manualmente se houver"
                    value={stateRegistration}
                    onChange={(e) => setStateRegistration(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-4 flex flex-col gap-1.5">
                <label className="label">CNAE Principal</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="CNAE e Descrição"
                  value={mainCnae}
                  onChange={(e) => setMainCnae(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Situação Especial</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Nenhuma"
                  value={specialSituation}
                  onChange={(e) => setSpecialSituation(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Data Situação Especial</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="-"
                  value={specialSituationDate}
                  onChange={(e) => setSpecialSituationDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SEC 3: ENDEREÇO & CONTATO */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--lime)] border-b border-[var(--line)] pb-1">Endereço e Contato</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">Telefone</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneBr(e.target.value))}
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="label">E-mail</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-4 flex flex-col gap-1.5">
                <label className="label">Endereço de Correspondência</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="Rua, Número, Bairro - CEP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-3 flex flex-col gap-1.5">
                <label className="label">Cidade</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Sapiranga"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-1 flex flex-col gap-1.5">
                <label className="label">UF</label>
                <input 
                  type="text" 
                  maxLength={2}
                  className="input uppercase text-center font-bold font-mono" 
                  placeholder="RS"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-2 border-t border-[var(--line)] pt-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary py-2.5 px-4 text-xs font-bold uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#060606]"
          >
            Confirmar Cadastro
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main Contacts Component ───────────────────────────────────
export default function ContactsPage() {
  const [contacts, setContacts] = useState<MockContact[]>(MOCK_CONTACTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCurve, setSelectedCurve] = useState<string>('all')
  const [selectedRep, setSelectedRep] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showMapModal, setShowMapModal] = useState<boolean>(false)
  const [modalContact, setModalContact] = useState<MockContact | null>(null)

  // Drawer / New Contact Modal states
  const [selectedContact, setSelectedContact] = useState<MockContact | null>(null)
  const [showNewContactModal, setShowNewContactModal] = useState(false)

  // Filtering logic
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.cnpj.includes(searchTerm)
    
    const matchesCurve = selectedCurve === 'all' || contact.curve === selectedCurve
    const matchesRep = selectedRep === 'all' || contact.representative === selectedRep
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'inativo' && contact.lastPurchaseDays > 90) ||
      (selectedStatus === 'ativo' && contact.lastPurchaseDays <= 90)

    return matchesSearch && matchesCurve && matchesRep && matchesStatus
  })

  const representatives = Array.from(new Set(contacts.map(c => c.representative)))

  function openMap(e: React.MouseEvent, contact: MockContact) {
    e.stopPropagation() // Don't trigger row click drawer
    setModalContact(contact)
    setShowMapModal(true)
  }

  const handleUpdateContact = (updatedContact: MockContact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c))
    setSelectedContact(updatedContact)
  }

  const handleConfirmNewContact = (data: Partial<MockContact>) => {
    const newContact: MockContact = {
      id: `c-${Date.now()}`,
      name: data.name || '',
      company: data.company || '',
      cnpj: data.cnpj || '',
      curve: data.curve || 'C',
      representative: data.representative || 'Ana Lima',
      phone: data.phone || '',
      email: data.email || '',
      city: data.city || '',
      state: data.state || '',
      status: 'ativo',
      lastPurchaseDays: 0,
      
      // New fields mapping
      tradeName: data.tradeName || '',
      registrationStatus: data.registrationStatus || 'ATIVA',
      mainCnae: data.mainCnae || '',
      address: data.address || '',
      taxRegime: data.taxRegime || 'Simples Nacional',
      specialSituation: data.specialSituation || 'Nenhuma',
      specialSituationDate: data.specialSituationDate || '-',
      stateRegistration: data.stateRegistration || ''
    }

    setContacts(prev => [newContact, ...prev])
    setShowNewContactModal(false)
  }

  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl text-[var(--white)] font-bold tracking-tight">
          Carteira de Clientes
        </h1>

        <button onClick={() => setShowNewContactModal(true)} className="btn btn-primary btn-sm self-start md:self-auto">
          <Plus size={14} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="search-wrap">
          <Search size={14} className="text-[var(--gray2)]" />
          <input
            className="search-input w-full"
            placeholder="Buscar razão social, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Curva Filter */}
        <div>
          <select 
            className="input w-full"
            value={selectedCurve}
            onChange={(e) => setSelectedCurve(e.target.value)}
          >
            <option value="all">Todas as Curvas (ABC)</option>
            <option value="A">Curva A (Faturamento Alto)</option>
            <option value="B">Curva B (Faturamento Médio)</option>
            <option value="C">Curva C (Faturamento Baixo)</option>
            <option value="D">Curva D (Prospecção)</option>
          </select>
        </div>

        {/* Rep Filter */}
        <div>
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

        {/* Status Filter */}
        <div>
          <select 
            className="input w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="ativo">Clientes Ativos (&lt; 90 dias sem compra)</option>
            <option value="inativo">Inativos / Alerta (&gt; 90 dias sem compra)</option>
          </select>
        </div>
      </div>

      {/* List Container */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--charcoal)] font-mono text-[10px] text-[var(--gray)] uppercase tracking-wider">
                <th className="p-4 pl-6">Cliente / CNPJ</th>
                <th className="p-4">Curva</th>
                <th className="p-4">Representante</th>
                <th className="p-4">Última Compra</th>
                <th className="p-4 pr-6 text-right">Localização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredContacts.map(contact => {
                const isInactive = contact.lastPurchaseDays > 90
                return (
                  <tr 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className="hover:bg-[var(--charcoal)] transition-colors duration-150 cursor-pointer"
                  >
                    {/* Cliente Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[var(--line)] flex items-center justify-center text-[var(--white)]">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--white)] flex items-center gap-2">
                            {contact.company}
                            {isInactive && (
                              <span className="font-mono text-[9px] bg-[rgba(226,72,61,0.15)] text-[var(--red)] px-2 py-0.5 rounded-full border border-[rgba(226,72,61,0.25)] flex items-center gap-1">
                                <AlertCircle size={8} /> ALERTA INATIVO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--gray)] font-mono mt-0.5">{contact.cnpj}</div>
                        </div>
                      </div>
                    </td>

                    {/* Curva */}
                    <td className="p-4">
                      <span 
                        className="font-mono text-xs font-black px-2.5 py-1 rounded-md"
                        style={{
                          background: contact.curve === 'A' ? 'rgba(180,217,50,0.12)' : contact.curve === 'B' ? 'rgba(240,196,25,0.1)' : 'rgba(255,255,255,0.05)',
                          color: contact.curve === 'A' ? 'var(--lime)' : contact.curve === 'B' ? 'var(--yellow)' : 'var(--gray)',
                          border: `1px solid ${contact.curve === 'A' ? 'rgba(180,217,50,0.25)' : contact.curve === 'B' ? 'rgba(240,196,25,0.2)' : 'var(--line)'}`
                        }}
                      >
                        Curva {contact.curve}
                      </span>
                    </td>

                    {/* Representante */}
                    <td className="p-4 text-xs font-semibold text-[var(--white)]">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-[var(--gray)]" />
                        {contact.representative}
                      </div>
                    </td>

                    {/* Ultima compra */}
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[var(--white)] font-mono">{contact.lastPurchaseDays} dias</span>
                        <span className="text-[10px] text-[var(--gray2)] uppercase tracking-wider font-mono">sem comprar</span>
                      </div>
                    </td>

                    {/* Localizacao / Fachada */}
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={(e) => openMap(e, contact)}
                        className="btn btn-ghost btn-sm text-[var(--gray)] hover:text-white inline-flex items-center gap-1.5"
                      >
                        <MapPin size={12} />
                        <span>Ver Fachada</span>
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm text-[var(--gray2)] font-mono">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Details Drawer */}
      <ContactDrawer
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdateContact={handleUpdateContact}
      />

      {/* New Contact Modal with CNPJ Autopopulate */}
      {showNewContactModal && (
        <NewContactModal
          onConfirm={handleConfirmNewContact}
          onCancel={() => setShowNewContactModal(false)}
        />
      )}

      {/* Map / Facade Modal Mock */}
      {showMapModal && modalContact && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="card max-w-lg w-full overflow-hidden relative border-[var(--line)]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--charcoal)]">
              <div>
                <h3 className="font-display text-sm text-[var(--white)]">{modalContact.company}</h3>
                <p className="text-xs text-[var(--gray)] mt-0.5 font-mono">{modalContact.city} · {modalContact.state}</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-[var(--gray)] hover:text-white font-mono text-xs"
              >
                [ FECHAR ]
              </button>
            </div>

            {/* Facade photo mock using CSS design to resemble a mockup of Carton Pack premium style */}
            <div className="relative h-64 bg-[#141414] flex flex-col items-center justify-center p-6 border-b border-[var(--line)]">
              {/* Simulated Map View with Google Maps Pin */}
              <div className="absolute inset-0 opacity-10 bg-radial-gradient from-[var(--lime)] to-transparent pointer-events-none" />
              
              <div className="w-48 h-32 rounded-lg border-2 border-dashed border-[var(--line)] bg-[var(--black)] flex flex-col items-center justify-center text-center p-4 relative">
                <MapPin size={24} className="text-[var(--lime)] mb-1 animate-bounce" />
                <span className="text-xs font-bold text-[var(--white)]">Fachada da Empresa</span>
                <span className="text-[10px] text-[var(--gray)] font-mono mt-1">Geolocalizada automaticamente em {modalContact.city}</span>
              </div>
            </div>

            {/* Footer / Meta */}
            <div className="p-4 bg-[var(--charcoal)] flex justify-between items-center text-xs">
              <span className="text-[var(--gray)] font-mono">Assinado a: <b>{modalContact.representative}</b></span>
              <span className="text-[var(--gray)] font-mono">Curva: <b className="text-[var(--lime)]">{modalContact.curve}</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
