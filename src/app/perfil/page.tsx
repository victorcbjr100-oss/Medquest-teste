'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Perfil {
  nome: string; tipo: string; especialidade_alvo: string
  ano_formatura: string; universidade: string; cidade: string
  estado: string; objetivo: string
}

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const TIPOS = ['Estudante de Medicina','Médico Residente','Médico Formado','Professor']
const ESPECIALIDADES = ['Clínica Médica','Cirurgia Geral','Pediatria','Ginecologia e Obstetrícia','Medicina de Família','Neurologia','Cardiologia','Pneumologia','Endocrinologia','Nefrologia','Gastroenterologia','Infectologia','Psiquiatria','Dermatologia','Ortopedia','Oftalmologia','Otorrinolaringologia','Radiologia','Anestesiologia','Medicina Preventiva','Ainda não decidi']

const EMPTY_PERFIL: Perfil = { nome:'', tipo:'', especialidade_alvo:'', ano_formatura:'', universidade:'', cidade:'', estado:'', objetivo:'' }

export default function PerfilPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil>(EMPTY_PERFIL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ respondidas: 0, acertos: 0, favoritas: 0 })

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    const uid = user.id
    const meta = user.user_metadata ?? {}

    setPerfil({
      nome: meta.nome ?? meta.full_name ?? '',
      tipo: meta.tipo ?? '',
      especialidade_alvo: meta.especialidade_alvo ?? '',
      ano_formatura: meta.ano_formatura ?? '',
      universidade: meta.universidade ?? '',
      cidade: meta.cidade ?? '',
      estado: meta.estado ?? '',
      objetivo: meta.objetivo ?? '',
    })

    async function loadStats() {
      const [{ data: resps }, { count: favs }] = await Promise.all([
        supabase.from('respostas').select('acertou').eq('session_id', uid),
        supabase.from('favoritas').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      ])
      const resp = resps ?? []
      setStats({ respondidas: resp.length, acertos: resp.filter((r: any) => r.acertou).length, favoritas: favs ?? 0 })
      setLoading(false)
    }
    loadStats()
  }, [user, authLoading])

  async function salvar() {
    if (!user) return
    setSaving(true)
    await supabase.auth.updateUser({ data: perfil })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const pct = stats.respondidas > 0 ? Math.round((stats.acertos / stats.respondidas) * 100) : 0
  const pctColor = pct >= 70 ? '#50C878' : pct >= 50 ? '#F5A623' : pct > 0 ? '#E85D5D' : 'var(--blue)'
  const initials = (perfil.nome || user?.email || 'U').slice(0, 2).toUpperCase()

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid var(--border)', borderRadius: 10,
    fontSize: 14, fontFamily: 'Inter, sans-serif',
    color: 'var(--text)', background: 'var(--bg)', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--muted)', textTransform: 'uppercase',
    letterSpacing: '.4px', marginBottom: 7,
  }

  if (loading || authLoading) return (
    <div className="app"><Sidebar /><div className="main"><div className="loading">⏳ Carregando perfil...</div></div></div>
  )

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Perfil</div>
          <div className="page-sub">Suas informações pessoais e desempenho</div>
        </div>

        {/* Header */}
        <div className="card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#4A90E2,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:700 }}>{perfil.nome || 'Seu nome'}</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
              {perfil.tipo && <span className="tag tag-blue">{perfil.tipo}</span>}
              {perfil.especialidade_alvo && <span className="tag tag-green">🎯 {perfil.especialidade_alvo}</span>}
              {perfil.cidade && perfil.estado && <span className="tag" style={{ background:'var(--bg)', color:'var(--muted)', border:'1px solid var(--border)' }}>📍 {perfil.cidade}/{perfil.estado}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Respondidas', value:stats.respondidas, color:'var(--blue)', icon:'🎯' },
            { label:'Taxa de acerto', value:`${pct}%`, color:pctColor, icon:'📈' },
            { label:'Favoritas', value:stats.favoritas, color:'#F5A623', icon:'⭐' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>✏️ Informações pessoais</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

            <div style={{ gridColumn:'1 / -1' }}>
              <label style={labelStyle}>Nome completo</label>
              <input style={inputStyle} value={perfil.nome} placeholder="Seu nome completo"
                onChange={e => setPerfil(p => ({...p, nome:e.target.value}))} />
            </div>

            <div>
              <label style={labelStyle}>Tipo de usuário</label>
              <select style={{...inputStyle, cursor:'pointer'}} value={perfil.tipo} onChange={e => setPerfil(p => ({...p, tipo:e.target.value}))}>
                <option value="">Selecione...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Ano de formatura</label>
              <input style={inputStyle} value={perfil.ano_formatura} placeholder="Ex: 2024" type="number"
                onChange={e => setPerfil(p => ({...p, ano_formatura:e.target.value}))} />
            </div>

            <div>
              <label style={labelStyle}>Especialidade alvo</label>
              <select style={{...inputStyle, cursor:'pointer'}} value={perfil.especialidade_alvo} onChange={e => setPerfil(p => ({...p, especialidade_alvo:e.target.value}))}>
                <option value="">Selecione...</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Universidade</label>
              <input style={inputStyle} value={perfil.universidade} placeholder="Nome da sua faculdade"
                onChange={e => setPerfil(p => ({...p, universidade:e.target.value}))} />
            </div>

            <div>
              <label style={labelStyle}>Cidade</label>
              <input style={inputStyle} value={perfil.cidade} placeholder="Sua cidade"
                onChange={e => setPerfil(p => ({...p, cidade:e.target.value}))} />
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              <select style={{...inputStyle, cursor:'pointer'}} value={perfil.estado} onChange={e => setPerfil(p => ({...p, estado:e.target.value}))}>
                <option value="">UF</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div style={{ gridColumn:'1 / -1' }}>
              <label style={labelStyle}>Objetivo / motivação</label>
              <textarea style={{...inputStyle, minHeight:90, resize:'vertical'}}
                value={perfil.objetivo} placeholder="Ex: Passar na residência de Clínica Médica da USP em 2026..."
                onChange={e => setPerfil(p => ({...p, objetivo:e.target.value}))} />
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:20, alignItems:'center' }}>
            <button className="btn btn-primary" onClick={salvar} disabled={saving} style={{ padding:'11px 28px' }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {saved && <span style={{ fontSize:13, color:'#50C878', fontWeight:600 }}>✅ Salvo!</span>}
          </div>
        </div>

        {/* Conta */}
        <div className="card">
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>🔐 Conta</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16 }}>
            Logado como <strong style={{ color:'var(--text)' }}>{user?.email}</strong>
          </div>
          <button className="btn btn-outline" onClick={handleSignOut} style={{ color:'#E85D5D', borderColor:'#E85D5D' }}>
            Sair da conta →
          </button>
        </div>
      </div>
    </div>
  )
}
