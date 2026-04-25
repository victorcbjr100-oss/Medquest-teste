'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface SubtemaStats {
  subtema_id: number
  subtema: string
  tema: string
  icone: string
  tema_id: number
  total: number
  acertos: number
  erros: number
  pct: number
}

interface TemaStats {
  tema: string
  icone: string
  tema_id: number
  total: number
  acertos: number
  pct: number
  subtemas: SubtemaStats[]
}

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('medq_session')
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('medq_session', sid) }
  return sid
}

function PctBadge({ pct }: { pct: number }) {
  const color = pct >= 70 ? '#50C878' : pct >= 50 ? '#F5A623' : '#E85D5D'
  const bg = pct >= 70 ? '#EDFBF2' : pct >= 50 ? '#FEF7E7' : '#FDEAEA'
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '3px 10px', borderRadius: 99 }}>
      {pct}%
    </span>
  )
}

function BarProgress({ pct }: { pct: number }) {
  const color = pct >= 70 ? '#50C878' : pct >= 50 ? '#F5A623' : '#E85D5D'
  return (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .6s ease' }} />
    </div>
  )
}

export default function DesempenhoPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [temaStats, setTemaStats] = useState<TemaStats[]>([])
  const [expandido, setExpandido] = useState<number | null>(null)
  const [totalRespondidas, setTotalRespondidas] = useState(0)

  useEffect(() => {
    if (authLoading) return
    const sid = user?.id || getSessionId()
    if (!sid) { setLoading(false); return }

    async function fetchDesempenho() {
      const { data: respostas } = await supabase
        .from('respostas')
        .select(`
          acertou,
          questoes (
            subtema_id,
            subtemas ( id, nome, tema_id, temas ( id, nome, icone ) )
          )
        `)
        .eq('session_id', sid)

      if (!respostas || respostas.length === 0) { setLoading(false); return }
      setTotalRespondidas(respostas.length)

      // Agrupa por subtema
      const subMap: Record<number, { subtema: string; tema: string; icone: string; tema_id: number; total: number; acertos: number }> = {}
      const temaMap: Record<number, { tema: string; icone: string; tema_id: number; total: number; acertos: number }> = {}

      for (const r of respostas as any[]) {
        const sub = r.questoes?.subtemas
        const tema = sub?.temas
        if (!sub || !tema) continue

        const sid2 = sub.id
        const tid = tema.id

        if (!subMap[sid2]) subMap[sid2] = { subtema: sub.nome, tema: tema.nome, icone: tema.icone, tema_id: tid, total: 0, acertos: 0 }
        subMap[sid2].total++
        if (r.acertou) subMap[sid2].acertos++

        if (!temaMap[tid]) temaMap[tid] = { tema: tema.nome, icone: tema.icone, tema_id: tid, total: 0, acertos: 0 }
        temaMap[tid].total++
        if (r.acertou) temaMap[tid].acertos++
      }

      const ts: TemaStats[] = Object.entries(temaMap).map(([tid, v]) => ({
        ...v,
        pct: Math.round((v.acertos / v.total) * 100),
        subtemas: Object.entries(subMap)
          .filter(([, sv]) => sv.tema_id === parseInt(tid))
          .map(([sid2, sv]) => ({
            subtema_id: parseInt(sid2),
            subtema: sv.subtema,
            tema: sv.tema,
            icone: sv.icone,
            tema_id: sv.tema_id,
            total: sv.total,
            acertos: sv.acertos,
            erros: sv.total - sv.acertos,
            pct: Math.round((sv.acertos / sv.total) * 100),
          }))
          .sort((a, b) => a.pct - b.pct),
      })).sort((a, b) => a.pct - b.pct)

      setTemaStats(ts)
      setLoading(false)
    }
    fetchDesempenho()
  }, [user, authLoading])

  const precisaMelhorar = temaStats.filter(t => t.pct < 60).slice(0, 5)
  const pontosForts = [...temaStats].sort((a, b) => b.pct - a.pct).filter(t => t.pct >= 60).slice(0, 5)
  const subtemasCriticos = temaStats.flatMap(t => t.subtemas).filter(s => s.total >= 2).sort((a, b) => a.pct - b.pct).slice(0, 6)

  if (loading || authLoading) return (
    <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Analisando seu desempenho...</div></div></div>
  )

  if (totalRespondidas < 10) return (
    <div className="app"><Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Desempenho Inteligente</div>
          <div className="page-sub">Sugestões automáticas baseadas nos seus erros</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">Dados insuficientes</div>
          <div className="empty-sub">Você respondeu {totalRespondidas} questão{totalRespondidas !== 1 ? 'ões' : ''}. Responda pelo menos 10 para ativar as sugestões inteligentes.</div>
          <button className="btn btn-primary" onClick={() => router.push('/temas-lista')} style={{ marginTop: 8 }}>Estudar agora →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Desempenho Inteligente 🔥</div>
          <div className="page-sub">Análise automática baseada nas suas {totalRespondidas} respostas</div>
        </div>

        {/* Cards de alerta e destaque */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Precisa melhorar */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔴 Precisa melhorar urgente
            </div>
            {precisaMelhorar.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>🎉 Ótimo! Nenhuma área abaixo de 60%</div>
            ) : precisaMelhorar.map(t => (
              <div key={t.tema_id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.icone} {t.tema}</span>
                  <PctBadge pct={t.pct} />
                </div>
                <BarProgress pct={t.pct} />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.total} questões · {t.acertos} acertos</div>
              </div>
            ))}
          </div>

          {/* Pontos fortes */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🟢 Seus pontos fortes
            </div>
            {pontosForts.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>Continue estudando para ver seus pontos fortes!</div>
            ) : pontosForts.map(t => (
              <div key={t.tema_id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.icone} {t.tema}</span>
                  <PctBadge pct={t.pct} />
                </div>
                <BarProgress pct={t.pct} />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.total} questões · {t.acertos} acertos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtemas críticos */}
        {subtemasCriticos.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>⚠️ Subtemas que precisam de atenção</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {subtemasCriticos.map(s => (
                <div key={s.subtema_id} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.pct >= 50 ? '#F5A623' : '#E85D5D', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subtema}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.tema} · {s.total} questões</div>
                  </div>
                  <PctBadge pct={s.pct} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sugestões de estudo */}
        {precisaMelhorar.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>💡 Sugestões de estudo para hoje</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {precisaMelhorar.slice(0, 3).map((t, i) => (
                <div key={t.tema_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Revisar {t.tema}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Taxa de acerto atual: {t.pct}% · Meta: 70%
                      {t.subtemas[0] && ` · Foque em: ${t.subtemas[0].subtema}`}
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0 }}
                    onClick={() => router.push(`/temas/${t.tema_id}`)}>
                    Estudar →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Análise completa por tema com subtemas expandíveis */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📊 Análise completa por especialidade</div>
          {temaStats.map(t => (
            <div key={t.tema_id} style={{ marginBottom: 8 }}>
              {/* Linha do tema */}
              <div
                onClick={() => setExpandido(expandido === t.tema_id ? null : t.tema_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icone}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.tema}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.total} questões · {t.subtemas.length} subtemas</div>
                </div>
                <BarProgress pct={t.pct} />
                <PctBadge pct={t.pct} />
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{expandido === t.tema_id ? '▲' : '▼'}</span>
              </div>

              {/* Subtemas expandidos */}
              {expandido === t.tema_id && t.subtemas.length > 0 && (
                <div style={{ marginTop: 4, marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {t.subtemas.map(s => (
                    <div key={s.subtema_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.pct >= 70 ? '#50C878' : s.pct >= 50 ? '#F5A623' : '#E85D5D', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{s.subtema}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.total}q</span>
                      <BarProgress pct={s.pct} />
                      <PctBadge pct={s.pct} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
