export type UserRole = 'admin' | 'vendedor' | 'representante'

export type DealStage =
  | 'leads'
  | 'prospect'
  | 'dinamica'
  | 'potencial'
  | 'visita'
  | 'briefing'
  | 'aprovacao'
  | 'fechamento'
  | 'perdido'
  | 'pos_venda'

export type ActivityType =
  | 'email'
  | 'whatsapp'
  | 'ligacao'
  | 'visita'
  | 'follow_up'
  | 'nota'
  | 'stage_change'
  | 'arquivo'

export type ApprovalStep = 'amostra_branca' | 'prova_cor' | 'mockup'
export type ApprovalStatus = 'aguardando' | 'enviado' | 'aprovado' | 'reprovado'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  phone?: string
  active: boolean
  created_at: string
}

export interface Contact {
  id: string
  name: string
  company?: string
  role?: string
  email?: string
  phone?: string
  whatsapp?: string
  city?: string
  state?: string
  source?: string
  notes?: string
  assigned_to?: string
  assigned_profile?: Profile
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  contact_id: string
  contact?: Contact
  stage: DealStage
  assigned_to?: string
  assigned_profile?: Profile
  estimated_value?: number
  final_value?: number
  lost_reason?: string
  lost_notes?: string
  stage_entered_at: string
  expected_close_date?: string
  closed_at?: string
  position: number
  created_at: string
  updated_at: string
}

export interface DealActivity {
  id: string
  deal_id: string
  type: ActivityType
  title?: string
  description?: string
  performed_by?: string
  performed_profile?: Profile
  performed_at: string
  metadata?: Record<string, unknown>
}

export interface FollowUp {
  id: string
  deal_id: string
  sequence_number: number
  type: 'email' | 'whatsapp' | 'ligacao'
  scheduled_at: string
  completed_at?: string
  status: 'pendente' | 'enviado' | 'respondido' | 'ignorado'
  notes?: string
  assigned_to?: string
}

export interface Briefing {
  id: string
  deal_id: string
  packaging_type?: string
  dimensions_l?: number
  dimensions_a?: number
  dimensions_p?: number
  grammage?: string
  paper_type?: string
  quantity?: number
  deadline_days?: number
  finishings?: string[]
  reference_notes?: string
  reference_files?: string[]
  cost_paper?: number
  cost_printing?: number
  cost_finishing?: number
  cost_cutting?: number
  cost_other?: number
  cost_total?: number
  margin_percent?: number
  sale_price?: number
  status: 'rascunho' | 'aguardando_custo' | 'orcamento_enviado'
  created_at: string
  updated_at: string
}

export interface Approval {
  id: string
  deal_id: string
  step: ApprovalStep
  status: ApprovalStatus
  file_urls?: string[]
  sent_at?: string
  approved_at?: string
  notes?: string
}

export interface KanbanColumn {
  id: DealStage
  label: string
  color: string
  icon: string
  deals: Deal[]
  showValue: boolean
}

export const STAGE_CONFIG: Record<DealStage, { label: string; color: string; icon: string; showValue: boolean }> = {
  leads:      { label: 'Leads / Banco',         color: '#64748b', icon: '🎯', showValue: false },
  prospect:   { label: 'Prospect',               color: '#3b82f6', icon: '📡', showValue: false },
  dinamica:   { label: 'Dinâmica',               color: '#8b5cf6', icon: '🔄', showValue: false },
  potencial:  { label: 'Potencial / Negociação', color: '#f59e0b', icon: '💼', showValue: false },
  visita:     { label: 'Visita',                 color: '#06b6d4', icon: '🚗', showValue: false },
  briefing:   { label: 'Briefing / Orçamento',   color: '#f97316', icon: '📄', showValue: true  },
  aprovacao:  { label: 'Aprovação',              color: '#a855f7', icon: '✅', showValue: true  },
  fechamento: { label: 'Fechamento',             color: '#22c55e', icon: '🏆', showValue: true  },
  perdido:    { label: 'Perdidos',               color: '#ef4444', icon: '❌', showValue: true  },
  pos_venda:  { label: 'Pós-Vendas',             color: '#14b8a6', icon: '🤝', showValue: true  },
}

export const FOLLOW_UP_LOST_REASONS = [
  'Preço',
  'Prazo',
  'Concorrência',
  'Sem retorno',
  'Produto não adequado',
  'Outro',
]

export const CONTACT_SOURCES = [
  'Indicação',
  'Google',
  'Instagram',
  'Feiras e eventos',
  'Prospecção ativa',
  'WhatsApp',
  'Outro',
]

export const PACKAGING_TYPES = [
  'Caixa dobra cola',
  'Caixinha',
  'Display',
  'Bandeja',
  'Envelope',
  'Outro',
]

export const FINISHINGS = [
  'Verniz UV',
  'Verniz aquoso',
  'Laminação fosca',
  'Laminação brilho',
  'Hot stamping dourado',
  'Hot stamping prateado',
  'Relevo seco',
  'Janela com PET',
  'Corte especial',
]
