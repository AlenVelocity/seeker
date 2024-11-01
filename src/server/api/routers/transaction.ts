import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const DAILY_RENT_FEE = 50.0 // ₹50 per day
const LATE_FEE_MULTIPLIER = 1.5 // 50% more for late returns

export const transactionRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(
            z.object({
                page: z.number().default(1),
                limit: z.number().default(20),
                search: z.string().optional()
            })
        )
        .query(async ({ ctx, input }) => {
            const skip = (input.page - 1) * input.limit
            const where = input.search
                ? {
                      OR: [
                          { book: { title: { contains: input.search } } },
                          { member: { name: { contains: input.search } } }
                      ]
                  }
                : {}

            const [transactions, total] = await Promise.all([
                ctx.db.transaction.findMany({
                    where,
                    skip,
                    take: input.limit,
                    orderBy: { issueDate: 'desc' },
                    include: {
                        book: true,
                        member: true
                    }
                }),
                ctx.db.transaction.count({ where })
            ])

            return {
                transactions,
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    create: protectedProcedure
        .input(
            z.object({
                bookId: z.number(),
                memberId: z.number(),
                issueDate: z.date()
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if book is available
            const book = await ctx.db.book.findUnique({
                where: { id: input.bookId }
            })

            if (!book) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Book not found'
                })
            }

            if (book.quantity < 1) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Book is out of stock'
                })
            }

            // Check if member has any overdue books or owes money
            const member = await ctx.db.member.findUnique({
                where: { id: input.memberId },
                include: {
                    transactions: {
                        where: {
                            returnDate: null
                        }
                    }
                }
            })

            if (!member) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Member not found'
                })
            }

            if (member.outstandingDebt > 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Member has outstanding fees'
                })
            }

            if (member.transactions.length >= 3) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Member has reached maximum number of borrowed books'
                })
            }

            // Create transaction and update book quantity
            return ctx.db.$transaction([
                ctx.db.transaction.create({
                    data: {
                        bookId: input.bookId,
                        memberId: input.memberId,
                        issueDate: input.issueDate
                    }
                }),
                ctx.db.book.update({
                    where: { id: input.bookId },
                    data: { quantity: { decrement: 1 } }
                })
            ])
        }),

    return: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                returnDate: z.date(),
                rentFee: z.number(),
                addToDebt: z.boolean()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const transaction = await ctx.db.transaction.findUnique({
                where: { id: input.id },
                include: { book: true }
            })

            if (!transaction) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Transaction not found'
                })
            }

            if (transaction.returnDate) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Book already returned'
                })
            }

            // Perform the transaction update and book quantity update
            const [updatedTransaction] = await ctx.db.$transaction([
                ctx.db.transaction.update({
                    where: { id: input.id },
                    data: {
                        returnDate: input.returnDate,
                        rentFee: input.rentFee
                    }
                }),
                ctx.db.book.update({
                    where: { id: transaction.bookId },
                    data: { quantity: { increment: 1 } }
                })
            ])

            // Update member's debt separately if needed
            if (input.addToDebt) {
                await ctx.db.member.update({
                    where: { id: transaction.memberId },
                    data: { outstandingDebt: { increment: input.rentFee } }
                })
            }

            return updatedTransaction
        }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        const transaction = await ctx.db.transaction.findUnique({
            where: { id: input }
        })

        if (!transaction) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Transaction not found'
            })
        }

        if (!transaction.returnDate) {
            // If book hasn't been returned, restore the quantity
            await ctx.db.book.update({
                where: { id: transaction.bookId },
                data: { quantity: { increment: 1 } }
            })
        }

        return ctx.db.transaction.delete({
            where: { id: input }
        })
    }),

    getRecent: protectedProcedure
        .input(
            z.object({
                limit: z.number().default(5)
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.db.transaction.findMany({
                take: input.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    book: true,
                    member: true
                }
            })
        }),

    getMonthlyData: protectedProcedure.query(async ({ ctx }) => {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1)
        const months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(new Date().getFullYear(), i, 1)
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                start: new Date(date.getFullYear(), date.getMonth(), 1),
                end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
            }
        })

        const monthlyData = await Promise.all(
            months.map(async (month) => {
                const [loans, returns] = await Promise.all([
                    // Count new loans in this month
                    ctx.db.transaction.count({
                        where: {
                            issueDate: {
                                gte: month.start,
                                lte: month.end
                            }
                        }
                    }),
                    // Count returns in this month
                    ctx.db.transaction.count({
                        where: {
                            returnDate: {
                                gte: month.start,
                                lte: month.end
                            }
                        }
                    })
                ])

                return {
                    name: month.name,
                    loans,
                    returns
                }
            })
        )

        return monthlyData
    })
})
