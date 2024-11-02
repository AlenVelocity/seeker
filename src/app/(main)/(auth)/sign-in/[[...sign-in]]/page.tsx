'use client'

import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import Link from 'next/link'
export default function Page() {
    const { theme } = useTheme()

    return (
        <div className="mx-auto w-full max-w-[400px] flex flex-col items-center justify-center">
            <SignIn
                appearance={{
                    baseTheme: theme === 'dark' ? dark : undefined,
                    elements: {
                        formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                        card: 'bg-card shadow-md border border-border',
                        headerTitle: 'text-foreground font-semibold',
                        headerSubtitle: 'text-muted-foreground',
                        socialButtonsBlockButton: 'bg-muted text-foreground border-border hover:bg-muted/80',
                        socialButtonsBlockButtonText: 'text-foreground font-medium',
                        formFieldLabel: 'text-foreground font-medium',
                        formFieldInput: 'bg-background text-foreground border-input focus:ring-2 focus:ring-primary/20',
                        footerActionLink: 'text-primary hover:text-primary/80 font-medium',
                        dividerLine: 'bg-border',
                        dividerText: 'text-muted-foreground',
                        footer: 'hidden',
                        formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground'
                    }
                }}
                forceRedirectUrl="/"
                signUpUrl="/sign-up"
            />

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/sign-up" className="font-medium text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}
