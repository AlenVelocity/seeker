import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { TRPCReactProvider } from '@/trpc/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/provider'
import { Header } from '@/components/Header'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
    title: 'VCTLE',
    description: 'Guess the Valorant Champions Tour player',
    icons: [{ rel: 'icon', url: '/favicon.ico' }]
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${GeistSans.variable}`}>
            <body>
                <ClerkProvider>
                    <TRPCReactProvider>
                        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                            <div className="flex min-h-screen flex-col transition-colors duration-200">
                                <Header />
                                <main className="flex-grow">{children}</main>
                                <footer className="p-4 text-center text-sm text-muted-foreground">
                                    © 2024 Seeker. All rights reserved.
                                </footer>
                            </div>
                            <Toaster />
                        </ThemeProvider>
                    </TRPCReactProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
