import type { Metadata } from 'next'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'
import { Plus, Filter, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Pipeline — Carton Pack CRM' }

export default function PipelinePage() {
  return (
    <div className="page-content animate-fade-in w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl text-white font-bold tracking-tight">
          Pipeline de Vendas
        </h1>

        <div className="flex items-center gap-2">
          <div className="search-wrap">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Buscar negócio..."
            />
          </div>
          
          <button className="btn btn-secondary btn-sm">
            <Filter size={13} />
            <span>Filtros</span>
          </button>
          
          <button className="btn btn-primary btn-sm">
            <Plus size={13} />
            <span>Novo Negócio</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <PipelineBoard />
    </div>
  )
}
