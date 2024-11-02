import Link from 'next/link'
import { ModeToggle } from './theme/toggle'

export function Header() {
    return (
        <header className="flex h-20 items-center justify-between p-4">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Link href="/">
                        <h1 className="text-center text-3xl font-bold">
                            <span className="text-red-500">Seeker</span>
                        </h1>
                    </Link>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <ModeToggle />
            </div>
        </header>
    )
}
