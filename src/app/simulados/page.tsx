'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

interface Subtema { id: number; nome: string; totalQuestoes: number }
interface Tema { id: number; nome: string; icone: string; totalQuestoes: number; subtemas: Subtema[]; expandido: boolean }

const TEMPOS = [
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2 horas', value: 120 },
  { label: '3 horas', value: 180 },
  { label: 'Sem limite', value: 0 },
]

// Chave de seleção: "t_temaId" ou "s_subtemaId"
type Selecao = Record<string, number>

export default function SimuladosPage() {
  const router = useRouter()
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const [selecao, setSelecao] = useState<Selecao>({})
  const [tempo, setTempo] = useState(60)

  useEffect(() => {
    async function fetch() {
      const { data: temasData } = await supabase.from('temas').select('id, nome, icone').order('nome')
      if (!temasData) { setLoading(false); return }

      const comSubtemas = await Promise.all(temasData.map(async t => {
        const { data: subs } = await supabase.from('subtemas').select('id, nome').eq('tema_id', t.id).order('nome')
        const subIds = (subs || []).map(s => s.id)
        let totalTema = 0
        const subtemas: Subtema[] = []

        if (subIds.length > 0) {
          await Promise.all((subs || []).map(async s => {
            const { count } = await supabase.from('questoes').select('*', { count: 'exact', head: true }).eq('subtema_id', s.id)
            const total = count || 0
            totalTema += total
            if (total > 0) subtemas.push({ id: s.id, nome: s.nome, totalQuestoes: total })
          }))
        }

        return { ...t, totalQuestoes: totalTema, subtemas: subtemas.sort((a,b) => a.nome.localeCompare(b.nome)), expandido: false }
      }))

      setTemas(comSubtemas.filter(t => t.totalQuestoes > 0))
      setLoading(false)
    }
    fetch()
  }, [])

  function toggleExpand(temaId: number) {
    setTemas(prev => prev.map(t => t.id === temaId ? { ...t, expandido: !t.expandido } : t))
  }

  function toggleTema(tema: Tema) {
    const key = `t_${tema.id}`
    setSelecao(prev => {
      const novo = { ...prev }
      if (novo[key] !== undefined) {
        // Remove tema e todos subtemas
        delete novo[key]
        tema.subtemas.forEach(s => delete novo[`s_${s.id}`])
      } else {
        // Seleciona tema inteiro
        novo[key] = Math.min(20, tema.totalQuestoes)
        tema.subtemas.forEach(s => delete novo[`s_${s.id}`])
      }
      return novo
    })
  }

  function toggleSubtema(temaId: number, sub: Subtema) {
    const tKey = `t_${temaId}`
    const sKey = `s_${sub.id}`
    setSelecao(prev => {
      const novo = { ...prev }
      // Remove seleção do tema pai se existir
      delete novo[tKey]
      if (novo[sKey] !== undefined) {
        delete novo[sKey]
      } else {
        novo[sKey] = Math.min(10, sub.totalQuestoes)
      }
      return novo
    })
  }

  function setQtd(key: string, qtd: number, max: number) {
    setSelecao(prev => ({ ...prev, [key]: Math.max(1, Math.min(qtd, max)) }))
  }

  const totalSelecionado = Object.values(selecao).reduce((a, b) => a + b, 0)

  function iniciarSimulado() {
    if (totalSelecionado === 0) return
    const params = new URLSearchParams()
    Object.entries(selecao).forEach(([key, qtd]) => {
      const [tipo, id] = key.split('_')
      params.append(tipo === 't' ? 'tema' : 'sub', `${id}:${qtd}`)
    })
    params.set('tempo', String(tempo))
    router.push(`/simulados/realizar?${params.toString()}`)
  }

  const iStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, fontFamily: 'Inter, sans-serif', color: 'var(--text)', background: 'var(--bg)', outline: 'none' }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Simulados</div>
          <div className="page-sub">Monte seu simulado personalizado — escolha temas ou subtemas específicos</div>
        </div>

        {loading ? <div className="loading">⏳ Carregando especialidades...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

            {/* Esquerda */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontSize: 11 }}>
                Clique no tema para selecionar tudo · Expanda para escolher subtemas
              </div>

              {temas.map(tema => {
                const tKey = `t_${tema.id}`
                const temaAtivo = selecao[tKey] !== undefined
                const algumSubAtivo = tema.subtemas.some(s => selecao[`s_${s.id}`] !== undefined)
                const qualquerAtivo = temaAtivo || algumSubAtivo

                return (
                  <div key={tema.id} style={{ marginBottom: 8 }}>
                    {/* Linha do tema */}
                    <div style={{
                      background: qualquerAtivo ? 'var(--blue-light)' : 'var(--surface)',
                      border: `1.5px solid ${qualquerAtivo ? 'var(--blue)' : 'var(--border)'}`,
                      borderRadius: 12, padding: '13px 16px',
                      display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s',
                    }}>
                      {/* Checkbox tema */}
                      <div onClick={() => toggleTema(tema)} style={{ cursor: 'pointer', width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${temaAtivo ? 'var(--blue)' : 'var(--border)'}`, background: temaAtivo ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                        {temaAtivo && '✓'}
                        {!temaAtivo && algumSubAtivo && <span style={{ color: 'var(--blue)', fontSize: 10 }}>—</span>}
                      </div>

                      <span style={{ fontSize: 20 }}>{tema.icone}</span>

                      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleTema(tema)}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{tema.nome}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                          {tema.totalQuestoes} questões · {tema.subtemas.length} subtemas
                        </div>
                      </div>

                      {/* Qtd se tema selecionado inteiro */}
                      {temaAtivo && (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => setQtd(tKey, (selecao[tKey]||1) - 5, tema.totalQuestoes)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>−</button>
                          <input type="number" value={selecao[tKey] || 1} onChange={e => setQtd(tKey, parseInt(e.target.value)||1, tema.totalQuestoes)} style={{ width: 48, textAlign: 'center', border: '1.5px solid var(--blue)', borderRadius: 7, padding: '3px 4px', fontSize: 13, fontWeight: 700, color: 'var(--blue)', background: '#fff', outline: 'none', fontFamily: 'Inter' }} />
                          <button onClick={() => setQtd(tKey, (selecao[tKey]||1) + 5, tema.totalQuestoes)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>+</button>
                        </div>
                      )}

                      {/* Botão expandir */}
                      <button onClick={() => toggleExpand(tema.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', padding: '4px 8px', borderRadius: 6, fontFamily: 'Inter' }}>
                        {tema.expandido ? '▲ Fechar' : '▼ Subtemas'}
                      </button>
                    </div>

                    {/* Subtemas expandidos */}
                    {tema.expandido && (
                      <div style={{ marginLeft: 20, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {tema.subtemas.map(sub => {
                          const sKey = `s_${sub.id}`
                          const subAtivo = selecao[sKey] !== undefined
                          return (
                            <div key={sub.id} style={{ background: subAtivo ? 'var(--blue-light)' : 'var(--surface)', border: `1.5px solid ${subAtivo ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 9, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
                              <div onClick={() => toggleSubtema(tema.id, sub)} style={{ cursor: 'pointer', width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${subAtivo ? 'var(--blue)' : 'var(--border)'}`, background: subAtivo ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>
                                {subAtivo && '✓'}
                              </div>
                              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleSubtema(tema.id, sub)}>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{sub.nome}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub.totalQuestoes} questões</div>
                              </div>
                              {subAtivo && (
                                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <button onClick={() => setQtd(sKey, (selecao[sKey]||1) - 2, sub.totalQuestoes)} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>−</button>
                                  <input type="number" value={selecao[sKey]||1} onChange={e => setQtd(sKey, parseInt(e.target.value)||1, sub.totalQuestoes)} style={{ width: 42, textAlign: 'center', border: '1.5px solid var(--blue)', borderRadius: 6, padding: '2px 4px', fontSize: 12, fontWeight: 700, color: 'var(--blue)', background: '#fff', outline: 'none', fontFamily: 'Inter' }} />
                                  <button onClick={() => setQtd(sKey, (selecao[sKey]||1) + 2, sub.totalQuestoes)} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>+</button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Direita: painel */}
            <div style={{ position: 'sticky', top: 24 }}>
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>⚙️ Configurar simulado</div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>Tempo de prova</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {TEMPOS.map(t => (
                      <button key={t.value} onClick={() => setTempo(t.value)} style={{ padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1.5px solid ${tempo === t.value ? 'var(--blue)' : 'var(--border)'}`, background: tempo === t.value ? 'var(--blue-light)' : 'var(--surface)', color: tempo === t.value ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'Inter', transition: 'all .15s' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumo */}
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>Resumo</div>
                  {totalSelecionado === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '6px 0' }}>Nenhuma disciplina selecionada</div>
                  ) : (
                    <>
                      {Object.entries(selecao).map(([key, qtd]) => {
                        const [tipo, id] = key.split('_')
                        let label = ''
                        if (tipo === 't') {
                          const tema = temas.find(t => t.id === parseInt(id))
                          label = `${tema?.icone || ''} ${tema?.nome || ''}`
                        } else {
                          for (const t of temas) {
                            const sub = t.subtemas.find(s => s.id === parseInt(id))
                            if (sub) { label = `↳ ${sub.nome}`; break }
                          }
                        }
                        return (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{label}</span>
                            <span style={{ fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{qtd}q</span>
                          </div>
                        )
                      })}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--blue)' }}>{totalSelecionado} questões</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                        ⏱ {tempo === 0 ? 'Sem limite' : `${tempo} min`}
                        {tempo > 0 && totalSelecionado > 0 && ` · ~${Math.round(tempo / totalSelecionado * 60)}s/questão`}
                      </div>
                    </>
                  )}
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={totalSelecionado === 0} onClick={iniciarSimulado}>
                  {totalSelecionado === 0 ? 'Selecione disciplinas' : `Iniciar simulado →`}
                </button>
                {totalSelecionado > 0 && (
                  <button onClick={() => setSelecao({})} style={{ width: '100%', marginTop: 8, padding: '8px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter' }}>
                    Limpar seleção
                  </button>
                )}
              </div>

              <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue)', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: 'var(--blue)', lineHeight: 1.6 }}>
                💡 <strong>Dica REVALIDA:</strong> ~120 questões distribuídas entre as principais especialidades com 4 horas.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
