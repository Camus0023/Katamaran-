import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Katamaran - Juego Accesible",
  description: "Juego inclusivo diseñado para personas con discapacidad visual",
  manifest: "/manifest.json",
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#2c5f5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Katamaran" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
