import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthGuard } from "@/components/auth/auth-guard"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { SkipLink } from "@/components/accessibility/skip-link"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Alar - Gestão Jurídica",
  description: "Gerencie clientes, casos, equipe e prazos com o Alar",
  applicationName: "Alar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Alar",
    statusBarStyle: "default",
  },
  themeColor: "#0f172a",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="alar-theme"
          disableTransitionOnChange
        >
          <AuthProvider>
            <SkipLink />
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <p className="text-sm text-muted-foreground">Carregando sessão...</p>
                </div>
              }
            >
              <AuthGuard>{children}</AuthGuard>
            </Suspense>
            <OnboardingTour />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
