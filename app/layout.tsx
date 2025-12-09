import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Effideli - Home Management & Services",
  description: "Your perfect home management board and routine services",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EffiDeli%27s%20full%20color%20%28%20transparent%20background%20icon%20only%20%29-Fbe2ZXggbmATpsonEw5l7wWP2r4XS9.png",
        href: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EffiDeli%27s%20full%20color%20%28%20transparent%20background%20icon%20only%20%29-Fbe2ZXggbmATpsonEw5l7wWP2r4XS9.png",
      },
    ],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EffiDeli%27s%20full%20color%20%28%20transparent%20background%20icon%20only%20%29-Fbe2ZXggbmATpsonEw5l7wWP2r4XS9.png"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

