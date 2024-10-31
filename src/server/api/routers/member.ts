import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const memberRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.member.findMany()
    }),

    getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
        return ctx.db.member.findUnique({
            where: { id: input }
        })
    }),

    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email()
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.member.create({
                data: input
            })
        })
})
