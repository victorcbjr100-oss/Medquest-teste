import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import MobileNav from '@/components/MobileNav'
import RouteGuard from '@/components/RouteGuard'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'MedQuest — Residência Médica',
  description: 'Domine a residência médica com MedQuest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <RouteGuard>
            <PageTransition>
              {children}
            </PageTransition>
            <MobileNav />
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
