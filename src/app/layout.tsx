import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'MedQuest — Residência Médica',
  description: 'Domine a residência médica com MedQuest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
