'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

interface Tema { id: number; nome: string; icone: string }

export default function HomePage() {
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchTemas() {
      const { data } = await supabase.from('temas').select('id, nome, icone').order('nome')
      setTemas(data || [])
      setLoading(false)
    }
    fetchTemas()
  }, [])

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Temas</div>
          <div className="page-sub">Escolha uma especialidade para estudar</div>
        </div>

        {loading ? (
          <div className="loading">⏳ Carregando especialidades...</div>
        ) : temas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗄️</div>
            <div className="empty-title">Banco vazio</div>
            <div className="empty-sub">Execute o arquivo <code>supabase/schema.sql</code> no Supabase para popular o banco de dados.</div>
          </div>
        ) : (
          <div className="themes-grid">
            {temas.map(tema => (
              <div key={tema.id} className="theme-card" onClick={() => router.push(`/temas/${tema.id}`)}>
                <div className="theme-icon">{tema.icone}</div>
                <div className="theme-name">{tema.nome}</div>
                <div className="theme-count">Ver subtemas →</div>
                <div className="theme-bar">
                  <div className="theme-fill" style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
