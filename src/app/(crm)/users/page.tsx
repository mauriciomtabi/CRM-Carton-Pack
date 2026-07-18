'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  User,
  X,
  Shield,
  Clock
} from 'lucide-react'

interface TeamUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'representante' | 'vendedor' | 'financeiro'
  status: 'ativo' | 'inativo'
  phone: string
  createdAt: string
  username?: string
  tempPassword?: string
  password?: string
  isFirstAccess?: boolean
  isEmailConfirmed?: boolean
}

const DEFAULT_USERS: TeamUser[] = [
  { id: '1', name: 'Ana Lima', email: 'ana.lima@cartonpack.com', role: 'representante', status: 'ativo', phone: '(11) 98888-8888', createdAt: '10/05/2026', isFirstAccess: false, isEmailConfirmed: true, password: '123' },
  { id: '2', name: 'Ermínio Sales', email: 'erminio@cartonpack.com', role: 'representante', status: 'ativo', phone: '(51) 99999-9999', createdAt: '12/05/2026', isFirstAccess: false, isEmailConfirmed: true, password: '123' },
  { id: '3', name: 'Carlos Mendes', email: 'carlos.mendes@cartonpack.com', role: 'representante', status: 'ativo', phone: '(21) 97777-7777', createdAt: '15/05/2026', isFirstAccess: false, isEmailConfirmed: true, password: '123' },
  { id: '4', name: 'Julio Cesar', email: 'julio.admin@cartonpack.com', role: 'admin', status: 'ativo', phone: '(51) 98888-7777', createdAt: '01/05/2026', isFirstAccess: false, isEmailConfirmed: true, password: '123' },
  { id: '5', name: 'Mariana Costa', email: 'mariana.fin@cartonpack.com', role: 'financeiro', status: 'ativo', phone: '(51) 96666-5555', createdAt: '20/05/2026', isFirstAccess: false, isEmailConfirmed: true, password: '123' },
]

function formatPhoneBr(v: string) {
  const clean = v.replace(/\D/g, '')
  if (clean.length <= 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return clean.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

export default function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>(DEFAULT_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamUser['role']>('vendedor')
  const [status, setStatus] = useState<TeamUser['status']>('ativo')
  const [phone, setPhone] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [username, setUsername] = useState('')

  // Success screen after creation
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    name: string
    usernameOrEmail: string
    tempPassword: string
    type: 'cartonpack' | 'externo'
  } | null>(null)

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crm_users')
      if (saved) {
        try {
          setUsers(JSON.parse(saved) as TeamUser[])
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  // Persist to localStorage
  const saveUsers = (newUsers: TeamUser[]) => {
    setUsers(newUsers)
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_users', JSON.stringify(newUsers))
    }
  }

  const deriveUsername = (n: string) => {
    const parts = n.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`
    } else if (parts.length === 1) {
      return parts[0]
    }
    return ''
  }

  const generateTempPassword = () => {
    return 'CP-' + Math.floor(1000 + Math.random() * 9000)
  }

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setRole('vendedor')
    setStatus('ativo')
    setPhone('')
    setTempPassword(generateTempPassword())
    setUsername('')
    setShowModal(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (user: TeamUser) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setStatus(user.status)
    setPhone(user.phone)
    setTempPassword(user.tempPassword || '')
    setUsername(user.username || '')
    setShowModal(true)
  }

  // Submit modal form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || (role !== 'representante' && !email.trim())) return

    const isCarton = role !== 'representante' && email.toLowerCase().endsWith('@cartonpack.com')
    const finalUsername = isCarton ? undefined : (username || deriveUsername(name))
    const finalEmail = role === 'representante' ? `${finalUsername || deriveUsername(name)}@representante.local` : email

    if (editingUser) {
      // Edit mode
      const updated = users.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              name, 
              email: finalEmail, 
              role, 
              status, 
              phone, 
              username: finalUsername,
              tempPassword: tempPassword || u.tempPassword
            }
          : u
      )
      saveUsers(updated)
      setShowModal(false)
    } else {
      // Create mode
      const finalTempPassword = tempPassword || generateTempPassword()

      const newUser: TeamUser = {
        id: `u-${Date.now()}`,
        name,
        email: finalEmail,
        role,
        status,
        phone: formatPhoneBr(phone),
        createdAt: new Date().toLocaleDateString('pt-BR'),
        isFirstAccess: true,
        isEmailConfirmed: isCarton ? false : true,
        tempPassword: finalTempPassword,
        username: finalUsername
      }
      
      saveUsers([newUser, ...users])
      
      // Save credentials for the Copy Screen
      setCreatedUserCredentials({
        name,
        usernameOrEmail: isCarton ? finalEmail : (finalUsername || finalEmail),
        tempPassword: finalTempPassword,
        type: isCarton ? 'cartonpack' : 'externo'
      })
      
      setShowModal(false)
      setShowCopyModal(true)
    }
  }

  // Delete user
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const updated = users.filter(u => u.id !== id)
      saveUsers(updated)
    }
  }

  // Toggle user status quickly
  const handleToggleStatus = (user: TeamUser) => {
    const newStatus: TeamUser['status'] = user.status === 'ativo' ? 'inativo' : 'ativo'
    const updated = users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    )
    saveUsers(updated)
  }

  // Filter users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm)
      
    const matchesRole = selectedRole === 'all' || u.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // Role tag styling helpers
  const getRoleDetails = (r: TeamUser['role']) => {
    switch (r) {
      case 'admin':
        return { label: 'Administrador', bg: 'rgba(168,85,247,0.12)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' }
      case 'representante':
        return { label: 'Representante', bg: 'rgba(180,217,50,0.12)', color: 'var(--lime)', border: 'rgba(180,217,50,0.25)' }
      case 'vendedor':
        return { label: 'Vendedor', bg: 'rgba(240,196,25,0.1)', color: 'var(--yellow)', border: 'rgba(240,196,25,0.2)' }
      case 'financeiro':
        return { label: 'Financeiro', bg: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: 'rgba(6,182,212,0.25)' }
    }
  }

  // Initial Avatar generator helper
  const getInitials = (n: string) => {
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[var(--white)] font-bold tracking-tight">
            Gestão de Equipe e Usuários
          </h1>
          <p className="text-xs text-[var(--gray)] mt-1 font-mono">
            Gerencie os membros da equipe de vendas, administradores e representantes comerciais autorizados.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm flex items-center gap-1.5 shrink-0 self-start md:self-auto">
          <Plus size={14} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-[var(--gray)]" />
          <input
            type="text"
            className="input w-full pl-9"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Select Filter */}
        <div>
          <select 
            className="input w-full"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">Todas as Funções</option>
            <option value="admin">Administrador</option>
            <option value="representante">Representante</option>
            <option value="vendedor">Vendedor</option>
            <option value="financeiro">Financeiro</option>
          </select>
        </div>

        {/* Status Select Filter */}
        <div>
          <select 
            className="input w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--charcoal)] font-mono text-[10px] text-[var(--gray)] uppercase tracking-wider">
                <th className="p-4 pl-6">Membro / Contato</th>
                <th className="p-4">Função</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Cadastrado em</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredUsers.map(user => {
                const roleInfo = getRoleDetails(user.role)
                return (
                  <tr key={user.id} className="hover:bg-[var(--charcoal)] transition-colors duration-150">
                    
                    {/* User Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--white)] font-bold text-xs"
                          style={{
                            background: user.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'var(--line)',
                            border: `1px solid ${user.role === 'admin' ? 'rgba(168,85,247,0.3)' : 'transparent'}`
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--white)]">{user.name}</div>
                          <div className="text-xs text-[var(--gray)] font-mono mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Tag */}
                    <td className="p-4">
                      <span
                        className="font-mono text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider"
                        style={{
                          background: roleInfo.bg,
                          color: roleInfo.color,
                          border: `1px solid ${roleInfo.border}`
                        }}
                      >
                        {roleInfo.label}
                      </span>
                    </td>

                    {/* Status Toggle Dot */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        title={`Clique para deixar o usuário ${user.status === 'ativo' ? 'inativo' : 'ativo'}`}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all ${
                          user.status === 'ativo'
                            ? 'bg-[rgba(34,197,94,0.15)] text-[var(--green)] border-[rgba(34,197,94,0.25)] hover:bg-[rgba(34,197,94,0.25)]'
                            : 'bg-[rgba(239,68,68,0.15)] text-[var(--red)] border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.25)]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ativo' ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`}></span>
                        <span>{user.status === 'ativo' ? 'ATIVO' : 'INATIVO'}</span>
                      </button>
                    </td>

                    {/* Telefone */}
                    <td className="p-4 font-mono text-xs text-[var(--white)]">
                      {user.phone || '-'}
                    </td>

                    {/* Created At */}
                    <td className="p-4 text-xs text-[var(--gray)] font-mono">
                      {user.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Editar Usuário"
                          className="btn btn-secondary p-2 hover:text-[var(--white)] rounded-lg transition-colors border-none"
                        >
                          <Edit2 size={13} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'ativo' ? 'Suspender Acesso' : 'Reativar Acesso'}
                          className={`btn p-2 rounded-lg transition-colors border-none bg-transparent ${
                            user.status === 'ativo' ? 'text-amber-500 hover:text-amber-300' : 'text-emerald-500 hover:text-emerald-300'
                          }`}
                        >
                          {user.status === 'ativo' ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>

                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Excluir Usuário"
                          className="btn btn-secondary p-2 hover:text-[var(--red)] rounded-lg transition-colors border-none"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-[var(--gray2)] font-mono">
                    Nenhum usuário cadastrado ou encontrado com estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit User Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[var(--charcoal)] border border-[var(--line)] rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 animate-fade-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-display text-base text-[var(--white)] font-bold">
                  {editingUser ? 'Editar Usuário da Equipe' : 'Cadastrar Novo Usuário'}
                </h3>
                <p className="text-xs text-[var(--gray)] mt-0.5 font-mono">
                  Defina os dados e permissões do membro de forma instantânea.
                </p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[var(--white)] p-1 rounded-md hover:bg-[var(--line)] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">Nome Completo *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-3 text-[var(--gray)]" />
                  <input
                    type="text"
                    required
                    className="input w-full pl-9"
                    placeholder="Ex: Roberto Carlos"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingUser) {
                        setUsername(deriveUsername(e.target.value))
                      }
                    }}
                  />
                </div>
              </div>

              {/* Role (User Function) - Moved to top as requested */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--lime)] uppercase font-mono tracking-wider">Função do Usuário *</label>
                <select 
                  className="input w-full font-bold"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="representante">Representante</option>
                  <option value="admin">Administrador</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>

              {/* Email (Hidden if Representative) */}
              {role !== 'representante' && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">E-mail Comercial *</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-3 text-[var(--gray)]" />
                    <input
                      type="email"
                      required
                      className="input w-full pl-9 font-mono text-xs"
                      placeholder="Ex: roberto.carlos@cartonpack.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Conditional Username & Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                {role === 'representante' || !email.toLowerCase().endsWith('@cartonpack.com') ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-[var(--lime)] uppercase font-mono tracking-wider">Nome de Usuário *</label>
                    <input
                      type="text"
                      required
                      className="input w-full font-mono text-xs font-bold"
                      placeholder="usuario.sobrenome"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">Nome de Usuário</label>
                    <div className="input w-full text-xs text-[var(--gray2)] font-mono flex items-center bg-[var(--charcoal)] opacity-50 select-none cursor-not-allowed">
                      (Usará o E-mail)
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--lime)] uppercase font-mono tracking-wider">Senha Temporária *</label>
                  <input
                    type="text"
                    required
                    className="input w-full font-mono text-xs font-bold text-[var(--lime)] bg-[var(--card)]"
                    placeholder="CP-1234"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-3 text-[var(--gray)]" />
                  <input
                    type="text"
                    className="input w-full pl-9 font-mono text-xs"
                    placeholder="(11) 98888-8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--gray2)] uppercase font-mono tracking-wider">Status Cadastral</label>
                <div className="flex gap-4 p-3 border border-[var(--line)] rounded-xl bg-[var(--card)]">
                  <label className="flex items-center gap-2 text-xs text-[var(--white)] cursor-pointer select-none">
                    <input
                      type="radio"
                      name="modal-status"
                      checked={status === 'ativo'}
                      onChange={() => setStatus('ativo')}
                      className="accent-[var(--lime)]"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] inline-block"></span>
                      Ativo (Acesso autorizado)
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs text-[var(--white)] cursor-pointer select-none">
                    <input
                      type="radio"
                      name="modal-status"
                      checked={status === 'inativo'}
                      onChange={() => setStatus('inativo')}
                      className="accent-[var(--lime)]"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] inline-block"></span>
                      Inativo (Suspenso)
                    </span>
                  </label>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider text-[#060606]"
              >
                Confirmar e Salvar
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Copy Credentials Success Modal */}
      {showCopyModal && createdUserCredentials && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[var(--charcoal)] border border-[var(--lime)] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-fade-up">
            <div className="flex justify-between items-start border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="font-display text-base text-[var(--lime)] font-bold">Usuário Cadastrado!</h3>
                <p className="text-xs text-[var(--gray)] mt-0.5 font-mono">Copie a mensagem para compartilhar com o membro da equipe.</p>
              </div>
              <button type="button" onClick={() => setShowCopyModal(false)} className="text-gray-400 hover:text-[var(--white)] p-1">
                <X size={18} />
              </button>
            </div>
            
            <div className="bg-black/40 border border-[var(--line)] rounded-xl p-4 font-mono text-[11px] text-[var(--white)] whitespace-pre-wrap leading-relaxed select-all">
{`Olá, ${createdUserCredentials.name}! Seu acesso ao CRM Carton Pack está liberado.

Link de Acesso: https://crm.cartonpack.com
${createdUserCredentials.type === 'cartonpack' ? `Login (E-mail): ${createdUserCredentials.usernameOrEmail}` : `Usuário: ${createdUserCredentials.usernameOrEmail}`}
Senha Temporária: ${createdUserCredentials.tempPassword}

${createdUserCredentials.type === 'cartonpack' 
  ? 'Obs: No primeiro acesso você deverá alterar a senha temporária e confirmar o link de ativação enviado para o seu e-mail.' 
  : 'Obs: No primeiro acesso você deverá alterar a senha temporária para ativar sua conta.'}`}
            </div>

            <button
              type="button"
              onClick={() => {
                const text = `Olá, ${createdUserCredentials.name}! Seu acesso ao CRM Carton Pack está liberado.\n\nLink de Acesso: https://crm.cartonpack.com\n${createdUserCredentials.type === 'cartonpack' ? `Login (E-mail): ${createdUserCredentials.usernameOrEmail}` : `Usuário: ${createdUserCredentials.usernameOrEmail}`}\nSenha Temporária: ${createdUserCredentials.tempPassword}\n\n${createdUserCredentials.type === 'cartonpack' ? 'Obs: No primeiro acesso você deverá alterar a senha temporária e confirmar o link de ativação enviado para o seu e-mail.' : 'Obs: No primeiro acesso você deverá alterar a senha temporária para ativar sua conta.'}`
                navigator.clipboard.writeText(text)
                alert('Mensagem de acesso copiada com sucesso!')
              }}
              className="btn btn-primary py-2.5 text-xs font-bold uppercase tracking-wider text-black w-full"
            >
              Copiar Mensagem de Acesso
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
