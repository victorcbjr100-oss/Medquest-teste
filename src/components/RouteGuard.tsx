'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Rotas públicas — não precisam de login
const PUBLIC_ROUTES = ['/login', '/auth/callback']

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    if (loading) return

    // Não logado tentando acessar rota protegida → redireciona para login
    if (!user && !isPublic) {
      router.replace('/login')
      return
    }

    // Logado tentando acessar login → redireciona para dashboard
    if (user && pathname === '/login') {
      router.replace('/dashboard')
    }
  }, [user, loading, isPublic, pathname, router])

  // Tela de carregamento enquanto verifica sessão
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          width: 48, height: 48,
          background: '#4A90E2',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.5px',
          marginBottom: 8,
        }}>
          MQ
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18, fontWeight: 700,
          color: '#fff', letterSpacing: '-0.3px',
        }}>
          MedQuest
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#4A90E2', opacity: 0.4,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </div>
    )
  }

  // Não logado em rota protegida → não renderiza nada (redirect em andamento)
  if (!user && !isPublic) return null

  return <>{children}</>
}
