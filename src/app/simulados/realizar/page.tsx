'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Alternativa { id: number; letra: string; texto: string; correta: boolean }
interface Questao {
  id: number; enunciado: string; comentario: string; origem: string
  alternativas: Alternativa[]; tema: string; subtema: string
}

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('medq_session')
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('medq_session', sid) }
  return sid
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function RealizarSimuladoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [idx, setIdx] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const tempoTotal = parseInt(searchParams.get('tempo') || '60') * 60

  useEffect(() => {
    async function loadQuestoes() {
      const temaParams = searchParams.getAll('tema') // "temaId:qtd"
      const subParams = searchParams.getAll('sub')   // "subtemaId:qtd"
      if (!temaParams.length && !subParams.length) { router.push('/simulados'); return }

      let todasQuestoes: Questao[] = []

      // Por tema inteiro
      for (const tp of temaParams) {
        const [temaId, qtdStr] = tp.split(':')
        const qtd = parseInt(qtdStr) || 10
        const { data: subs } = await supabase.from('subtemas').select('id, nome').eq('tema_id', parseInt(temaId))
        const { data: temaData } = await supabase.from('temas').select('nome').eq('id', parseInt(temaId)).single()
        if (!subs?.length) continue
        const subIds = subs.map(s => s.id)
        const { data: qs } = await supabase
          .from('questoes')
          .select('id, enunciado, comentario, origem, subtema_id, alternativas(id, letra, texto, correta), subtemas(nome)')
          .in('subtema_id', subIds)
          .limit(qtd * 4)
        if (!qs) continue
        const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, qtd)
        shuffled.forEach((q: any) => todasQuestoes.push({
          id: q.id, enunciado: q.enunciado, comentario: q.comentario || '',
          origem: q.origem || '', alternativas: q.alternativas || [],
          tema: temaData?.nome || '', subtema: q.subtemas?.nome || '',
        }))
      }

      // Por subtema específico
      for (const sp of subParams) {
        const [subId, qtdStr] = sp.split(':')
        const qtd = parseInt(qtdStr) || 5
        const { data: subData } = await supabase.from('subtemas').select('nome, temas(nome)').eq('id', parseInt(subId)).single()
        const { data: qs } = await supabase
          .from('questoes')
          .select('id, enunciado, comentario, origem, alternativas(id, letra, texto, correta)')
          .eq('subtema_id', parseInt(subId))
          .limit(qtd * 4)
        if (!qs) continue
        const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, qtd)
        shuffled.forEach((q: any) => todasQuestoes.push({
          id: q.id, enunciado: q.enunciado, comentario: q.comentario || '',
          origem: q.origem || '', alternativas: q.alternativas || [],
          tema: (subData?.temas as any)?.nome || '',
          subtema: subData?.nome || '',
        }))
      }

      todasQuestoes = todasQuestoes.sort(() => Math.random() - 0.5)
      setQuestoes(todasQuestoes)
      const initResps: Record<number, number | null> = {}
      todasQuestoes.forEach(q => { initResps[q.id] = null })
      setRespostas(initResps)
      if (tempoTotal > 0) setTimeLeft(tempoTotal)
      setLoading(false)
    }
    loadQuestoes()
  }, [])

  useEffect(() => {
    if (loading || finished) return
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
      if (tempoTotal > 0) {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); finalizarSimulado(); return 0 }
          return t - 1
        })
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [loading, finished])

  async function finalizarSimulado() {
    setFinished(true)
    clearInterval(timerRef.current)
    const sid = user?.id || getSessionId()
    const inserts = questoes.filter(q => respostas[q.id] !== null).map(q => ({
      session_id: sid, questao_id: q.id, alternativa_id: respostas[q.id],
      acertou: respostas[q.id] === q.alternativas.find(a => a.correta)?.id,
    }))
    if (inserts.length > 0) await supabase.from('respostas').insert(inserts)
  }

  if (loading) return <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Montando simulado...</div></div></div>

  const questaoAtual = questoes[idx]
  const corretaId = questaoAtual?.alternativas.find(a => a.correta)?.id
  const respostaAtual = questaoAtual ? respostas[questaoAtual.id] : null
  const respondidas = Object.values(respostas).filter(v => v !== null).length
  const timerAlerta = tempoTotal > 0 && timeLeft < 300

  // Tela de resultado
  if (finished) {
    const acertos = questoes.filter(q => respostas[q.id] === q.alternativas.find(a => a.correta)?.id).length
    const total = questoes.filter(q => respostas[q.id] !== null).length
    const pct = total > 0 ? Math.round((acertos / total) * 100) : 0
    const pctColor = pct >= 70 ? '#50C878' : pct >= 50 ? '#F5A623' : '#E85D5D'
    const porTema: Record<string, { acertos: number; total: number }> = {}
    questoes.forEach(q => {
      if (respostas[q.id] === null) return
      if (!porTema[q.tema]) porTema[q.tema] = { acertos: 0, total: 0 }
      porTema[q.tema].total++
      if (respostas[q.id] === q.alternativas.find(a => a.correta)?.id) porTema[q.tema].acertos++
    })
    return (
      <div className="app"><Sidebar />
        <div className="main">
          <div className="page-header">
            <div className="page-title">🏁 Simulado concluído!</div>
            <div className="page-sub">Tempo: {formatTime(elapsed)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Respondidas', value: total, color: 'var(--blue)' },
              { label: 'Acertos', value: acertos, color: '#50C878' },
              { label: 'Desempenho', value: `${pct}%`, color: pctColor },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Por especialidade</div>
            {Object.entries(porTema).map(([tema, v]) => {
              const p = Math.round((v.acertos / v.total) * 100)
              const c = p >= 70 ? '#50C878' : p >= 50 ? '#F5A623' : '#E85D5D'
              return (
                <div key={tema} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500 }}>{tema}</span>
                    <span style={{ fontWeight: 700, color: c }}>{v.acertos}/{v.total} ({p}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: c, borderRadius: 99 }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => router.push('/simulados')}>Novo simulado →</button>
            <button className="btn btn-outline" onClick={() => router.push('/estatisticas')}>Ver estatísticas →</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>🧪 Simulado · Questão {idx + 1} de {questoes.length}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{respondidas} respondidas · {questoes.length - respondidas} restantes</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 16, background: timerAlerta ? '#FDEAEA' : 'var(--bg)', color: timerAlerta ? '#E85D5D' : 'var(--text)', border: `1.5px solid ${timerAlerta ? '#E85D5D' : 'var(--border)'}`, fontFamily: 'monospace', letterSpacing: 1 }}>
              {tempoTotal > 0 ? `⏱ ${formatTime(timeLeft)}` : `⏱ ${formatTime(elapsed)}`}
            </div>
            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => { if (confirm('Finalizar o simulado agora?')) finalizarSimulado() }}>Finalizar</button>
          </div>
        </div>

        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round((idx / questoes.length) * 100)}%`, background: 'var(--blue)', borderRadius: 99, transition: 'width .3s' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <span className="tag tag-blue">{questaoAtual?.tema} · {questaoAtual?.subtema}</span>
          {questaoAtual?.origem && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 10, fontWeight: 600 }}>{questaoAtual.origem}</span>}
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, lineHeight: 1.75 }}>{questaoAtual?.enunciado}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {questaoAtual?.alternativas.sort((a,b) => a.letra.localeCompare(b.letra)).map(alt => (
            <button key={alt.id} className={`alt${respostaAtual === alt.id ? ' selected' : ''}`}
              onClick={() => setRespostas(prev => ({ ...prev, [questaoAtual.id]: alt.id }))}>
              <span className="alt-letra">{alt.letra}</span>
              <span>{alt.texto}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}>← Anterior</button>
          {idx < questoes.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setIdx(i => i + 1)}>Próxima →</button>
          ) : (
            <button className="btn btn-primary" style={{ background: '#50C878' }} onClick={() => { if (confirm('Finalizar o simulado?')) finalizarSimulado() }}>Finalizar ✓</button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 280 }}>
            {questoes.map((q, i) => (
              <button key={q.id} onClick={() => setIdx(i)} title={`Questão ${i+1}`}
                style={{ width: 26, height: 26, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'Inter', background: i === idx ? 'var(--blue)' : respostas[q.id] !== null ? '#50C878' : 'var(--border)', color: i === idx || respostas[q.id] !== null ? '#fff' : 'var(--muted)', transition: 'all .1s' }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
