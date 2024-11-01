import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const DAILY_RENT_FEE = 2.0 // $2 per day
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
                returnDate: z.date()
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

            // Calculate rent fee
            const daysRented = Math.ceil(
                (input.returnDate.getTime() - transaction.issueDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            const isLate = daysRented > 14 // 2 weeks rental period
            const rentFee = daysRented * DAILY_RENT_FEE * (isLate ? LATE_FEE_MULTIPLIER : 1)

            // Update transaction, book quantity, and member's outstanding fees
            return ctx.db.$transaction([
                ctx.db.transaction.update({
                    where: { id: input.id },
                    data: {
                        returnDate: input.returnDate,
                        rentFee
                    }
                }),
                ctx.db.book.update({
                    where: { id: transaction.bookId },
                    data: { quantity: { increment: 1 } }
                }),
                ctx.db.member.update({
                    where: { id: transaction.memberId },
                    data: { outstandingDebt: { increment: rentFee } }
                })
            ])
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
    })
})
