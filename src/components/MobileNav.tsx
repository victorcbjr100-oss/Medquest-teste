'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileItems = [
  { href: '/dashboard', icon: '⊞', label: 'Início' },
  { href: '/temas-lista', icon: '📚', label: 'Temas' },
  { href: '/simulados', icon: '🧪', label: 'Simulados' },
  { href: '/estatisticas', icon: '📊', label: 'Stats' },
  { href: '/favoritas', icon: '☆', label: 'Favoritas' },
  { href: '/caderno', icon: '📓', label: 'Caderno' },
  { href: '/desempenho', icon: '🔥', label: 'Desempenho' },
  { href: '/perfil', icon: '👤', label: 'Perfil' },
]

export default function MobileNav() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/auth/callback') return null

  return (
    <nav className="mobile-nav">
      {mobileItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} className={`mobile-nav-item${isActive ? ' active' : ''}`}>
            {isActive && <div className="mobile-nav-indicator" />}
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
