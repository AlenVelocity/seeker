'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Book, ArrowRight, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'

export default function SeekerHero() {
    const { setTheme, theme } = useTheme()

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
            className="flex max-h-[calc(100vh-20rem)] flex-col px-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <section className="w-full py-12">
                <div className="container">
                    <motion.div
                        className="flex flex-col items-center space-y-4 text-center"
                        variants={containerVariants}
                    >
                        <motion.div className="space-y-2" variants={itemVariants}>
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                                Welcome to Seeker
                            </h1>
                            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed">
                                A Library Management System built with the T3 Stack and FastAPI
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
                                    <Link href="/sign-in">
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}
