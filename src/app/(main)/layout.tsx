import { Header } from '@/components/Header'

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex flex-1 items-center justify-center">{children}</main>
        </div>
    )
}
