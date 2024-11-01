import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { TRPCReactProvider } from '@/trpc/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme/provider'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
    title: 'Seeker',
    description: 'Library Management System',
    icons: [{ rel: 'icon', url: '/favicon.ico' }]
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${GeistSans.variable}`}>
            <body>
                <ClerkProvider>
                    <TRPCReactProvider>
                        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                            {children}
                            <Toaster />
                        </ThemeProvider>
                    </TRPCReactProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
