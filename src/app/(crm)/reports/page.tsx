'use client'

import { useState, useEffect } from 'react'
import { EquipeLeads } from '@/components/EquipeLeads'
import { dbService } from '@/services/supabase-client'
import type { Usuario } from '@/types/crm'

export default function ReportsPage() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)

  useEffect(() => {
    setUsuarioLogado(dbService.usuarios.getLogadoSimulado())
    
    const handleUserChange = () => {
      setUsuarioLogado(dbService.usuarios.getLogadoSimulado())
    }
    window.addEventListener('storage-user-changed', handleUserChange)
    return () => window.removeEventListener('storage-user-changed', handleUserChange)
  }, [])

  if (!usuarioLogado) {
    return (
      <div className="p-8 font-mono text-xs text-[var(--gray)] animate-pulse">
        CARREGANDO RELATÓRIOS DA EQUIPE...
      </div>
    )
  }

  return (
    <EquipeLeads
      usuarioLogado={usuarioLogado}
      isDarkTheme={true}
    />
  )
}
