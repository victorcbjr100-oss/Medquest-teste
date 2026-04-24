'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (mode === 'register' && password !== confirmPassword) { setError('As senhas não coincidem.'); return }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login')) setError('E-mail ou senha incorretos.')
        else if (error.message.includes('Email not confirmed')) setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        else setError('Erro ao entrar. Tente novamente.')
      } else {
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.includes('already registered')) setError('Este e-mail já está cadastrado. Faça login.')
        else setError('Erro ao criar conta. Tente novamente.')
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.')
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError('Erro ao conectar com Google.'); setGoogleLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid var(--border)', borderRadius: 10,
    fontSize: 15, fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text)', background: 'var(--bg)',
    outline: 'none', transition: 'border .15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 40, color: 'var(--blue)', marginBottom: 6 }}>MedQuest</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Plataforma de questões para residência médica</div>
        </div>

        <div className="card">
          {/* Abas Login / Criar conta */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 7, border: 'none',
                  background: mode === m ? '#fff' : 'transparent',
                  fontWeight: mode === m ? 600 : 400, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  color: mode === m ? 'var(--text)' : 'var(--muted)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .15s',
                }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Botão Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: '1.5px solid var(--border)', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', color: 'var(--text)',
              transition: 'border .15s', marginBottom: 18,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4285F4'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.4-7.2l-6.6 5.1C9.5 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>ou use seu e-mail</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 7 }}>
                E-mail
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 7 }}>
                Senha
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 7 }}>
                  Confirmar senha
                </label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {/* Erro */}
            {error && (
              <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Sucesso */}
            {success && (
              <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2a9a52' }}>
                ✅ {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          {/* Esqueci a senha */}
          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={async () => {
                  if (!email) { setError('Digite seu e-mail acima para redefinir a senha.'); return }
                  setError('')
                  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` })
                  setSuccess('E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.')
                }}
                style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Esqueci minha senha
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
