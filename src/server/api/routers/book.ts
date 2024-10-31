import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const bookRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.book.findMany()
    }),

    getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
        return ctx.db.book.findUnique({
            where: { id: input }
        })
    }),

    create: publicProcedure
        .input(
            z.object({
                title: z.string(),
                author: z.string(),
                isbn: z.string(),
                quantity: z.number(),
                publisher: z.string().optional()
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.book.create({
                data: input
            })
        })
})
