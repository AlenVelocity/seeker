import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

type FrappeBook = {
    bookID: string
    title: string
    authors: string
    average_rating: string
    isbn: string
    isbn13: string
    language_code: string
    num_pages: string
    ratings_count: string
    text_reviews_count: string
    publication_date: string
    publisher: string
}

export const bookRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
        return ctx.db.book.findUnique({ where: { id: input } })
    }),

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
                          { title: { contains: input.search } },
                          { author: { contains: input.search } },
                          { isbn: { contains: input.search } }
                      ]
                  }
                : {}

            const [books, total] = await Promise.all([
                ctx.db.book.findMany({
                    where,
                    skip,
                    take: input.limit,
                    orderBy: { updatedAt: 'desc' }
                }),
                ctx.db.book.count({ where })
            ])

            return {
                books,
                total,
                pages: Math.ceil(total / input.limit)
            }
        }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                author: z.string(),
                isbn: z.string(),
                quantity: z.number().min(0),
                publisher: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existingBook = await ctx.db.book.findUnique({
                where: { isbn: input.isbn }
            })

            if (existingBook) {
                return ctx.db.book.update({
                    where: { isbn: input.isbn },
                    data: {
                        quantity: { increment: input.quantity }
                    }
                })
            }

            return ctx.db.book.create({
                data: input
            })
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                title: z.string().optional(),
                author: z.string().optional(),
                isbn: z.string().optional(),
                quantity: z.number().min(0).optional(),
                publisher: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return ctx.db.book.update({
                where: { id },
                data
            })
        }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        return ctx.db.book.delete({
            where: { id: input }
        })
    }),

    searchFromFrappe: protectedProcedure
        .input(
            z.object({
                title: z.string().optional(),
                authors: z.string().optional(),
                isbn: z.string().optional(),
                publisher: z.string().optional(),
                page: z.number().default(1)
            })
        )
        .query(async ({ ctx, input }) => {
            const params = new URLSearchParams()
            if (input.title) params.append('title', input.title)
            if (input.authors) params.append('authors', input.authors)
            if (input.isbn) params.append('isbn', input.isbn)
            if (input.publisher) params.append('publisher', input.publisher)
            params.append('page', input.page.toString())

            const response = await fetch(`https://frappe.io/api/method/frappe-library?${params.toString()}`)
            if (!response.ok) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch books from Frappe API'
                })
            }

            const data = await response.json()
            return data.message as FrappeBook[]
        }),

    importBook: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                author: z.string(),
                isbn: z.string(),
                publisher: z.string().optional(),
                quantity: z.number().min(1).max(10)
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existingBook = await ctx.db.book.findUnique({
                where: { isbn: input.isbn }
            })

            if (existingBook) {
                return ctx.db.book.update({
                    where: { isbn: input.isbn },
                    data: {
                        quantity: { increment: input.quantity }
                    }
                })
            }

            return ctx.db.book.create({
                data: input
            })
        }),

    importMultipleBooks: protectedProcedure
        .input(
            z.array(
                z.object({
                    title: z.string(),
                    author: z.string(),
                    isbn: z.string(),
                    publisher: z.string().optional()
                })
            )
        )
        .mutation(async ({ ctx, input }) => {
            const results = await Promise.all(
                input.map(async (book) => {
                    try {
                        const existingBook = await ctx.db.book.findUnique({
                            where: { isbn: book.isbn }
                        })

                        if (existingBook) {
                            return ctx.db.book.update({
                                where: { isbn: book.isbn },
                                data: {
                                    quantity: { increment: 1 }
                                }
                            })
                        }

                        return ctx.db.book.create({
                            data: {
                                ...book,
                                quantity: 1
                            }
                        })
                    } catch (error) {
                        console.error(`Failed to import book: ${book.title}`, error)
                        return null
                    }
                })
            )

            return {
                imported: results.filter(Boolean).length,
                total: input.length
            }
        })
})
