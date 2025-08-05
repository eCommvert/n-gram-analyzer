import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'N-Gram Analyzer for Google Ads',
  description: 'AI-powered search term analysis tool that helps PPC specialists identify wasted spend and expansion opportunities through n-gram analysis and AI clustering.',
  keywords: ['Google Ads', 'PPC', 'N-Gram Analysis', 'Search Terms', 'Negative Keywords', 'ROAS Optimization'],
  authors: [{ name: 'eCommvert' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple text-white antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
