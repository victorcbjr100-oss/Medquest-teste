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
    const meta = user.user_metadata || {}

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
        supabase.from('respostas').select('acertou').eq('user_id', uid),
        supabase.from('favoritas').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      ])

      const resp = resps ?? []

      setStats({
        respondidas: resp.length,
        acertos: resp.filter((r: any) => r.acertou).length,
        favoritas: favs ?? 0
      })

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
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="loading">⏳ Carregando perfil...</div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Perfil</div>
          <div className="page-sub">Suas informações pessoais e desempenho</div>
        </div>

        <div className="card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#4A90E2,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'#fff' }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:700 }}>{perfil.nome || 'Seu nome'}</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>{user?.email}</div>
          </div>
        </div>

        <button onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>

        {saved && <div>✅ Salvo!</div>}

        <button onClick={handleSignOut}>
          Sair
        </button>
      </div>
    </div>
  )
}
