'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface DashStats {
  totalBanco: number
  respondidas: number
  taxaAcerto: number
  favoritas: number
  temasMaisEstudados: { nome: string; icone: string; total: number; pct: number }[]
  ultimasRespostas: { enunciado: string; acertou: boolean; tema: string }[]
}

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('medq_session')
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('medq_session', sid) }
  return sid
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashStats>({
    totalBanco: 0, respondidas: 0, taxaAcerto: 0, favoritas: 0,
    temasMaisEstudados: [], ultimasRespostas: [],
  })
  const [loading, setLoading] = useState(true)

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudante'

  useEffect(() => {
    if (authLoading) return
    async function fetchDash() {
      const sid = user?.id || getSessionId()

      // Total de questões no banco
      const { count: totalBanco } = await supabase
        .from('questoes').select('*', { count: 'exact', head: true })

      // Respostas do usuário
      const { data: respostas } = await supabase
        .from('respostas')
        .select(`acertou, questoes(subtemas(nome, temas(nome, icone)))`)
        .eq('session_id', sid)
        .order('created_at', { ascending: false })

      // Favoritas
      let favCount = 0
      if (user) {
        const { count } = await supabase
          .from('favoritas').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        favCount = count || 0
      }

      const respondidas = respostas?.length || 0
      const acertos = respostas?.filter(r => r.acertou).length || 0
      const taxaAcerto = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0

      // Temas mais estudados
      const temaMap: Record<string, { icone: string; total: number; acertos: number }> = {}
      for (const r of (respostas || []) as any[]) {
        const tema = r.questoes?.subtemas?.temas
        if (!tema) continue
        if (!temaMap[tema.nome]) temaMap[tema.nome] = { icone: tema.icone, total: 0, acertos: 0 }
        temaMap[tema.nome].total++
        if (r.acertou) temaMap[tema.nome].acertos++
      }
      const temasMaisEstudados = Object.entries(temaMap)
        .map(([nome, v]) => ({ nome, icone: v.icone, total: v.total, pct: Math.round((v.acertos / v.total) * 100) }))
        .sort((a, b) => b.total - a.total).slice(0, 4)

      // Últimas 4 respostas
      const ultimasRespostas = ((respostas || []) as any[]).slice(0, 4).map(r => ({
        enunciado: r.questoes?.enunciado || '',
        acertou: r.acertou,
        tema: r.questoes?.subtemas?.temas?.nome || '',
      }))

      setStats({ totalBanco: totalBanco || 0, respondidas, taxaAcerto, favoritas: favCount, temasMaisEstudados, ultimasRespostas })
      setLoading(false)
    }
    fetchDash()
  }, [user, authLoading])

  const pctProgress = stats.totalBanco > 0 ? Math.round((stats.respondidas / stats.totalBanco) * 100) : 0
  const pctColor = stats.taxaAcerto >= 70 ? '#50C878' : stats.taxaAcerto >= 50 ? '#F5A623' : stats.taxaAcerto === 0 ? 'var(--blue)' : '#E85D5D'

  return (
    <div className="app">
      <Sidebar />
      <div className="main">

        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            Olá, {name}! 👋
          </div>
          <div className="page-sub">Acompanhe seu desempenho e domine a residência médica.</div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#EEF2FF' }}>📚</div>
            <div>
              <div className="stat-card-label">Total Banco</div>
              <div className="stat-card-value">{loading ? '—' : stats.totalBanco}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#EBF3FD' }}>🎯</div>
            <div>
              <div className="stat-card-label">Respondidas</div>
              <div className="stat-card-value">{loading ? '—' : stats.respondidas}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: stats.taxaAcerto >= 70 ? '#EDFBF2' : '#FEF7E7' }}>📈</div>
            <div>
              <div className="stat-card-label">Taxa de Acerto</div>
              <div className="stat-card-value" style={{ color: pctColor }}>{loading ? '—' : `${stats.taxaAcerto}%`}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#FEF7E7' }}>⭐</div>
            <div>
              <div className="stat-card-label">Favoritas</div>
              <div className="stat-card-value">{loading ? '—' : stats.favoritas}</div>
            </div>
          </div>
        </div>

        {/* Ação rápida — 3 banners */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
          <Link href="/temas-lista" style={{ textDecoration: 'none', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg, #4A90E2 0%, #6366F1 100%)', padding: '24px 22px', display: 'block', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(74,144,226,.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Estudar por Temas</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Prática focada por especialidade</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>Acessar Banco →</div>
          </Link>

          <Link href="/simulados" style={{ textDecoration: 'none', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '24px 22px', display: 'block', transition: 'transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Novo Simulado</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Treine com tempo real de prova</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>Iniciar Agora →</div>
          </Link>

          <Link href="/estatisticas" style={{ textDecoration: 'none', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', padding: '24px 22px', display: 'block', transition: 'transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(139,92,246,.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Desempenho</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Análise detalhada por área</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>Ver Métricas →</div>
          </Link>
        </div>

        {/* Resumo + Progresso + Temas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Resumo de Performance */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🏅 Resumo da Performance
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: pctColor }}>{stats.taxaAcerto}%</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 4 }}>Taxa de Acerto</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)' }}>{stats.respondidas}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 4 }}>Respondidas</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pctProgress}% do total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#F5A623' }}>{stats.favoritas}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 4 }}>Favoritas</div>
                {stats.favoritas > 0 && (
                  <Link href="/favoritas" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>Ver todas →</Link>
                )}
              </div>
            </div>

            {/* Progresso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                <span>Progresso na Plataforma</span>
                <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{pctProgress}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctProgress}%`, background: 'linear-gradient(90deg, var(--blue), #6366F1)', borderRadius: 99, transition: 'width .8s ease' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                {stats.respondidas} de {stats.totalBanco} questões respondidas
              </div>
            </div>
          </div>

          {/* Temas mais estudados */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📊 Temas mais estudados</span>
              <Link href="/estatisticas" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Ver tudo →</Link>
            </div>

            {loading ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando...</div>
            ) : stats.temasMaisEstudados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: .4 }}>📭</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Responda algumas questões<br />para ver seus temas aqui.
                </div>
                <Link href="/temas-lista" className="btn btn-primary" style={{ marginTop: 12, fontSize: 13 }}>Começar agora →</Link>
              </div>
            ) : (
              stats.temasMaisEstudados.map(t => (
                <div key={t.nome} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500 }}>{t.icone} {t.nome}</span>
                    <span style={{ fontWeight: 700, color: t.pct >= 70 ? '#50C878' : t.pct >= 50 ? '#F5A623' : '#E85D5D' }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.pct}%`, background: t.pct >= 70 ? '#50C878' : t.pct >= 50 ? '#F5A623' : '#E85D5D', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.total} questões respondidas</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atividade recente */}
        {stats.ultimasRespostas.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🕐 Atividade recente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.ultimasRespostas.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: r.acertou ? 'var(--green-light)' : 'var(--red-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                  }}>
                    {r.acertou ? '✅' : '❌'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.enunciado?.slice(0, 80)}{r.enunciado?.length > 80 ? '…' : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.tema}</div>
                  </div>
                  <span className={`tag ${r.acertou ? 'tag-green' : 'tag-red'}`}>
                    {r.acertou ? 'Acerto' : 'Erro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA se não respondeu nada */}
        {!loading && stats.respondidas === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Comece a estudar agora!</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Escolha um tema e responda sua primeira questão.<br />Seu progresso será salvo automaticamente.
            </div>
            <Link href="/temas-lista" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              Ver especialidades →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
