'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

interface Tema { id: number; nome: string; icone: string; totalQuestoes: number }

const TEMPOS = [
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2 horas', value: 120 },
  { label: '3 horas', value: 180 },
  { label: 'Sem limite', value: 0 },
]

export default function SimuladosPage() {
  const router = useRouter()
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionados, setSelecionados] = useState<Record<number, number>>({}) // tema_id → qtd questões
  const [tempo, setTempo] = useState(60)
  const [step, setStep] = useState<'config' | 'confirmando'>('config')

  useEffect(() => {
    async function fetch() {
      const { data: temasData } = await supabase.from('temas').select('id, nome, icone').order('nome')
      if (!temasData) { setLoading(false); return }

      const comTotal = await Promise.all(temasData.map(async t => {
        const { count } = await supabase
          .from('questoes')
          .select('questoes.id', { count: 'exact', head: true })
          .eq('subtemas.tema_id', t.id)
          // join via subtemas
        // Alternativa: conta via subtemas
        const { data: subs } = await supabase.from('subtemas').select('id').eq('tema_id', t.id)
        const subIds = (subs || []).map(s => s.id)
        let total = 0
        if (subIds.length > 0) {
          const { count: c } = await supabase.from('questoes').select('*', { count: 'exact', head: true }).in('subtema_id', subIds)
          total = c || 0
        }
        return { ...t, totalQuestoes: total }
      }))

      setTemas(comTotal.filter(t => t.totalQuestoes > 0))
      setLoading(false)
    }
    fetch()
  }, [])

  function toggleTema(temaId: number, max: number) {
    setSelecionados(prev => {
      const novo = { ...prev }
      if (novo[temaId]) { delete novo[temaId] } else { novo[temaId] = Math.min(10, max) }
      return novo
    })
  }

  function setQtd(temaId: number, qtd: number, max: number) {
    setSelecionados(prev => ({ ...prev, [temaId]: Math.max(1, Math.min(qtd, max)) }))
  }

  const totalSelecionado = Object.values(selecionados).reduce((a, b) => a + b, 0)
  const temasSelecionados = Object.keys(selecionados).length

  function iniciarSimulado() {
    if (totalSelecionado === 0) return
    const params = new URLSearchParams()
    Object.entries(selecionados).forEach(([id, qtd]) => params.append('t', `${id}:${qtd}`))
    params.set('tempo', String(tempo))
    router.push(`/simulados/realizar?${params.toString()}`)
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Simulados</div>
          <div className="page-sub">Monte seu simulado personalizado por especialidade</div>
        </div>

        {loading ? (
          <div className="loading">⏳ Carregando especialidades...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

            {/* Esquerda: seleção de temas */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                📚 Escolha as especialidades
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {temas.map(tema => {
                  const sel = selecionados[tema.id]
                  const ativo = sel !== undefined
                  return (
                    <div key={tema.id} onClick={() => toggleTema(tema.id, tema.totalQuestoes)}
                      style={{
                        background: ativo ? 'var(--blue-light)' : 'var(--surface)',
                        border: `1.5px solid ${ativo ? 'var(--blue)' : 'var(--border)'}`,
                        borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s',
                      }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${ativo ? 'var(--blue)' : 'var(--border)'}`,
                        background: ativo ? 'var(--blue)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 13, fontWeight: 700,
                      }}>
                        {ativo && '✓'}
                      </div>

                      <span style={{ fontSize: 22 }}>{tema.icone}</span>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{tema.nome}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {tema.totalQuestoes} questões disponíveis
                        </div>
                      </div>

                      {/* Seletor de quantidade */}
                      {ativo && (
                        <div onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Qtd:</span>
                          <button onClick={() => setQtd(tema.id, (sel||1) - 5, tema.totalQuestoes)}
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>
                            −
                          </button>
                          <input type="number" value={sel || 1}
                            onChange={e => setQtd(tema.id, parseInt(e.target.value)||1, tema.totalQuestoes)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 52, textAlign: 'center', border: '1.5px solid var(--blue)', borderRadius: 8, padding: '4px 6px', fontSize: 14, fontWeight: 700, color: 'var(--blue)', background: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                          <button onClick={() => setQtd(tema.id, (sel||1) + 5, tema.totalQuestoes)}
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Direita: painel de configuração */}
            <div style={{ position: 'sticky', top: 24 }}>
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>⚙️ Configurar simulado</div>

                {/* Tempo */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
                    Tempo de prova
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {TEMPOS.map(t => (
                      <button key={t.value} onClick={() => setTempo(t.value)}
                        style={{
                          padding: '9px 8px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                          border: `1.5px solid ${tempo === t.value ? 'var(--blue)' : 'var(--border)'}`,
                          background: tempo === t.value ? 'var(--blue-light)' : 'var(--surface)',
                          color: tempo === t.value ? 'var(--blue)' : 'var(--muted)',
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s',
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumo */}
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
                    Resumo
                  </div>
                  {totalSelecionado === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>
                      Nenhuma especialidade selecionada
                    </div>
                  ) : (
                    <>
                      {Object.entries(selecionados).map(([id, qtd]) => {
                        const tema = temas.find(t => t.id === parseInt(id))
                        if (!tema) return null
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                            <span>{tema.icone} {tema.nome}</span>
                            <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{qtd}q</span>
                          </div>
                        )
                      })}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--blue)' }}>{totalSelecionado} questões</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                        ⏱ {tempo === 0 ? 'Sem limite de tempo' : `${tempo} minutos`}
                        {tempo > 0 && totalSelecionado > 0 && (
                          <span> · ~{Math.round(tempo / totalSelecionado * 60)}s por questão</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}
                  disabled={totalSelecionado === 0}
                  onClick={iniciarSimulado}>
                  {totalSelecionado === 0 ? 'Selecione especialidades' : `Iniciar simulado →`}
                </button>

                {totalSelecionado > 0 && (
                  <button onClick={() => setSelecionados({})}
                    style={{ width: '100%', marginTop: 8, padding: '9px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Limpar seleção
                  </button>
                )}
              </div>

              {/* Dica */}
              <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: 'var(--blue)', lineHeight: 1.6 }}>
                💡 <strong>Dica:</strong> Para simular o REVALIDA, selecione ~120 questões distribuídas entre as especialidades com 4 horas de tempo.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
