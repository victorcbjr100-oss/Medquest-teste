'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Alternativa { id: number; letra: string; texto: string; correta: boolean }
interface Questao { id: number; enunciado: string; comentario: string; origem: string; alternativas: Alternativa[] }
interface Subtema { id: number; nome: string; tema_id: number; temas: { nome: string; icone: string } }

function getSessionId() {
  let sid = localStorage.getItem('medq_session')
  if (!sid) { sid = 'anon_' + Math.random().toString(36).slice(2); localStorage.setItem('medq_session', sid) }
  return sid
}

export default function QuestoesPage() {
  const { subtemaId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [subtema, setSubtema] = useState<Subtema | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionStats, setSessionStats] = useState({ acertos: 0, erros: 0 })
  const [favoritadas, setFavoritadas] = useState<Set<number>>(new Set())
  const [favLoading, setFavLoading] = useState(false)
  const [favMsg, setFavMsg] = useState('')

  const fetchData = useCallback(async () => {
    const [{ data: subData }, { data: qData }] = await Promise.all([
      supabase.from('subtemas').select('id, nome, tema_id, temas(nome, icone)').eq('id', subtemaId).single(),
      supabase.from('questoes').select('id, enunciado, comentario, origem, alternativas(id, letra, texto, correta)').eq('subtema_id', subtemaId).order('id'),
    ])
    if (subData) setSubtema(subData as unknown as Subtema)
    if (qData) setQuestoes(qData as unknown as Questao[])
    setLoading(false)
  }, [subtemaId])

  const fetchFavoritos = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('favoritas').select('questao_id').eq('user_id', user.id)
    if (data) setFavoritadas(new Set(data.map(f => f.questao_id)))
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchFavoritos() }, [fetchFavoritos])

  const questaoAtual = questoes[idx]
  const corretaId = questaoAtual?.alternativas.find(a => a.correta)?.id
  const isFavoritada = questaoAtual ? favoritadas.has(questaoAtual.id) : false

  async function responder() {
    if (selected === null || answered) return
    setAnswered(true)
    const acertou = selected === corretaId
    setSessionStats(prev => ({ acertos: prev.acertos + (acertou ? 1 : 0), erros: prev.erros + (acertou ? 0 : 1) }))
    try {
      await supabase.from('respostas').insert({ session_id: user?.id || getSessionId(), questao_id: questaoAtual.id, alternativa_id: selected, acertou })
    } catch (e) { console.warn(e) }
  }

  async function toggleFavoritar() {
    if (!user) { router.push('/login'); return }
    if (favLoading) return
    setFavLoading(true)
    if (isFavoritada) {
      await supabase.from('favoritas').delete().eq('user_id', user.id).eq('questao_id', questaoAtual.id)
      setFavoritadas(prev => { const s = new Set(prev); s.delete(questaoAtual.id); return s })
      setFavMsg('Removida dos favoritos')
    } else {
      await supabase.from('favoritas').insert({ user_id: user.id, questao_id: questaoAtual.id })
      setFavoritadas(prev => new Set(prev).add(questaoAtual.id))
      setFavMsg('Favoritada! ⭐')
    }
    setFavLoading(false)
    setTimeout(() => setFavMsg(''), 2000)
  }

  function proxima() {
    if (idx < questoes.length - 1) { setIdx(i => i + 1); setSelected(null); setAnswered(false) }
    else { alert(`🎉 Sessão concluída!\n\n✅ Acertos: ${sessionStats.acertos}\n❌ Erros: ${sessionStats.erros}`); router.push(`/temas/${subtema?.tema_id}`) }
  }

  if (loading) return <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Carregando questões...</div></div></div>

  if (questoes.length === 0) return (
    <div className="app"><Sidebar /><div className="main">
      <button className="back-btn" onClick={() => router.back()}>← Voltar</button>
      <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">Sem questões</div><div className="empty-sub">Nenhuma questão cadastrada para este subtema ainda.</div></div>
    </div></div>
  )

  const tema = subtema?.temas
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <button className="back-btn" onClick={() => router.back()}>← Voltar para {subtema?.nome}</button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="tag tag-blue">{tema?.icone} {tema?.nome} · {subtema?.nome}</span>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Questão {idx + 1} de {questoes.length}</span>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✅ {sessionStats.acertos}</span>
            <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>❌ {sessionStats.erros}</span>
          </div>
        </div>

        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--blue)', width: `${(idx / questoes.length) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          {questaoAtual.origem && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>{questaoAtual.origem}</div>}
          <div style={{ fontSize: 15, lineHeight: 1.75 }}>{questaoAtual.enunciado}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {questaoAtual.alternativas.sort((a, b) => a.letra.localeCompare(b.letra)).map(alt => {
            let cls = 'alt'
            if (answered) { if (alt.id === corretaId) cls += ' correta'; else if (alt.id === selected) cls += ' errada' }
            else if (alt.id === selected) cls += ' selected'
            return (
              <button key={alt.id} className={cls} onClick={() => !answered && setSelected(alt.id)} disabled={answered}>
                <span className="alt-letra">{alt.letra}</span>
                <span>{alt.texto}</span>
              </button>
            )
          })}
        </div>

        {!answered && (
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} onClick={responder} disabled={selected === null}>
            {selected === null ? 'Selecione uma alternativa' : 'Confirmar resposta'}
          </button>
        )}

        {answered && (
          <div className="feedback-box">
            <div className={`feedback-title ${selected === corretaId ? 'ok' : 'nok'}`}>
              {selected === corretaId ? '✅ Resposta correta!' : '❌ Resposta incorreta'}
            </div>
            <div className="feedback-text">{questaoAtual.comentario}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <button className="btn btn-outline" onClick={toggleFavoritar} disabled={favLoading}>
                {isFavoritada ? '★ Favoritada' : '☆ Favoritar'}
              </button>
              {favMsg && <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>{favMsg}</span>}
              {!user && <span style={{ fontSize: 12, color: 'var(--muted)' }}>(login necessário)</span>}
              <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={proxima}>
                {idx < questoes.length - 1 ? 'Próxima →' : 'Finalizar sessão'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
