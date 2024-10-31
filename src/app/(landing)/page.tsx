'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Book, ArrowRight, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function SeekerHero() {
    const user = useUser()
    const { setTheme, theme } = useTheme()

    if (user.isSignedIn) {
        redirect('/dashboard')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    }

    return (
        <motion.div
            className="flex min-h-screen flex-col"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.header className="flex h-16 items-center px-4 lg:px-6" variants={itemVariants}>
                <Link className="flex items-center justify-center" href="#">
                    <Book className="mr-2 h-6 w-6" />
                    <span className="text-lg font-bold">Seeker</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Toggle theme"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </motion.div>
                </nav>
            </motion.header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container px-4 md:px-6">
                        <motion.div
                            className="flex flex-col items-center space-y-4 text-center"
                            variants={containerVariants}
                        >
                            <motion.div className="space-y-2" variants={itemVariants}>
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                                    Welcome to Seeker
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed">
                                    Streamline your library management with powerful tools and intuitive interfaces.
                                </p>
                            </motion.div>
                            <motion.div
                                className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                                variants={itemVariants}
                            >
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button asChild size="lg" className="text-lg">
                                        <Link href="/dashboard">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button asChild variant="outline" size="lg" className="text-lg">
                                        <Link href="/signin">Sign In</Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </motion.div>
    )
}
