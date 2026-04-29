import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/layout/Header'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Tokyo Gig Radar',
  description: '東京のインディー・クラブ系ライブ情報＆来日公演をまとめてチェック',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} font-sans antialiased min-h-screen`}>
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-800 mt-16 py-6 text-center text-xs text-zinc-600">
          © 2026 Tokyo Gig Radar — 情報は各サイトより収集。最新情報は各会場・チケットサイトをご確認ください。
        </footer>
      </body>
    </html>
  )
}
