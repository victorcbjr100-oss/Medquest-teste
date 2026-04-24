'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Favorita {
  id: number
  questao_id: number
  questoes: {
    id: number
    enunciado: string
    origem: string
    subtema_id: number
    subtemas: { nome: string; temas: { nome: string; icone: string } }
  }
}

export default function FavoritasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favoritas, setFavoritas] = useState<Favorita[]>([])
  const [loading, setLoading] = useState(true)
  const [removendo, setRemovendo] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    async function fetch() {
      const { data } = await supabase
        .from('favoritas')
        .select('id, questao_id, questoes(id, enunciado, origem, subtema_id, subtemas(nome, temas(nome, icone)))')
        .eq('user_id', user!.id)
        .order('id', { ascending: false })
      setFavoritas((data as unknown as Favorita[]) || [])
      setLoading(false)
    }
    fetch()
  }, [user, authLoading, router])

  async function remover(favId: number) {
    setRemovendo(favId)
    await supabase.from('favoritas').delete().eq('id', favId)
    setFavoritas(prev => prev.filter(f => f.id !== favId))
    setRemovendo(null)
  }

  if (authLoading || loading) return <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Carregando favoritas...</div></div></div>

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Favoritas</div>
          <div className="page-sub">{favoritas.length > 0 ? `${favoritas.length} questão${favoritas.length !== 1 ? 'ões' : ''} salva${favoritas.length !== 1 ? 's' : ''}` : 'Questões salvas para revisão'}</div>
        </div>

        {favoritas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <div className="empty-title">Nenhuma favorita ainda</div>
            <div className="empty-sub">Após responder uma questão, clique em "☆ Favoritar" para salvá-la aqui.</div>
            <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: 8 }}>Ir para os temas →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {favoritas.map(fav => {
              const q = fav.questoes
              const sub = q?.subtemas
              const tema = sub?.temas
              return (
                <div key={fav.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span className="tag tag-blue">{tema?.icone} {tema?.nome} · {sub?.nome}</span>
                    </div>
                    {q?.origem && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>{q.origem}</div>}
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', marginBottom: 14 }}>
                      {q?.enunciado?.length > 180 ? q.enunciado.slice(0, 180) + '...' : q?.enunciado}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => router.push(`/questoes/${q?.subtema_id}`)}>
                        Resolver novamente
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px', color: 'var(--red)' }} onClick={() => remover(fav.id)} disabled={removendo === fav.id}>
                        {removendo === fav.id ? 'Removendo...' : '✕ Remover'}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: '#F5A623', flexShrink: 0 }}>★</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
