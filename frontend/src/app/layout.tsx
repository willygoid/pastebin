import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastebin - Share Code & Text',
  description: 'Simple pastebin application for sharing code and text',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
