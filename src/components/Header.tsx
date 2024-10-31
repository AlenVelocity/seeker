'use client'

import { ModeToggle } from './theme/toggle'
import { Button } from './ui/button'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export function Header() {
    const { user, isLoaded } = useUser()

    return (
        <header className="flex h-20 items-center justify-between p-4">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <h1 className="text-center text-3xl font-bold">
                        <span className="text-red-500">Seeker</span>
                    </h1>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                {isLoaded && (
                    <>
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm">Welcome, {user.fullName}</span>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        ) : (
                            <Button variant="outline" asChild>
                                <Link href="/sign-in">Sign in</Link>
                            </Button>
                        )}
                    </>
                )}
                <ModeToggle />
            </div>
        </header>
    )
}
