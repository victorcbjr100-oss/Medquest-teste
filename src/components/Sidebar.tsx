'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Página Inicial' },
  { href: '/temas-lista', icon: '📚', label: 'Temas' },
  { href: '/simulados', icon: '🕐', label: 'Simulados' },
  { href: '/estatisticas', icon: '📊', label: 'Estatísticas' },
  { href: '/favoritas', icon: '☆', label: 'Favoritas' },
  { href: '/caderno', icon: '📓', label: 'Meu Caderno' },
  { href: '/desempenho', icon: '🔥', label: 'Desempenho' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '?'
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const emailShort = user?.email
    ? user.email.length > 24 ? user.email.slice(0, 24) + '…' : user.email
    : ''

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">MQ</div>
        <div>
          <div className="sidebar-logo-name">MedQuest</div>
          <div className="sidebar-logo-sub">Residência Médica</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Menu Principal</div>
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="nav-item-icon">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="nav-spacer" />

      <div style={{ padding: '0 8px 8px' }}>
        <Link href="/perfil" className={`nav-item ${pathname === '/perfil' ? 'active' : ''}`}>
          <span className="nav-item-icon">👤</span>
          Perfil
        </Link>
      </div>

      {/* Profile footer */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-profile-name">{name}</div>
          {emailShort && <div className="sidebar-profile-email">{emailShort}</div>}
          {!user && (
            <Link href="/login" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>
              Fazer login →
            </Link>
          )}
        </div>
        {user && (
          <button className="sidebar-logout" onClick={handleSignOut} title="Sair">
            ↪
          </button>
        )}
      </div>
    </div>
  )
}
