'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // O Supabase processa o token da URL automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
    })

    // Fallback: redireciona após 3s se já estiver logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
      background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'Fraunces, serif' }}>
        Confirmando acesso...
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)' }}>
        Aguarde, você será redirecionado em instantes.
      </div>
    </div>
  )
}
