'use client'

import { useState, useEffect } from 'react'
import { InteligenciaIA } from '@/components/InteligenciaIA'
import { dbService } from '@/services/supabase-client'
import type { Usuario } from '@/types/crm'

export default function AIChatPage() {
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
        INICIALIZANDO COPILOTO IA...
      </div>
    )
  }

  return (
    <InteligenciaIA
      usuarioLogado={usuarioLogado}
      isDarkTheme={true}
    />
  )
}
