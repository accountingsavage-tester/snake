import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Snake', description: 'Snake game with a Panata music sequence' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}