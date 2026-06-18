import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { LocalBusinessJsonLd } from '@/components/local-business-jsonld'

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas-neue',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Mad Dogos | Hot Dogs y Hamburguesas a Domicilio en Culiacán',
    template: '%s | Mad Dogos Culiacán',
  },
  description:
    'Pide tus hot dogs, hamburguesas, alitas y boneless a domicilio en Culiacán. Mad Dogos Hotdogs — entrega rápida directo por WhatsApp.',
  metadataBase: new URL('https://maddogos.com'),
  openGraph: {
    siteName: 'Mad Dogos Hotdogs',
    locale: 'es_MX',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-MX"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocalBusinessJsonLd />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
