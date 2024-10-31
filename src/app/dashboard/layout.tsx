import '@/styles/globals.css'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardShell } from './DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DashboardShell>{children}</DashboardShell>
        </SidebarProvider>
    )
}
