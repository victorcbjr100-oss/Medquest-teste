'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

interface Tema { id: number; nome: string; icone: string }
interface Subtema { id: number; nome: string; total?: number }

export default function TemaPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tema, setTema] = useState<Tema | null>(null)
  const [subtemas, setSubtemas] = useState<Subtema[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [{ data: temaData }, { data: subtemasData }] = await Promise.all([
        supabase.from('temas').select('*').eq('id', id).single(),
        supabase.from('subtemas').select('id, nome').eq('tema_id', id).order('nome'),
      ])

      if (temaData) setTema(temaData)

      if (subtemasData) {
        // Para cada subtema, contar quantas questões existem
        const withCounts = await Promise.all(
          subtemasData.map(async (s) => {
            const { count } = await supabase
              .from('questoes')
              .select('*', { count: 'exact', head: true })
              .eq('subtema_id', s.id)
            return { ...s, total: count || 0 }
          })
        )
        setSubtemas(withCounts)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <button className="back-btn" onClick={() => router.push('/')}>
          ← Voltar para Temas
        </button>

        {loading ? (
          <div className="loading">⏳ Carregando subtemas...</div>
        ) : (
          <>
            <div className="page-header">
              <div className="page-title">
                {tema?.icone} {tema?.nome}
              </div>
              <div className="page-sub">Selecione um subtema para responder questões</div>
            </div>

            {subtemas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">Sem subtemas</div>
                <div className="empty-sub">Nenhum subtema encontrado para esta especialidade.</div>
              </div>
            ) : (
              subtemas.map(sub => (
                <div
                  key={sub.id}
                  className="subtema-item"
                  onClick={() => router.push(`/questoes/${sub.id}`)}
                >
                  <div>
                    <div className="subtema-name">{sub.nome}</div>
                    <div className="subtema-meta">
                      {sub.total === 0
                        ? 'Sem questões ainda'
                        : `${sub.total} questão${sub.total !== 1 ? 'ões' : ''} disponível`}
                    </div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 20 }}>›</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
