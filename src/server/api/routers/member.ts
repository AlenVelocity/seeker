import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const memberRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(
            z.object({
                search: z.string().optional(),
                page: z.number().default(1),
                limit: z.number().default(20)
            })
        )
        .query(async ({ ctx, input }) => {
            const skip = (input.page - 1) * input.limit
            const where = input.search
                ? {
                      OR: [
                          { name: { contains: input.search } },
                          { email: { contains: input.search } },
                          { phone: { contains: input.search } }
                      ]
                  }
                : {}

            const [members, total] = await Promise.all([
                ctx.db.member.findMany({
                    where,
                    skip,
                    take: input.limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { transactions: true }
                        },
                        transactions: {
                            where: { returnDate: null },
                            include: { book: true }
                        }
                    }
                }),
                ctx.db.member.count({ where })
            ])

            return {
                members,
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
        const member = await ctx.db.member.findUnique({
            where: { id: input },
            include: {
                transactions: {
                    include: { book: true },
                    orderBy: { issueDate: 'desc' }
                }
            }
        })

        if (!member) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Member not found'
            })
        }

        return member
    }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                address: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if email is already registered
            const existingMember = await ctx.db.member.findUnique({
                where: { email: input.email }
            })

            if (existingMember) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Email already registered'
                })
            }

            return ctx.db.member.create({
                data: {
                    ...input,
                    outstandingDebt: 0
                }
            })
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().optional(),
                email: z.string().email().optional(),
                phone: z.string().optional(),
                address: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input

            if (data.email) {
                const existingMember = await ctx.db.member.findFirst({
                    where: {
                        email: data.email,
                        NOT: { id }
                    }
                })

                if (existingMember) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Email already registered'
                    })
                }
            }

            return ctx.db.member.update({
                where: { id },
                data
            })
        }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        // Check if member has any active loans
        const member = await ctx.db.member.findUnique({
            where: { id: input },
            include: {
                transactions: {
                    where: { returnDate: null }
                }
            }
        })

        if (!member) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Member not found'
            })
        }

        if (member.transactions.length > 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot delete member with active loans'
            })
        }

        if (member.outstandingDebt > 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot delete member with outstanding debt'
            })
        }

        return ctx.db.member.delete({
            where: { id: input }
        })
    }),

    payDebt: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                amount: z.number().positive()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const member = await ctx.db.member.findUnique({
                where: { id: input.id }
            })

            if (!member) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Member not found'
                })
            }

            if (input.amount > member.outstandingDebt) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Payment amount exceeds outstanding debt'
                })
            }

            return ctx.db.member.update({
                where: { id: input.id },
                data: {
                    outstandingDebt: { decrement: input.amount }
                }
            })
        }),

    clearDebt: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        const member = await ctx.db.member.findUnique({
            where: { id: input }
        })

        if (!member) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Member not found'
            })
        }

        return ctx.db.member.update({
            where: { id: input },
            data: {
                outstandingDebt: 0
            }
        })
    })
})
