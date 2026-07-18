'use client'

import { useState } from 'react'
import { Search, Filter, Phone, User, Building2, AlertCircle, Sparkles, MapPin, Eye, Plus } from 'lucide-react'
import { whatsappLink } from '@/lib/utils'

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
}

const MOCK_CONTACTS: MockContact[] = [
  { id: '1', name: 'Alvaro Ferreira', company: 'Gota Limpa Indústria', cnpj: '12.345.678/0001-90', curve: 'A', representative: 'Ermínio', lastPurchaseDays: 95, phone: '51999999999', city: 'Sapiranga', state: 'RS', status: 'inativo' },
  { id: '2', name: 'Ana Lima', company: 'Natura Cosméticos', cnpj: '98.765.432/0001-10', curve: 'A', representative: 'Ana Lima', lastPurchaseDays: 15, phone: '11988888888', city: 'São Paulo', state: 'SP', status: 'ativo' },
  { id: '3', name: 'Carlos Mendes', company: 'XP Presentes', cnpj: '11.222.333/0001-44', curve: 'B', representative: 'Carlos Mendes', lastPurchaseDays: 30, phone: '21977777777', city: 'Rio de Janeiro', state: 'RJ', status: 'ativo' },
  { id: '4', name: 'Fernanda Ramos', company: 'Cosmética Mulher', cnpj: '55.666.777/0001-88', curve: 'C', representative: 'Fernanda R.', lastPurchaseDays: 120, phone: '31966666666', city: 'Belo Horizonte', state: 'MG', status: 'inativo' },
  { id: '5', name: 'Gustavo Nogueira', company: 'O Boticário', cnpj: '44.555.666/0001-22', curve: 'A', representative: 'Gustavo N.', lastPurchaseDays: 45, phone: '41955555555', city: 'Curitiba', state: 'PR', status: 'ativo' },
  { id: '6', name: 'Comercial Renner', company: 'Lojas Renner S.A.', cnpj: '77.888.999/0001-55', curve: 'A', representative: 'Renner Compras', lastPurchaseDays: 5, phone: '51944444444', city: 'Porto Alegre', state: 'RS', status: 'ativo' },
  { id: '7', name: 'Roberto Alves', company: 'Avon Produtos', cnpj: '33.444.555/0001-11', curve: 'B', representative: 'Roberto Alves', lastPurchaseDays: 60, phone: '11933333333', city: 'Cabreúva', state: 'SP', status: 'ativo' },
  { id: '8', name: 'Marina Costa', company: 'Vinhos do Sul Ltda', cnpj: '22.333.444/0001-00', curve: 'C', representative: 'Marina Costa', lastPurchaseDays: 10, phone: '54922222222', city: 'Bento Gonçalves', state: 'RS', status: 'ativo' },
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState<MockContact[]>(MOCK_CONTACTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCurve, setSelectedCurve] = useState<string>('all')
  const [selectedRep, setSelectedRep] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showMapModal, setShowMapModal] = useState<boolean>(false)
  const [modalContact, setModalContact] = useState<MockContact | null>(null)

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

  function openMap(contact: MockContact) {
    setModalContact(contact)
    setShowMapModal(true)
  }

  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl text-[var(--white)] font-bold tracking-tight">
          Carteira de Clientes
        </h1>

        <button className="btn btn-primary self-start md:self-auto">
          <Plus size={14} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <th className="p-4">Localização</th>
                <th className="p-4 pr-6 text-right">Interações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredContacts.map(contact => {
                const isInactive = contact.lastPurchaseDays > 90
                return (
                  <tr key={contact.id} className="hover:bg-[var(--charcoal)] transition-colors duration-150">
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
                    <td className="p-4">
                      <button 
                        onClick={() => openMap(contact)}
                        className="btn btn-ghost btn-sm text-[var(--gray)] hover:text-white flex items-center gap-1.5"
                      >
                        <MapPin size={12} />
                        <span>Ver Fachada</span>
                      </button>
                    </td>

                    {/* Interacoes */}
                    <td className="p-4 pr-6 text-right">
                      <a 
                        href={whatsappLink(contact.phone, `Olá ${contact.name}, tudo bem? Falo da Carton Pack comercial...`)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 hover:border-[var(--lime)] hover:text-[var(--lime)]"
                      >
                        <Phone size={11} />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                )
              })}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-[var(--gray2)] font-mono">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <span className="text-[10px] text-[var(--gray)] font-mono mt-1">Geolocalizada automaticamente em Sapiranga</span>
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
