'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface TemaStats {
  tema: string
  icone: string
  total: number
  acertos: number
  erros: number
  pct: number
}

interface SubtemaStats {
  subtema: string
  tema: string
  total: number
  acertos: number
  pct: number
}

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('medq_session')
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('medq_session', sid) }
  return sid
}

const COLORS = ['#4A90E2', '#50C878', '#F5A623', '#E85D5D', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB', '#2ECC71', '#E74C3C']

function PctBar({ pct, small }: { pct: number; small?: boolean }) {
  const color = pct >= 70 ? '#50C878' : pct >= 50 ? '#F5A623' : '#E85D5D'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: small ? 5 : 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: small ? 11 : 13, fontWeight: 700, color, minWidth: 38, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'Acerto %' ? '%' : ''}</div>
      ))}
    </div>
  )
}

export default function EstatisticasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [temaStats, setTemaStats] = useState<TemaStats[]>([])
  const [subtemaStats, setSubtemaStats] = useState<SubtemaStats[]>([])
  const [activeTab, setActiveTab] = useState<'temas' | 'subtemas' | 'radar'>('temas')

  useEffect(() => {
    if (authLoading) return
    const sid = user?.id || getSessionId()
    if (!sid) { setLoading(false); return }

    async function fetchStats() {
      // Busca respostas com join completo
      const { data: respostas } = await supabase
        .from('respostas')
        .select(`
          acertou,
          questoes (
            subtemas (
              nome,
              temas ( nome, icone )
            )
          )
        `)
        .eq('session_id', sid)

      if (!respostas || respostas.length === 0) { setLoading(false); return }

      setTotal(respostas.length)
      setAcertos(respostas.filter(r => r.acertou).length)

      // Agrupa por tema
      const temaMap: Record<string, { icone: string; total: number; acertos: number }> = {}
      const subtemaMap: Record<string, { tema: string; total: number; acertos: number }> = {}

      for (const r of respostas as any[]) {
        const sub = r.questoes?.subtemas
        const tema = sub?.temas
        if (!tema || !sub) continue

        const tn = tema.nome
        const sn = sub.nome

        if (!temaMap[tn]) temaMap[tn] = { icone: tema.icone || '📚', total: 0, acertos: 0 }
        temaMap[tn].total++
        if (r.acertou) temaMap[tn].acertos++

        const key = `${tn}|${sn}`
        if (!subtemaMap[key]) subtemaMap[key] = { tema: tn, total: 0, acertos: 0 }
        subtemaMap[key].total++
        if (r.acertou) subtemaMap[key].acertos++
      }

      const ts: TemaStats[] = Object.entries(temaMap).map(([tema, v]) => ({
        tema, icone: v.icone, total: v.total, acertos: v.acertos,
        erros: v.total - v.acertos,
        pct: Math.round((v.acertos / v.total) * 100),
      })).sort((a, b) => b.total - a.total)

      const ss: SubtemaStats[] = Object.entries(subtemaMap).map(([key, v]) => {
        const [tema, subtema] = key.split('|')
        return { subtema, tema, total: v.total, acertos: v.acertos, pct: Math.round((v.acertos / v.total) * 100) }
      }).sort((a, b) => b.total - a.total)

      setTemaStats(ts)
      setSubtemaStats(ss)
      setLoading(false)
    }

    fetchStats()
  }, [user, authLoading])

  const erros = total - acertos
  const pctGeral = total > 0 ? Math.round((acertos / total) * 100) : 0
  const pctColor = pctGeral >= 70 ? '#50C878' : pctGeral >= 50 ? '#F5A623' : '#E85D5D'

  const radarData = temaStats.slice(0, 8).map(t => ({ tema: t.tema.slice(0, 8), pct: t.pct }))
  const pieData = temaStats.map(t => ({ name: t.tema, value: t.total }))
  const barData = temaStats.map(t => ({ name: t.tema.slice(0, 8), 'Acerto %': t.pct, Questões: t.total }))
  const maisEstudados = [...temaStats].sort((a, b) => b.total - a.total).slice(0, 5)
  const menosEstudados = [...temaStats].sort((a, b) => a.total - b.total).slice(0, 5)
  const precisaMelhorar = [...temaStats].filter(t => t.total > 0).sort((a, b) => a.pct - b.pct).slice(0, 5)
  const maisAcertos = [...temaStats].filter(t => t.total > 0).sort((a, b) => b.pct - a.pct).slice(0, 5)

  if (loading || authLoading) return <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Calculando estatísticas...</div></div></div>

  if (total === 0) return (
    <div className="app"><Sidebar />
      <div className="main">
        <div className="page-header"><div className="page-title">Estatísticas</div><div className="page-sub">Seu desempenho em tempo real</div></div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Ainda sem dados</div>
          <div className="empty-sub">Responda algumas questões para ver suas estatísticas aqui.</div>
          <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: 8 }}>Ir para os temas →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Estatísticas</div>
          <div className="page-sub">Seu desempenho detalhado em tempo real</div>
        </div>

        {/* Cards gerais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total respondidas', value: total, color: 'var(--blue)' },
            { label: 'Acertos', value: acertos, color: '#50C878' },
            { label: 'Erros', value: erros, color: '#E85D5D' },
            { label: 'Desempenho geral', value: `${pctGeral}%`, color: pctColor },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Fraunces, serif', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Highlights: melhor / pior / mais / menos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {/* Precisa melhorar */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔴</span> Precisa melhorar
            </div>
            {precisaMelhorar.map(t => (
              <div key={t.tema} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t.icone} {t.tema}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{t.total} questões</span>
                </div>
                <PctBar pct={t.pct} small />
              </div>
            ))}
          </div>

          {/* Pontos fortes */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🟢</span> Pontos fortes
            </div>
            {maisAcertos.map(t => (
              <div key={t.tema} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t.icone} {t.tema}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{t.total} questões</span>
                </div>
                <PctBar pct={t.pct} small />
              </div>
            ))}
          </div>

          {/* Mais estudados */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📈</span> Mais estudados
            </div>
            {maisEstudados.map((t, i) => (
              <div key={t.tema} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.icone} {t.tema}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{t.total}</div>
              </div>
            ))}
          </div>

          {/* Menos estudados */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📉</span> Menos estudados
            </div>
            {menosEstudados.map((t, i) => (
              <div key={t.tema} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FEF7E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--amber)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.icone} {t.tema}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>{t.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Abas dos gráficos */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 4, borderRadius: 10, width: 'fit-content', marginBottom: 20 }}>
          {([['temas', '📊 Por Tema'], ['subtemas', '🔬 Por Subtema'], ['radar', '🕸️ Radar']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: activeTab === key ? '#fff' : 'transparent', fontWeight: activeTab === key ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: activeTab === key ? 'var(--text)' : 'var(--muted)', boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Gráfico: Por Tema (barras) */}
        {activeTab === 'temas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Taxa de acerto por especialidade</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Acerto %" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry['Acerto %'] >= 70 ? '#50C878' : entry['Acerto %'] >= 50 ? '#F5A623' : '#E85D5D'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Questões respondidas por especialidade</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} questões`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{d.name}</span>
                      <span style={{ fontWeight: 600 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela detalhada */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Detalhamento por especialidade</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['Especialidade', 'Respondidas', 'Acertos', 'Erros', 'Desempenho'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Especialidade' ? 'left' : 'center', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {temaStats.map(t => (
                      <tr key={t.tema} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>{t.icone} {t.tema}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px' }}>{t.total}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px', color: '#50C878', fontWeight: 600 }}>{t.acertos}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px', color: '#E85D5D', fontWeight: 600 }}>{t.erros}</td>
                        <td style={{ padding: '10px 12px', minWidth: 140 }}><PctBar pct={t.pct} small /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico: Por Subtema */}
        {activeTab === 'subtemas' && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Desempenho por subtema</div>
            {subtemaStats.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Nenhum dado ainda.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['Subtema', 'Especialidade', 'Respondidas', 'Acertos', 'Desempenho'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Subtema' || h === 'Especialidade' ? 'left' : 'center', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subtemaStats.map(s => (
                      <tr key={`${s.tema}|${s.subtema}`} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.subtema}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{s.tema}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px' }}>{s.total}</td>
                        <td style={{ textAlign: 'center', padding: '10px 12px', color: '#50C878', fontWeight: 600 }}>{s.acertos}</td>
                        <td style={{ padding: '10px 12px', minWidth: 140 }}><PctBar pct={s.pct} small /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Gráfico Radar */}
        {activeTab === 'radar' && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Visão geral — gráfico radar</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Mostra até 8 especialidades. Quanto mais preenchido, melhor o desempenho.</div>
            {radarData.length < 3 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 0', fontSize: 14 }}>Responda questões de pelo menos 3 especialidades para ver o radar.</div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="tema" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Acerto %" dataKey="pct" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.25} />
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Acerto']} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
