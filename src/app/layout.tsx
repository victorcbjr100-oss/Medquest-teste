import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import MobileNav from '@/components/MobileNav'
import RouteGuard from '@/components/RouteGuard'

export const metadata: Metadata = {
  title: 'MedQuest — Residência Médica',
  description: 'Domine a residência médica com MedQuest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <RouteGuard>
            {children}
            <MobileNav />
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
