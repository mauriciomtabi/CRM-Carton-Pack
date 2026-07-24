'use client'

import { useState, useEffect } from 'react'
import { OrçamentosKanban } from '@/components/OrçamentosKanban'
import { dbService } from '@/services/supabase-client'
import type { Usuario } from '@/types/crm'

export default function BriefingsPage() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<Usuario[]>([])

  useEffect(() => {
    const loadData = async () => {
      const user = dbService.usuarios.getLogadoSimulado()
      setUsuarioLogado(user)
      const list = await dbService.usuarios.list()
      setUsuariosDisponiveis(list)
    }

    loadData()

    // Ouvir alterações do usuário
    const handleUserChange = () => {
      loadData()
    }
    window.addEventListener('storage-user-changed', handleUserChange)
    return () => window.removeEventListener('storage-user-changed', handleUserChange)
  }, [])

  if (!usuarioLogado) {
    return (
      <div className="p-8 font-mono text-xs text-[var(--gray)] animate-pulse">
        CARREGANDO ORÇAMENTOS...
      </div>
    )
  }

  return (
    <OrçamentosKanban
      usuarioLogado={usuarioLogado}
      usuariosDisponiveis={usuariosDisponiveis}
      isDarkTheme={true}
    />
  )
}
