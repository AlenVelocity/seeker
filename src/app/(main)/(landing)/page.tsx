import { currentUser } from '@clerk/nextjs/server'
import SeekerHero from './Hero'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
    const user = await currentUser()

    if (user) {
        redirect('/dashboard')
    }

    return <SeekerHero />
}
