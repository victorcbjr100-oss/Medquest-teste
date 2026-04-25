'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileItems = [
  { href: '/dashboard', icon: '⊞', label: 'Início' },
  { href: '/temas-lista', icon: '📚', label: 'Temas' },
  { href: '/estatisticas', icon: '📊', label: 'Stats' },
  { href: '/favoritas', icon: '☆', label: 'Favoritas' },
  { href: '/perfil', icon: '👤', label: 'Perfil' },
]

export default function MobileNav() {
  const pathname = usePathname()

  // Não mostrar na tela de login
  if (pathname === '/login' || pathname === '/auth/callback') return null

  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: '#0F1117',
      borderTop: '1px solid #1F2333',
      zIndex: 50,
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    }} className="mobile-nav">
      {mobileItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '6px 4px',
            textDecoration: 'none',
            color: isActive ? '#4A90E2' : '#6B7A99',
            transition: 'color .15s',
            position: 'relative',
          }}>
            {/* Indicador ativo */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 32, height: 3,
                background: '#4A90E2',
                borderRadius: '0 0 4px 4px',
              }} />
            )}
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '.2px',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
