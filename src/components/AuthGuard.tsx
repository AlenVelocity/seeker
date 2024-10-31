import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const user = useUser()
    if (!user.isSignedIn) {
        return redirect('/')
    }
    return <>{children}</>
}
