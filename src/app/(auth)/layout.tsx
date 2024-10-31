import '@/styles/globals.css'
import { Header } from '@/components/Header'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Auth'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-[calc(100vh-80px)]">
            <Header />
            <main className="container relative">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="mt-2 text-muted-foreground">Please sign in to your account to continue</p>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    )
}
