import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { bookRouter } from './routers/book'
import { memberRouter } from './routers/member'
import { transactionRouter } from './routers/transaction'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    book: bookRouter,
    member: memberRouter,
    transaction: transactionRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
