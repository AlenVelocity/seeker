'use client'

import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

export default function Page() {
    const { theme } = useTheme()

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <SignUp
                appearance={{
                    baseTheme: theme === 'dark' ? dark : undefined,
                    elements: {
                        formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                        card: 'bg-background',
                        headerTitle: 'text-foreground',
                        headerSubtitle: 'text-muted-foreground',
                        socialButtonsBlockButton: 'bg-muted text-foreground border-border hover:bg-muted/80',
                        socialButtonsBlockButtonText: 'text-foreground',
                        formFieldLabel: 'text-foreground',
                        formFieldInput: 'bg-background text-foreground border-input',
                        footerActionLink: 'text-primary hover:text-primary/80',
                        dividerLine: 'bg-border',
                        dividerText: 'text-muted-foreground'
                    }
                }}
                redirectUrl="/"
                signInUrl="/sign-in"
            />
        </div>
    )
}
