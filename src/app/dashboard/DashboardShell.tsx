'use client'

import * as React from 'react'
import { Menu, LayoutDashboard, ChevronRight, Book, CreditCard, Users, Badge, Eye } from 'lucide-react'
import Link from 'next/link'

import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/theme/toggle'

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [activePage, setActivePage] = React.useState('Overview')
    const sidebar = useSidebar()
    const pages = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Books', icon: Book, path: '/dashboard/books' },
        { name: 'Transactions', icon: CreditCard, path: '/dashboard/transactions' },
        { name: 'Members', icon: Users, path: '/dashboard/members' }
    ]

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar collapsible="icon" className="flex-shrink-0 p-1">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                {sidebar.state === 'expanded' ? (
                                    <span className="text-lg font-semibold text-primary">Seeker</span>
                                ) : (
                                    <span className="w-4 text-lg font-semibold text-primary">
                                        <Eye className="h-4 w-4" />
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {pages.map((page) => (
                            <SidebarMenuItem key={page.name}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={activePage === page.name}
                                    onClick={() => setActivePage(page.name)}
                                >
                                    <Link href={page.path} className="flex items-center">
                                        <page.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                                        <span>{page.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 w-full items-center justify-between border-b bg-muted/40 px-6">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger>
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle sidebar</span>
                        </SidebarTrigger>
                        <Separator orientation="vertical" className="h-6" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator>
                                    <ChevronRight className="h-4 w-4" />
                                </BreadcrumbSeparator>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{activePage}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
