import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Carton Pack CRM',
  description: 'Sistema de gestão comercial — Carton Pack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
