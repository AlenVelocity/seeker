import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const transactionRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.transaction.findMany({
            include: {
                book: true,
                member: true
            }
        })
    }),

    create: publicProcedure
        .input(
            z.object({
                bookId: z.number(),
                memberId: z.number(),
                rentFee: z.number()
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.transaction.create({
                data: input
            })
        }),

    returnBook: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
        return ctx.db.transaction.update({
            where: { id: input },
            data: { returnDate: new Date() }
        })
    })
})
