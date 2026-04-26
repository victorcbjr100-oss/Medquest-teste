import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { PageContextProvider } from '@/context/PageContext'
import MobileNav from '@/components/MobileNav'
import RouteGuard from '@/components/RouteGuard'
import AIChat from '@/components/AIChat'

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
          <PageContextProvider>
            <RouteGuard>
              {children}
              <MobileNav />
              <AIChat />
            </RouteGuard>
          </PageContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
