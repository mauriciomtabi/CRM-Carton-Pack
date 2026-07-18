'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Deal, DealStage, STAGE_CONFIG } from '@/types'
import { formatCurrency, daysSince, getInitials } from '@/lib/utils'
import { Plus, Clock } from 'lucide-react'
import { DealDrawer } from './DealDrawer'

// ─── Mock data ────────────────────────────────────────────────
const MOCK_DEALS: Deal[] = [
  { id: '1', title: 'Caixa Premium Natura',   contact_id: 'c1', stage: 'leads',      position: 0, estimated_value: undefined, stage_entered_at: new Date(Date.now()-2*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c1', name:'Ana Lima',      company:'Natura',        created_at:'', updated_at:'' } },
  { id: '2', title: 'Embalagem XP Presentes', contact_id: 'c2', stage: 'prospect',   position: 0, estimated_value: undefined, stage_entered_at: new Date(Date.now()-5*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c2', name:'Carlos Mendes', company:'XP Presentes',  created_at:'', updated_at:'' } },
  { id: '3', title: 'Display Farmácia São J.', contact_id: 'c3', stage: 'prospect',  position: 1, estimated_value: undefined, stage_entered_at: new Date(Date.now()-10*86400000).toISOString(),created_at: '', updated_at: '', contact: { id:'c3', name:'Juliana Paz',   company:'Farmácia São J',created_at:'', updated_at:'' } },
  { id: '4', title: 'Kit Cosméticos Avon',    contact_id: 'c4', stage: 'dinamica',   position: 0, estimated_value: undefined, stage_entered_at: new Date(Date.now()-3*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c4', name:'Roberto Alves', company:'Avon',          created_at:'', updated_at:'' } },
  { id: '5', title: 'Caixa Vinho Gourmet',    contact_id: 'c5', stage: 'potencial',  position: 0, estimated_value: undefined, stage_entered_at: new Date(Date.now()-7*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c5', name:'Marina Costa',  company:'Vinhos do Sul', created_at:'', updated_at:'' } },
  { id: '6', title: 'Bandeja Padaria Central',contact_id: 'c6', stage: 'visita',     position: 0, estimated_value: undefined, stage_entered_at: new Date(Date.now()-1*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c6', name:'Paulo Lima',    company:'Padaria Central',created_at:'',updated_at:'' } },
  { id: '7', title: 'Embalagem Cosméticos M.',contact_id: 'c7', stage: 'briefing',   position: 0, estimated_value: 32000,     stage_entered_at: new Date(Date.now()-4*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c7', name:'Fernanda R.',   company:'Cosmética M.',  created_at:'', updated_at:'' } },
  { id: '8', title: 'Caixa Presente Boticário',contact_id:'c8', stage: 'aprovacao',  position: 0, estimated_value: 48000,     stage_entered_at: new Date(Date.now()-2*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c8', name:'Gustavo N.',    company:'O Boticário',   created_at:'', updated_at:'' } },
  { id: '9', title: 'Kit Natal Lojas Renner',  contact_id:'c9', stage: 'fechamento', position: 0, final_value: 87500,         stage_entered_at: new Date(Date.now()-1*86400000).toISOString(), created_at: '', updated_at: '', contact: { id:'c9', name:'Renner Compras', company:'Lojas Renner',  created_at:'', updated_at:'' } },
]

// ─── Deal Card ────────────────────────────────────────────────
function DealCard({ deal, overlay = false, onCardClick }: { deal: Deal; overlay?: boolean; onCardClick?: (deal: Deal) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })
  const cfg = STAGE_CONFIG[deal.stage]
  const days = daysSince(deal.stage_entered_at)
  const isStale = days >= 5
  const value = deal.final_value ?? deal.estimated_value

  const style = {
    ...(overlay ? {} : {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
    }),
    '--card-color': cfg.color,
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick?.(deal)}
      className="deal-card animate-fade-in cursor-pointer"
    >
      {/* Title */}
      <div className="deal-title">
        {deal.title}
      </div>

      {/* Contact */}
      {deal.contact && (
        <div className="deal-contact">
          <div className="avatar" style={{ width: '22px', height: '22px', fontSize: '9px' }}>
            {getInitials(deal.contact.name)}
          </div>
          <div>
            <div className="deal-contact-name">
              {deal.contact.name}
            </div>
            {deal.contact.company && (
              <div className="deal-contact-company">
                {deal.contact.company}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="deal-footer">
        {/* Value */}
        {value && cfg.showValue ? (
          <span className="deal-value">
            {formatCurrency(value)}
          </span>
        ) : <span />}

        {/* Time indicator */}
        <div className={`deal-time ${isStale ? 'danger' : 'ok'}`}>
          <Clock size={10} />
          <span>{days}d</span>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Column ─────────────────────────────────────────────
function KanbanColumn({ stage, deals, onCardClick }: { stage: DealStage; deals: Deal[]; onCardClick: (deal: Deal) => void }) {
  const cfg = STAGE_CONFIG[stage]
  const { setNodeRef } = useDroppable({ id: stage })
  const totalValue = deals.reduce((s, d) => s + (d.final_value ?? d.estimated_value ?? 0), 0)

  const style = {
    '--col-color': cfg.color,
  } as React.CSSProperties

  return (
    <div className="kanban-col" style={style}>
      <div className="kanban-col-header">
        <span className="kanban-col-icon">
          <cfg.icon size={14} />
        </span>
        <div className="kanban-col-info">
          <div className="kanban-col-title">
            {cfg.label}
          </div>
          {cfg.showValue && totalValue > 0 && (
            <div className="kanban-col-value">
              {formatCurrency(totalValue)}
            </div>
          )}
        </div>
        <div className="kanban-col-count" style={{ color: cfg.color, background: cfg.color + '15' }}>
          {deals.length}
        </div>
      </div>

      <div className="kanban-cards" ref={setNodeRef}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} onCardClick={onCardClick} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="kanban-empty">
            Nenhum negócio aqui
          </div>
        )}

        {/* Add button */}
        {(stage === 'leads' || stage === 'prospect') && (
          <button className="kanban-add-btn">
            <Plus size={14} />
            <span>Adicionar</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────
export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const stages = Object.keys(STAGE_CONFIG) as DealStage[]
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage).sort((a, b) => a.position - b.position)
    return acc
  }, {} as Record<DealStage, Deal[]>)

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const draggedDeal = deals.find(d => d.id === active.id)
    if (!draggedDeal) return

    // Check if dropped on a column
    const newStage = stages.includes(over.id as DealStage)
      ? (over.id as DealStage)
      : deals.find(d => d.id === over.id)?.stage

    if (!newStage || newStage === draggedDeal.stage) return

    setDeals(prev => prev.map(d =>
      d.id === draggedDeal.id
        ? { ...d, stage: newStage, stage_entered_at: new Date().toISOString() }
        : d
    ))
  }

  function handleUpdateDeal(updatedDeal: Deal) {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d))
    setSelectedDeal(updatedDeal)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="pipeline-wrap">
        <div className="kanban-board">
          {stages.map(stage => (
            <KanbanColumn 
              key={stage} 
              stage={stage} 
              deals={dealsByStage[stage]} 
              onCardClick={setSelectedDeal}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} overlay />}
      </DragOverlay>

      <DealDrawer
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdateDeal={handleUpdateDeal}
      />
    </DndContext>
  )
}
