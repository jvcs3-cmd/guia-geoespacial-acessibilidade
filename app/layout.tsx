import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AccessibilityWidget } from '@/components/accessibility/accessibility-widget'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'AcessiRota Janaúba — Guia de Acessibilidade Comercial',
  description:
    'Guia geoespacial de acessibilidade comercial para Janaúba-MG. Encontre estabelecimentos acessíveis para PcD física, visual, auditiva, neurodivergentes, idosos e gestantes.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1e293b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`dark bg-background ${geistSans.variable} ${geistMono.variable}`} >
      <body className="font-sans antialiased">
        <div id="a11y-content">{children}</div>
        <AccessibilityWidget />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
