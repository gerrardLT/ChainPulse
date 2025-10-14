import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n/language-context"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/components/auth-provider"
import { WebSocketProvider } from "@/components/websocket-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "ChainPulse - Real-time Blockchain Event Monitoring",
  description: "Monitor blockchain events in real-time with smart notifications and data visualization",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-[#0B1020]`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <Providers>
              <AuthProvider>
                <WebSocketProvider>
                  <Sidebar />
                  <main className="ml-[187px] min-h-screen">
                    {children}
                  </main>
                  <Toaster />
                </WebSocketProvider>
              </AuthProvider>
            </Providers>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
