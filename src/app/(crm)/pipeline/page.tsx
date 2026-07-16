import type { Metadata } from 'next'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'
import { Plus, Filter, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Pipeline — Carton Pack CRM' }

export default function PipelinePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Pipeline de Vendas
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="Buscar negócio..."
              style={{ paddingLeft: '34px', width: '220px', height: '36px', fontSize: '13px' }}
            />
          </div>
          <button className="btn btn-secondary btn-sm">
            <Filter size={14} />
            Filtros
          </button>
          <button className="btn btn-primary btn-sm">
            <Plus size={14} />
            Novo Negócio
          </button>
        </div>
      </div>

      {/* Board */}
      <PipelineBoard />
    </div>
  )
}
